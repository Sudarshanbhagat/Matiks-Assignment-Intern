#!/bin/bash
# Build script that sets API URL for production deployment
export REACT_APP_API_BASE_URL=https://matiks-assignment-intern.onrender.com
npx expo export --platform web --output-dir dist
