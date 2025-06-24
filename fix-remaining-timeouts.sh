#!/bin/bash

echo "Fixing remaining NodeJS.Timeout issues in src directory..."

# Fix specific patterns that were missed
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/useState<NodeJS\.Timeout | null>/useState<ReturnType<typeof setInterval> | null>/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/useState<NodeJS\.Timeout>/useState<ReturnType<typeof setInterval>>/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/private [a-zA-Z]*Interval\?: NodeJS\.Timeout/private healthCheckInterval?: ReturnType<typeof setInterval>/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/private [a-zA-Z]*Interval: NodeJS\.Timeout/private healthCheckInterval: ReturnType<typeof setInterval>/g'

# Fix timeout patterns for setTimeout
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/useState<NodeJS\.Timeout | null>/useState<ReturnType<typeof setTimeout> | null>/g'

echo "Remaining NodeJS.Timeout references in src:"
grep -r "NodeJS\.Timeout" --include="*.ts" --include="*.tsx" src | wc -l