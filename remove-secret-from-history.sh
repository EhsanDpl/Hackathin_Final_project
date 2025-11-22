#!/bin/bash
# Script to remove API key from git history
# WARNING: This rewrites git history. Use with caution!

echo "⚠️  WARNING: This will rewrite git history!"
echo "Make sure you have a backup of your repository."
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

# The API key to remove (replace with your actual key)
# IMPORTANT: Replace YOUR_API_KEY_HERE with the actual key you want to remove
SECRET="YOUR_API_KEY_HERE"

echo "Removing secret from git history..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch docker-compose.yml skillpilot-mock-server/docker-compose.yml 2>/dev/null || true && \
   git checkout HEAD -- docker-compose.yml skillpilot-mock-server/docker-compose.yml && \
   sed -i '' 's/$SECRET/REMOVED_SECRET/g' docker-compose.yml skillpilot-mock-server/docker-compose.yml 2>/dev/null || \
   sed -i 's/$SECRET/REMOVED_SECRET/g' docker-compose.yml skillpilot-mock-server/docker-compose.yml 2>/dev/null || true" \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "✅ Git history rewritten. The secret has been removed."
echo ""
echo "Next steps:"
echo "1. Review the changes: git log --all"
echo "2. Force push to remote: git push --force --all"
echo "3. WARNING: Force push will overwrite remote history!"
