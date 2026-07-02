#!/bin/bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
cd "$(dirname "$0")"
echo "Node version: $(node -v)"
exec npx next dev -p 3001
