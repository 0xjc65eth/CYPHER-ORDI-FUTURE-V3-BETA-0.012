import { NextResponse } from 'next/server';
import { intervalManager } from '@/lib/api/interval-manager';
import { requestDeduplicator } from '@/lib/api/request-deduplicator';

export async function GET() {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Calculate memory usage in MB
    const heapUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotal = Math.round(memUsage.heapTotal / 1024 / 1024);
    const external = Math.round(memUsage.external / 1024 / 1024);
    const rss = Math.round(memUsage.rss / 1024 / 1024);

    // Get resource usage stats
    const activeIntervals = intervalManager.getActiveCount();
    const pendingRequests = requestDeduplicator.getPendingCount();
    const uptime = process.uptime();

    // Health checks
    const isHealthy = heapUsed < 500 && activeIntervals < 20 && pendingRequests < 10;
    
    const health = {
      status: isHealthy ? 'healthy' : 'warning',
      timestamp: new Date().toISOString(),
      uptime: Math.round(uptime) + 's',
      memory: {
        heapUsed: heapUsed + 'MB',
        heapTotal: heapTotal + 'MB',
        external: external + 'MB',
        rss: rss + 'MB',
        usage: Math.round((heapUsed / heapTotal) * 100) + '%'
      },
      resources: {
        activeIntervals,
        pendingRequests,
        intervalKeys: intervalManager.getActiveKeys(),
        requestKeys: requestDeduplicator.getPendingKeys()
      },
      nodeVersion: process.version,
      pid: process.pid
    };

    // Log warnings if resources are high
    if (!isHealthy) {
      console.warn('🚨 Server health warning:', {
        heapUsed,
        activeIntervals,
        pendingRequests
      });
    }

    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}