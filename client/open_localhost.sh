#!/bin/bash
echo "Opening http://localhost:3000"
# Check the OS and use the appropriate command
if command -v xdg-open > /dev/null; then
  # Linux
  xdg-open http://localhost:3000
elif command -v open > /dev/null; then
  # macOS
  open http://localhost:3000
elif command -v start > /dev/null; then
  # Windows using Git Bash or WSL
  start http://localhost:3000
else
  echo "Could not detect OS or supported browser command."
fi