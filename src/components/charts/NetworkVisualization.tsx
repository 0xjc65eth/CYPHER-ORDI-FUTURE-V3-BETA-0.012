'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Card, Title, Text, Badge, Button } from '@tremor/react'
import { 
  RiRefreshLine, 
  RiZoomInLine, 
  RiZoomOutLine,
  RiPlayLine,
  RiPauseLine,
  RiSettings3Line,
  RiFullscreenLine,
  RiRadarLine as RiNetworkLine
} from 'react-icons/ri'

interface NetworkNode {
  id: string
  group: number
  size: number
  label: string
  value: number
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

interface NetworkLink {
  source: string | NetworkNode
  target: string | NetworkNode
  value: number
  type: string
}

interface D3Selection extends d3.Selection<any, any, any, any> {}

export function NetworkVisualization() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedVisualization, setSelectedVisualization] = useState<'bitcoin' | 'ordinals' | 'runes'>('bitcoin')
  
  // Mock data for different network types
  const generateNetworkData = (type: string) => {
    const nodes: NetworkNode[] = []
    const links: NetworkLink[] = []

    if (type === 'bitcoin') {
      // Bitcoin network visualization
      const nodeTypes = [
        { group: 1, label: 'Mining Pools', count: 8, baseSize: 20 },
        { group: 2, label: 'Exchanges', count: 12, baseSize: 15 },
        { group: 3, label: 'Wallets', count: 25, baseSize: 10 },
        { group: 4, label: 'Lightning Nodes', count: 20, baseSize: 8 }
      ]

      let nodeId = 0
      nodeTypes.forEach(type => {
        for (let i = 0; i < type.count; i++) {
          nodes.push({
            id: `node_${nodeId}`,
            group: type.group,
            size: type.baseSize + Math.random() * 10,
            label: `${type.label} ${i + 1}`,
            value: Math.random() * 1000
          })
          nodeId++
        }
      })

      // Create random links
      for (let i = 0; i < 80; i++) {
        const sourceNode = nodes[Math.floor(Math.random() * nodes.length)]
        const targetNode = nodes[Math.floor(Math.random() * nodes.length)]
        
        if (sourceNode.id !== targetNode.id) {
          links.push({
            source: sourceNode.id,
            target: targetNode.id,
            value: Math.random() * 10,
            type: 'transaction'
          })
        }
      }
    } else if (type === 'ordinals') {
      // Ordinals collection network
      const collections = [
        'Bitcoin Puppets', 'NodeMonkes', 'OCM Genesis', 'Quantum Cats',
        'Bitcoin Frogs', 'Runestones', 'OMB', 'Bitmap'
      ]

      collections.forEach((collection, i) => {
        nodes.push({
          id: `collection_${i}`,
          group: 1,
          size: 25 + Math.random() * 15,
          label: collection,
          value: 1000 + Math.random() * 5000
        })

        // Add individual ordinals
        for (let j = 0; j < 5; j++) {
          const ordinalId = `ordinal_${i}_${j}`
          nodes.push({
            id: ordinalId,
            group: 2,
            size: 8 + Math.random() * 5,
            label: `${collection} #${j + 1}`,
            value: 10 + Math.random() * 100
          })

          links.push({
            source: `collection_${i}`,
            target: ordinalId,
            value: Math.random() * 5,
            type: 'ownership'
          })
        }
      })
    } else if (type === 'runes') {
      // Runes ecosystem network
      const runeTypes = [
        { name: 'DOG•GO•TO•THE•MOON', holders: 15, volume: 1000 },
        { name: 'UNCOMMON•GOODS', holders: 12, volume: 800 },
        { name: 'RSIC•METAPROTOCOL', holders: 18, volume: 1200 },
        { name: 'BITCOIN•RUNES', holders: 10, volume: 600 }
      ]

      runeTypes.forEach((rune, i) => {
        nodes.push({
          id: `rune_${i}`,
          group: 1,
          size: 20 + (rune.volume / 100),
          label: rune.name,
          value: rune.volume
        })

        // Add holder nodes
        for (let j = 0; j < rune.holders; j++) {
          const holderId = `holder_${i}_${j}`
          nodes.push({
            id: holderId,
            group: 2,
            size: 5 + Math.random() * 8,
            label: `Holder ${j + 1}`,
            value: Math.random() * 100
          })

          links.push({
            source: `rune_${i}`,
            target: holderId,
            value: Math.random() * 10,
            type: 'holding'
          })
        }
      })
    }

    return { nodes, links }
  }

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    // Dynamic import of D3
    import('d3').then((d3) => {
      const svg = d3.select(svgRef.current)
      const container = containerRef.current!
      const width = container.clientWidth
      const height = 400

      svg.selectAll("*").remove()

      const { nodes, links } = generateNetworkData(selectedVisualization)

      // Color scheme based on groups
      const colorScheme = {
        bitcoin: ['#F7931A', '#3B82F6', '#10B981', '#8B5CF6'],
        ordinals: ['#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'],
        runes: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
      }

      const colors = colorScheme[selectedVisualization]

      // Create simulation
      const simulation = d3.forceSimulation(nodes as any)
        .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius((d: any) => d.size + 2))

      // Add zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
          g.attr("transform", event.transform)
          setZoomLevel(event.transform.k)
        })

      svg.call(zoom as any)

      // Create main group
      const g = svg.append("g")

      // Add links
      const link = g.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", "#666")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", (d: any) => Math.sqrt(d.value))

      // Add link labels for important connections
      const linkLabels = g.append("g")
        .selectAll("text")
        .data(links.filter((d: any) => d.value > 5))
        .join("text")
        .attr("font-size", "10px")
        .attr("fill", "#999")
        .attr("text-anchor", "middle")
        .text((d: any) => d.value.toFixed(1))

      // Add nodes
      const node = g.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", (d: any) => d.size)
        .attr("fill", (d: any) => colors[(d.group - 1) % colors.length])
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .call(d3.drag()
          .on("start", (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on("drag", (event, d: any) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on("end", (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          }) as any)

      // Add node labels
      const nodeLabels = g.append("g")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .attr("font-size", "12px")
        .attr("fill", "#fff")
        .text((d: any) => d.label.length > 15 ? d.label.substring(0, 15) + '...' : d.label)
        .style("pointer-events", "none")

      // Tooltip
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("z-index", "1000")

      node
        .on("mouseover", (event, d: any) => {
          tooltip
            .style("visibility", "visible")
            .html(`
              <strong>${d.label}</strong><br/>
              Group: ${d.group}<br/>
              Value: ${d.value.toFixed(2)}<br/>
              Connections: ${links.filter(l => (l.source as any).id === d.id || (l.target as any).id === d.id).length}
            `)
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px")
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden")
        })

      // Animation loop
      let animationFrame: number
      const tick = () => {
        link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y)

        linkLabels
          .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
          .attr("y", (d: any) => (d.source.y + d.target.y) / 2)

        node
          .attr("cx", (d: any) => d.x)
          .attr("cy", (d: any) => d.y)

        nodeLabels
          .attr("x", (d: any) => d.x)
          .attr("y", (d: any) => d.y)

        if (isAnimating && simulation.alpha() > 0.01) {
          animationFrame = requestAnimationFrame(tick)
        }
      }

      simulation.on("tick", tick)

      // Cleanup
      return () => {
        if (animationFrame) cancelAnimationFrame(animationFrame)
        tooltip.remove()
        simulation.stop()
      }
    })
  }, [selectedVisualization, isAnimating])

  const handleZoomIn = () => {
    if (svgRef.current) {
      import('d3').then((d3) => {
        d3.select(svgRef.current).transition().call(
          d3.zoom().scaleBy as any, 1.5
        )
      })
    }
  }

  const handleZoomOut = () => {
    if (svgRef.current) {
      import('d3').then((d3) => {
        d3.select(svgRef.current).transition().call(
          d3.zoom().scaleBy as any, 0.67
        )
      })
    }
  }

  const handleReset = () => {
    if (svgRef.current) {
      import('d3').then((d3) => {
        d3.select(svgRef.current).transition().call(
          d3.zoom().transform as any,
          d3.zoomIdentity
        )
      })
    }
  }

  return (
    <Card className="bg-gradient-to-br from-[#1A1A3A]/90 to-[#2A2A5A]/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <RiNetworkLine className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <Title className="text-white">Network Visualization</Title>
              <Text className="text-gray-300 text-sm capitalize">
                {selectedVisualization} Network
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              Zoom: {zoomLevel.toFixed(1)}x
            </Badge>
            
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`p-2 rounded-lg transition-colors ${
                isAnimating 
                  ? 'bg-emerald-600/50 text-emerald-300' 
                  : 'bg-gray-700/50 text-gray-400'
              }`}
            >
              {isAnimating ? <RiPauseLine className="w-4 h-4" /> : <RiPlayLine className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
            >
              <RiSettings3Line className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Network Type Selection */}
          <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1">
            {(['bitcoin', 'ordinals', 'runes'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedVisualization(type)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                  selectedVisualization === type
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-black/30 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors"
            >
              <RiZoomOutLine className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors"
            >
              <RiRefreshLine className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors"
            >
              <RiZoomInLine className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 bg-black/30 rounded-xl border border-gray-600/30">
            <Text className="text-white text-sm font-medium mb-3">Visualization Settings</Text>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text className="text-gray-400 text-xs mb-2">Node Size</Text>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  defaultValue="1"
                  className="w-full"
                />
              </div>
              <div>
                <Text className="text-gray-400 text-xs mb-2">Link Strength</Text>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.1" 
                  defaultValue="0.6"
                  className="w-full"
                />
              </div>
              <div>
                <Text className="text-gray-400 text-xs mb-2">Animation Speed</Text>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1" 
                  defaultValue="5"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Network Visualization */}
        <div 
          ref={containerRef}
          className="bg-black/20 rounded-xl border border-gray-600/30 overflow-hidden"
          style={{ height: '400px' }}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            style={{ cursor: 'grab' }}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {selectedVisualization === 'bitcoin' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#F7931A]"></div>
                <Text className="text-gray-300">Mining Pools</Text>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                <Text className="text-gray-300">Exchanges</Text>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                <Text className="text-gray-300">Wallets</Text>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
                <Text className="text-gray-300">Lightning Nodes</Text>
              </div>
            </>
          )}
          
          {selectedVisualization === 'ordinals' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
                <Text className="text-gray-300">Collections</Text>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EC4899]"></div>
                <Text className="text-gray-300">Individual Ordinals</Text>
              </div>
            </>
          )}
          
          {selectedVisualization === 'runes' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                <Text className="text-gray-300">Rune Tokens</Text>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                <Text className="text-gray-300">Holders</Text>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}