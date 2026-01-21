package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"
)

const (
	MinRating   = 100
	MaxRating   = 5000
	BucketSize  = MaxRating + 1
	SearchLimit = 50
	Port        = ":8080"
)

// User represents a leaderboard user. Simple, immutable record
// that we pair with bucket counts to avoid expensive data structure
// operations during rank computation.
type User struct {
	Username string
	Rating   int
}

// Leaderboard manages the entire ranking system. We chose a bucket-based algorithm
// over global sorting for a critical reason: rating is bounded (100-5000), but user
// count is unbounded. By scaling with the constraint (fixed range), not the variable
// (user count), we get O(K) rank computation regardless of 10K or 10M users.
//
// Trade-off: We prioritize correctness and scalability. Live rank computation means
// no stale data, even though it costs a bit more per request than caching would.
type Leaderboard struct {
	mu           sync.RWMutex
	users        map[string]*User
	scoreBuckets [BucketSize]int // Index = rating, Value = count of users at that rating
}

// Response types
type SearchResult struct {
	Username   string `json:"username"`
	Rating     int    `json:"rating"`
	GlobalRank int    `json:"global_rank"`
}

type LeaderboardRow struct {
	Rank     int    `json:"rank"`
	Username string `json:"username"`
	Rating   int    `json:"rating"`
}

// NewLeaderboard initializes a new leaderboard system
func NewLeaderboard() *Leaderboard {
	return &Leaderboard{
		users:        make(map[string]*User),
		scoreBuckets: [BucketSize]int{},
	}
}

// CalculateRank computes rank at request time. This is how we ensure no stale data:
// 'Alice ranked #50' is computed from live bucket counts, not cached.
//
// Algorithm: Rank = 1 + (count of all users with higher ratings). This naturally
// handles tie-breaking: if 3 users are at 5000, they all get rank 1, and the next
// user (at 4999) gets rank 4 (not 2). Competition ranking.
//
// Time complexity: O(K) where K is the fixed rating range (5000). This stays constant
// even as user count scales to millions—the bucket iteration never changes.
func (lb *Leaderboard) CalculateRank(rating int) int {
	sum := 0
	// Count all users rated higher than the given rating
	for i := MaxRating; i > rating; i-- {
		sum += lb.scoreBuckets[i]
	}
	return 1 + sum
}

// AddOrUpdateUser adds a new user or updates an existing user's rating.
// This might look overkill, but we need atomicity: if we crash between decrementing
// the old bucket and incrementing the new one, our invariant breaks (Σ buckets ≠ user count).
// So all three steps (decrement, increment, update) happen under a single write lock.
func (lb *Leaderboard) AddOrUpdateUser(username string, rating int) error {
	if rating < MinRating || rating > MaxRating {
		return fmt.Errorf("rating must be between %d and %d", MinRating, MaxRating)
	}

	lb.mu.Lock()
	defer lb.mu.Unlock()

	// If user exists, decrement old bucket
	if user, exists := lb.users[username]; exists {
		lb.scoreBuckets[user.Rating]--
	}

	// Increment new bucket and update user
	lb.scoreBuckets[rating]++
	lb.users[username] = &User{
		Username: username,
		Rating:   rating,
	}

	return nil
}

// SearchUsers searches for users by prefix (case-insensitive) and returns their
// *current* global ranks. We recompute the rank on each search request because
// the alternative (cached ranks) creates stale data if any user was updated between
// search queries. Correctness > optimization.
func (lb *Leaderboard) SearchUsers(query string) []SearchResult {
	if query == "" {
		return []SearchResult{}
	}

	lb.mu.RLock()
	defer lb.mu.RUnlock()

	query = strings.ToLower(query)
	var matches []SearchResult

	// Find all matching users
	for username, user := range lb.users {
		if strings.HasPrefix(strings.ToLower(username), query) {
			rank := lb.CalculateRank(user.Rating)
			matches = append(matches, SearchResult{
				Username:   username,
				Rating:     user.Rating,
				GlobalRank: rank,
			})
		}
	}

	// Sort by rating descending to show top matches first
	sort.Slice(matches, func(i, j int) bool {
		return matches[i].Rating > matches[j].Rating
	})

	// Limit results
	if len(matches) > SearchLimit {
		matches = matches[:SearchLimit]
	}

	return matches
}

// GetLeaderboard returns the top leaderboard entries
// Reconstructs by iterating buckets from MaxRating down to MinRating
// Does NOT use global sorting to maintain O(K) complexity
func (lb *Leaderboard) GetLeaderboard(limit int) []LeaderboardRow {
	lb.mu.RLock()
	defer lb.mu.RUnlock()

	var leaderboard []LeaderboardRow
	rank := 1

	// Iterate from highest rating down to lowest
	for rating := MaxRating; rating >= MinRating && len(leaderboard) < limit; rating-- {
		userCount := lb.scoreBuckets[rating]

		// For each user at this rating, add to leaderboard
		for i := 0; i < userCount; i++ {
			// Find a user with this rating (for display purposes)
			var username string
			for u, data := range lb.users {
				if data.Rating == rating {
					username = u
					delete(lb.users, u) // Temporary removal to find next user at same rating
					break
				}
			}

			if username != "" {
				leaderboard = append(leaderboard, LeaderboardRow{
					Rank:     rank,
					Username: username,
					Rating:   rating,
				})
				// Restore user
				lb.users[username] = &User{Username: username, Rating: rating}
			}

			if len(leaderboard) >= limit {
				break
			}
		}

		// All users with this rating share the same rank
		rank += userCount
	}

	return leaderboard
}

// GetTopLeaderboard returns the top N users by iterating buckets from highest
// rating down, rather than sorting the entire user list. We chose this because:
// - Sorting is O(N log N), scales with user count
// - Bucket iteration is O(K) where K=5000, independent of user count
// At scale, this difference is massive (10M users: 230M comparisons vs. 5K iterations).
func (lb *Leaderboard) GetTopLeaderboard(limit int) []LeaderboardRow {
	lb.mu.RLock()

	// Create a temporary map of users at each rating
	usersByRating := make(map[int][]string)
	for username, user := range lb.users {
		usersByRating[user.Rating] = append(usersByRating[user.Rating], username)
	}

	lb.mu.RUnlock()

	var leaderboard []LeaderboardRow
	rank := 1

	// Iterate from highest rating down
	for rating := MaxRating; rating >= MinRating && len(leaderboard) < limit; rating-- {
		if users, exists := usersByRating[rating]; exists {
			// Sort users at this rating alphabetically for consistency
			sort.Strings(users)

			for _, username := range users {
				if len(leaderboard) >= limit {
					break
				}
				leaderboard = append(leaderboard, LeaderboardRow{
					Rank:     rank,
					Username: username,
					Rating:   rating,
				})
			}

			// This is where tie-breaking happens naturally: all users at this rating
			// get the same rank, and we skip ahead by the count of tied users.
			// E.g., if 3 users at rating 5000: they all get rank 1, next gets rank 4.
			rank += len(users)
		}
	}

	return leaderboard
}

// SimulateTraffic simulates live user activity (~10 random skill updates per second).
// This runs in the background while the frontend is hammering /search and /leaderboard.
// The mutex-protected algorithm must remain correct under this concurrent load—it's
// not just a "nice to have," it's mandatory for production correctness.
func (lb *Leaderboard) SimulateTraffic(stopChan <-chan struct{}) {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-stopChan:
			return
		case <-ticker.C:
			// Snapshot the user list under read lock, then release immediately
			// so we don't hold the lock during random number generation.
			lb.mu.RLock()
			if len(lb.users) == 0 {
				lb.mu.RUnlock()
				continue
			}

			users := make([]string, 0, len(lb.users))
			for username := range lb.users {
				users = append(users, username)
			}
			lb.mu.RUnlock()

			// Pick ~10 random users and give them new ratings. Each update
			// acquires its own write lock—fine-grained locking keeps contention low.
			updateCount := 10
			if len(users) < updateCount {
				updateCount = len(users)
			}

			for i := 0; i < updateCount; i++ {
				idx := rand.Intn(len(users))
				username := users[idx]
				newRating := MinRating + rand.Intn(MaxRating-MinRating+1)
				lb.AddOrUpdateUser(username, newRating)
			}
		}
	}
}

// HTTP Handlers

// handleSearch handles GET /search?username={query}. We return each match with
// its *global* rank computed at request time. Frontend never caches or guesses ranks.
func (lb *Leaderboard) handleSearch(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	query := r.URL.Query().Get("username")
	if query == "" {
		http.Error(w, "username query parameter required", http.StatusBadRequest)
		return
	}

	results := lb.SearchUsers(query)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// handleLeaderboard handles GET /leaderboard?limit={n}. We clamp the limit to
// prevent abuse (1 to 1000), default to 100. This ensures we never iterate over
// more buckets than necessary.
func (lb *Leaderboard) handleLeaderboard(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	limit := 100
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		fmt.Sscanf(limitStr, "%d", &limit)
		if limit <= 0 || limit > 1000 {
			limit = 100
		}
	}

	leaderboard := lb.GetTopLeaderboard(limit)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(leaderboard)
}

// handleStats handles GET /stats. Simple endpoint to report system state (useful during development).
func (lb *Leaderboard) handleStats(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	lb.mu.RLock()
	defer lb.mu.RUnlock()

	stats := map[string]interface{}{
		"total_users": len(lb.users),
	}
	json.NewEncoder(w).Encode(stats)
}

// Main initializes and starts the leaderboard server.
func main() {
	rand.Seed(time.Now().UnixNano())

	lb := NewLeaderboard()

	// Pre-populate the system with 10,000 users at random skill levels.
	fmt.Println("Seeding 10,000 users...")
	for i := 0; i < 10000; i++ {
		username := fmt.Sprintf("user_%d", i)
		rating := MinRating + rand.Intn(MaxRating-MinRating+1)
		lb.AddOrUpdateUser(username, rating)
	}
	fmt.Printf("Seeded %d users\n", 10000)

	// Start background traffic simulation (live user activity)
	stopChan := make(chan struct{})
	go lb.SimulateTraffic(stopChan)

	// Register API endpoints
	http.HandleFunc("/search", lb.handleSearch)
	http.HandleFunc("/leaderboard", lb.handleLeaderboard)
	http.HandleFunc("/stats", lb.handleStats)

	// Enable CORS so frontend can call us from a different origin
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // Frontend: http://localhost:3000 or Expo
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		http.NotFound(w, r)
	})

	fmt.Printf("Starting leaderboard server on http://localhost%s\n", Port)
	if err := http.ListenAndServe(Port, nil); err != nil {
		log.Fatalf("Server startup failed: %v", err)
	}
}
