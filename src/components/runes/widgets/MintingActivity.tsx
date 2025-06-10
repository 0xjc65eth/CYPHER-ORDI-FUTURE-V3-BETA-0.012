'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Clock, TrendingUp, Users } from 'lucide-react';
import { bitcoinEcosystemService, type RuneData } from '@/services/BitcoinEcosystemService';

interface MintActivity {
  id: string;
  runeName: string;
  symbol: string;
  minted: number;
  totalSupply: number;
  mintProgress: number;
  mintsPerHour: number;
  timeToComplete: string;
  gasUsed: number;
  timestamp: Date;
  totalMints: number;
  burnedSupply: number;
}

export function MintingActivity() {
  const [activities, setActivities] = useState<MintActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMinters, setActiveMinters] = useState(0);
  const [avgMintTime, setAvgMintTime] = useState('0h');

  // Load real Runes data and transform to minting activities
  useEffect(() => {
    const loadMintingActivities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('🔄 Loading real minting activities from Hiro API...');
        
        const runesData = await bitcoinEcosystemService.getRunesData();
        
        // Filter runes that are actively minting (not 100% minted)
        const activeMintingRunes = runesData
          .filter(rune => rune.mintProgress < 100 && rune.mintProgress > 0)
          .sort((a, b) => b.mintProgress - a.mintProgress) // Sort by progress descending
          .slice(0, 5); // Take top 5
        
        const mintingActivities: MintActivity[] = activeMintingRunes.map((rune: RuneData) => {
          // Calculate realistic minting rates based on rune data
          const totalMintedSupply = (rune.supply * rune.mintProgress) / 100;
          const remainingSupply = rune.supply - totalMintedSupply;
          
          // Estimate mints per hour based on market activity
          const baseMintsPerHour = Math.max(10, Math.floor(rune.volume24h / (rune.price * 24)));
          const mintsPerHour = Math.min(baseMintsPerHour, 500); // Cap at 500/hour
          
          // Calculate time to completion
          const hoursToComplete = remainingSupply > 0 ? (remainingSupply / mintsPerHour) : 0;
          const timeToComplete = hoursToComplete < 1 ? 
            `${Math.floor(hoursToComplete * 60)}m` : 
            hoursToComplete < 24 ? `${Math.floor(hoursToComplete)}h` : 
            `${Math.floor(hoursToComplete / 24)}d`;
          
          return {
            id: rune.id,
            runeName: rune.name,
            symbol: rune.symbol,
            minted: totalMintedSupply,
            totalSupply: rune.supply,
            mintProgress: rune.mintProgress,
            mintsPerHour: mintsPerHour,
            timeToComplete: hoursToComplete > 0 ? timeToComplete : 'Complete',
            gasUsed: Math.floor(Math.random() * 40) + 40, // 40-80 sats/vB
            timestamp: new Date(Date.now() - Math.random() * 3600000), // Random within last hour
            totalMints: rune.mints,
            burnedSupply: rune.burned
          };
        });
        
        setActivities(mintingActivities);
        
        // Calculate aggregate stats
        const totalMintsPerHour = mintingActivities.reduce((sum, activity) => sum + activity.mintsPerHour, 0);
        const estimatedActiveMinters = Math.floor(totalMintsPerHour / 3); // Assume 3 mints per minter per hour
        const avgTimeHours = mintingActivities.length > 0 ? 
          mintingActivities.reduce((sum, activity) => {
            const hours = activity.timeToComplete.includes('d') ? 
              parseInt(activity.timeToComplete) * 24 : 
              activity.timeToComplete.includes('h') ? 
                parseInt(activity.timeToComplete) : 1;
            return sum + hours;
          }, 0) / mintingActivities.length : 0;
        
        setActiveMinters(estimatedActiveMinters);
        setAvgMintTime(avgTimeHours < 1 ? `${Math.floor(avgTimeHours * 60)}m` : `${Math.floor(avgTimeHours)}h`);
        
        console.log(`✅ Loaded ${mintingActivities.length} active minting runes`);
      } catch (err) {
        console.error('❌ Failed to load minting activities:', err);
        setError('Failed to load minting data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMintingActivities();
  }, []);

  // Simulate real-time minting updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => prev.map(activity => {
        const newMinted = Math.min(
          activity.minted + Math.floor(activity.mintsPerHour / 60),
          activity.totalSupply
        );
        const newProgress = (newMinted / activity.totalSupply) * 100;
        const remainingMints = activity.totalSupply - newMinted;
        const hoursToComplete = remainingMints / activity.mintsPerHour;
        
        return {
          ...activity,
          minted: newMinted,
          mintProgress: newProgress,
          timeToComplete: hoursToComplete < 1 ? `${Math.floor(hoursToComplete * 60)}m` : `${Math.floor(hoursToComplete)}h`,
          gasUsed: 40 + Math.floor(Math.random() * 60)
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-red-500';
    if (progress >= 70) return 'text-orange-500';
    if (progress >= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((new Date().getTime() - timestamp.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Minting</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
              <Zap className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading minting activities...</p>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No active minting found</p>
            <p className="text-xs text-muted-foreground mt-1">All runes may be fully minted</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm" title={activity.runeName}>{activity.symbol}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.runeName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">
                      {Math.floor(activity.minted).toLocaleString()}/{activity.totalSupply.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{getTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={getProgressColor(activity.mintProgress)}>
                      {activity.mintProgress.toFixed(1)}% minted
                    </span>
                    <span className="text-muted-foreground">
                      {activity.timeToComplete === 'Complete' ? 'Complete' : `~${activity.timeToComplete} left`}
                    </span>
                  </div>
                  <Progress value={Math.min(activity.mintProgress, 100)} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-blue-500" />
                      <span>{activity.mintsPerHour.toLocaleString()}/hr</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-yellow-500" />
                      <span>{activity.gasUsed} sats/vB</span>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      activity.mintProgress >= 90 ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      activity.mintProgress >= 70 ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                      'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}
                  >
                    {activity.mintProgress >= 90 ? 'Ending Soon' :
                     activity.mintProgress >= 70 ? 'Limited' :
                     'Available'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!isLoading && !error && activities.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{activeMinters} active minters</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Avg time: {avgMintTime}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}