#!/bin/bash
export PATH="$HOME/.local/node-tools/node-v22.14.0-darwin-arm64/bin:$PATH"
cd "$(dirname "$0")/.."
exec npm run dev
