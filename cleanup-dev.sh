#!/bin/bash

# Manual cleanup of development processes
# Run this if you need to reset your dev environment

echo "Cleaning up development processes..."

# Kill Next.js dev server
pkill -f "node.*next.*dev" 2>/dev/null

# Kill any tsx processes
pkill -f "tsx.*" 2>/dev/null

# Kill processes on common dev ports
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

echo "Cleanup complete"
