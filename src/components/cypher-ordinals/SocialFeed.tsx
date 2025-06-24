'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Heart, MessageCircle, Repeat2, ExternalLink } from 'lucide-react'

export function SocialFeed() {
  const socialPosts = [
    {
      platform: 'X',
      user: '@bitcoinmaxi',
      content: 'NodeMonkes floor price just hit new ATH! 🚀 The ordinals space is heating up',
      timestamp: '2h ago',
      engagement: { likes: 234, retweets: 56, replies: 23 },
      sentiment: 'positive'
    },
    {
      platform: 'X', 
      user: '@ordinalsalpha',
      content: 'ORDI token showing strong momentum after the latest protocol upgrade',
      timestamp: '4h ago',
      engagement: { likes: 189, retweets: 34, replies: 12 },
      sentiment: 'positive'
    },
    {
      platform: 'X',
      user: '@cryptoanalyst',
      content: 'Seeing some interesting whale movements in Bitcoin Puppets collection 👀',
      timestamp: '6h ago',
      engagement: { likes: 145, retweets: 28, replies: 31 },
      sentiment: 'neutral'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-500" />
          Feed Social
        </h2>
        <Badge variant="outline" className="text-blue-400 border-blue-400">
          Em Tempo Real
        </Badge>
      </div>

      <div className="space-y-4">
        {socialPosts.map((post, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  X
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{post.user}</span>
                    <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        post.sentiment === 'positive' ? 'border-green-500 text-green-400' :
                        post.sentiment === 'negative' ? 'border-red-500 text-red-400' :
                        'border-gray-500 text-gray-400'
                      }`}
                    >
                      {post.sentiment}
                    </Badge>
                  </div>
                  <p className="mb-3">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.engagement.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <Repeat2 className="h-4 w-4" />
                      {post.engagement.retweets}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.engagement.replies}
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}