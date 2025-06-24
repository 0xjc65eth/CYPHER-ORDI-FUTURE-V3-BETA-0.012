#!/bin/bash

# Script to fix NodeJS.Timeout type issues
# Replace NodeJS.Timeout with proper ReturnType types

echo "Fixing NodeJS.Timeout type issues..."

# For setInterval patterns
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/: NodeJS\.Timeout\[\]/: ReturnType<typeof setInterval>\[\]/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/Map<[^,]*, NodeJS\.Timeout>/Map<string, ReturnType<typeof setInterval>>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/NodeJS\.Timeout\[\]/ReturnType<typeof setInterval>\[\]/g'

# For variables that use setInterval
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/refreshInterval.*: NodeJS\.Timeout/refreshInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/scanInterval.*: NodeJS\.Timeout/scanInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/updateInterval.*: NodeJS\.Timeout/updateInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/monitoringInterval.*: NodeJS\.Timeout/monitoringInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/heartbeatInterval.*: NodeJS\.Timeout/heartbeatInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/pingInterval.*: NodeJS\.Timeout/pingInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/collectionInterval.*: NodeJS\.Timeout/collectionInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/analyticsInterval.*: NodeJS\.Timeout/analyticsInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/detectionInterval.*: NodeJS\.Timeout/detectionInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/processInterval.*: NodeJS\.Timeout/processInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/learningInterval.*: NodeJS\.Timeout/learningInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/dataCollectionInterval.*: NodeJS\.Timeout/dataCollectionInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/correctionInterval.*: NodeJS\.Timeout/correctionInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/cloudSyncInterval.*: NodeJS\.Timeout/cloudSyncInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/cleanupInterval.*: NodeJS\.Timeout/cleanupInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/healthCheckInterval.*: NodeJS\.Timeout/healthCheckInterval: ReturnType<typeof setInterval>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/metricsInterval.*: NodeJS\.Timeout/metricsInterval: ReturnType<typeof setInterval>/g'

# For variables that use setTimeout  
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/timeout.*: NodeJS\.Timeout/timeout: ReturnType<typeof setTimeout>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/reconnectTimeout.*: NodeJS\.Timeout/reconnectTimeout: ReturnType<typeof setTimeout>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/debounceTimer.*: NodeJS\.Timeout/debounceTimer: ReturnType<typeof setTimeout>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/recoveryTimeout.*: NodeJS\.Timeout/recoveryTimeout: ReturnType<typeof setTimeout>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/retryTimeout.*: NodeJS\.Timeout/retryTimeout: ReturnType<typeof setTimeout>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/circuitBreakerTimer.*: NodeJS\.Timeout/circuitBreakerTimer: ReturnType<typeof setTimeout>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/flushTimer.*: NodeJS\.Timeout/flushTimer: ReturnType<typeof setTimeout>/g'

# For useRef patterns
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/useRef<NodeJS\.Timeout>/useRef<ReturnType<typeof setInterval>>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/useRef<NodeJS\.Timeout | null>/useRef<ReturnType<typeof setInterval> | null>/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/useRef<NodeJS\.Timeout | undefined>/useRef<ReturnType<typeof setInterval> | undefined>/g'

# Generic patterns (be more careful with these)
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/: NodeJS\.Timeout;/: ReturnType<typeof setInterval>;/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/: NodeJS\.Timeout | null/: ReturnType<typeof setInterval> | null/g'
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/: NodeJS\.Timeout | undefined/: ReturnType<typeof setInterval> | undefined/g'

echo "Fixed NodeJS.Timeout type issues!"
echo "Remaining references:"
grep -r "NodeJS\.Timeout" --include="*.ts" --include="*.tsx" . | wc -l