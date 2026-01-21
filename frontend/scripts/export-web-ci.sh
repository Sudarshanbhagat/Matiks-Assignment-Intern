#!/usr/bin/env bash
set -euo pipefail

# Determine a valid HTTPS public URL for expo export when running on CI.
# Netlify provides DEPLOY_PRIME_URL or DEPLOY_URL; prefer DEPLOY_PRIME_URL.
PUBLIC_URL="${DEPLOY_PRIME_URL:-${DEPLOY_URL:-}}"

# Fallback to a safe placeholder if neither is set.
if [ -z "$PUBLIC_URL" ]; then
  PUBLIC_URL="https://example.com"
fi

echo "Using public URL: $PUBLIC_URL"

# Run the export non-interactively with the chosen public URL.
npx expo export --platform web --output-dir dist --public-url "$PUBLIC_URL"
