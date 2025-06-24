'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, Code, Cpu, Zap, Shield, Eye, Skull, Wifi, Lock, Activity, AlertTriangle, Search } from 'lucide-react';

export default function TradingBotPage() {
  const [glitchText, setGlitchText] = useState('INITIALIZING...');
  const [matrixChars, setMatrixChars] = useState<string[]>([]);
  const [hackerLines, setHackerLines] = useState<string[]>([]);
  
  useEffect(() => {
    // Darker hacker glitch text animation
    const glitchTexts = [
      'INITIALIZING...',
      'BR34K1NG_ENCRYPT10N...',
      'INFILTR4T1NG_M4RK3TS...',
      'EXEC_D4RK_PR0T0C0L...',
      'NEURAL_H4CK_L0AD1NG...',
      'CYPH3R_1NV4S10N...',
      'SYST3M_PWN3D...',
      'QUANTUM_BR34CH...',
      'D33P_W3B_4CC3SS...',
      'CR4CK1NG_4LG0R1THMS...'
    ];
    
    const glitchInterval = setInterval(() => {
      setGlitchText(glitchTexts[Math.floor(Math.random() * glitchTexts.length)]);
    }, 1500);

    // Darker matrix rain with more symbols
    const chars = '01█▓▒░!@#$%^&*()_+-=[]{}|;:,.<>?/~`ȺȾȻĐɆȞƗɈꝀŁØƟⱣɌŦᵾɎƵ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const generateMatrixChars = () => {
      const newChars = [];
      for (let i = 0; i < 300; i++) {
        newChars.push(chars[Math.floor(Math.random() * chars.length)]);
      }
      setMatrixChars(newChars);
    };

    // Hacker terminal lines
    const hackerCommands = [
      'root@cypher:~# nmap -sS 192.168.1.0/24',
      'root@cypher:~# sqlmap -u "target.com" --dbs',
      'root@cypher:~# hydra -l admin -P pass.txt ssh://target',
      'root@cypher:~# metasploit > use exploit/multi/handler',
      'root@cypher:~# aircrack-ng -w wordlist.txt capture.cap',
      'root@cypher:~# john --wordlist=rockyou.txt hash.txt',
      'root@cypher:~# nc -lvp 4444',
      'root@cypher:~# python3 exploit.py --target market.exchange',
      'root@cypher:~# gobuster dir -u target.com -w common.txt',
      'root@cypher:~# hashcat -m 0 -a 0 hash.txt wordlist.txt'
    ];

    const updateHackerLines = () => {
      const newLines = [];
      for (let i = 0; i < 5; i++) {
        newLines.push(hackerCommands[Math.floor(Math.random() * hackerCommands.length)]);
      }
      setHackerLines(newLines);
    };

    generateMatrixChars();
    updateHackerLines();
    const matrixInterval = setInterval(generateMatrixChars, 80);
    const hackerInterval = setInterval(updateHackerLines, 3000);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(matrixInterval);
      clearInterval(hackerInterval);
    };
  }, []);

  return (
    <div className="bg-black min-h-screen relative overflow-hidden">
      {/* Dark Matrix Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-25 gap-0 h-full w-full">
          {matrixChars.map((char, index) => (
            <div
              key={index}
              className="text-red-500 font-mono text-xs animate-pulse"
              style={{
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${0.3 + Math.random() * 0.7}s`,
                filter: Math.random() > 0.5 ? 'blur(1px)' : 'none'
              }}
            >
              {char}
            </div>
          ))}
        </div>
      </div>

      {/* Blood-red scanlines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full bg-gradient-to-b from-transparent via-red-900/10 to-transparent animate-pulse"></div>
        <div className="absolute top-0 w-full h-1 bg-red-500/20 animate-ping"></div>
        <div className="absolute bottom-0 w-full h-1 bg-red-500/20 animate-ping"></div>
      </div>

      {/* Floating hacker commands */}
      <div className="absolute top-10 left-5 space-y-1 opacity-30">
        {hackerLines.map((line, index) => (
          <div key={index} className="text-red-400 font-mono text-xs animate-pulse">
            {line}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        
        {/* Dark Skull with glowing eyes */}
        <div className="mb-8 relative">
          <Skull className="w-32 h-32 text-red-600 animate-pulse drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]" />
          <div className="absolute top-6 left-8">
            <Eye className="w-4 h-4 text-red-500 animate-ping" />
          </div>
          <div className="absolute top-6 right-8">
            <Eye className="w-4 h-4 text-red-500 animate-ping" style={{animationDelay: '0.5s'}} />
          </div>
        </div>

        {/* Dark Main Title */}
        <div className="text-center mb-12">
          <h1 className="text-9xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-black animate-pulse mb-4 drop-shadow-[0_0_30px_rgba(220,38,38,0.8)]">
            DARK CYPHER
          </h1>
          <div className="text-3xl font-mono text-red-400/90 mb-8 animate-bounce tracking-wider">
            {glitchText}
          </div>
        </div>

        {/* Dark Terminal Window */}
        <div className="relative bg-black/95 border-2 border-red-600/50 rounded-lg p-8 max-w-5xl w-full backdrop-blur-sm shadow-[0_0_50px_rgba(220,38,38,0.3)]">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-red-900/20 animate-pulse"></div>
          
          <div className="relative z-10">
            {/* Dark Terminal Header */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-red-600/50">
              <Terminal className="w-6 h-6 text-red-500" />
              <span className="font-mono text-red-500 text-lg">DARK_TERMINAL_V3.6.6</span>
              <div className="flex gap-2 ml-auto">
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                <Lock className="w-4 h-4 text-red-500 animate-pulse" />
                <Wifi className="w-4 h-4 text-red-500 animate-pulse" />
              </div>
            </div>

            {/* Dark Code Lines */}
            <div className="space-y-2 font-mono text-sm">
              <div className="text-red-400/90">
                <span className="text-red-600/50">01</span> <span className="text-red-400">import</span> <span className="text-yellow-400">DarkTradingEngine</span> <span className="text-red-400">from</span> <span className="text-purple-400">'@darkweb/exploit'</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">02</span> <span className="text-red-400">import</span> <span className="text-yellow-400">QuantumExploit</span> <span className="text-red-400">from</span> <span className="text-purple-400">'@shadow/breach'</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">03</span> <span className="text-red-400">import</span> <span className="text-yellow-400">MarketInfiltrator</span> <span className="text-red-400">from</span> <span className="text-purple-400">'@blackhat/pwn'</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">04</span> <span className="text-red-400">import</span> <span className="text-yellow-400">NeuralHacker</span> <span className="text-red-400">from</span> <span className="text-purple-400">'@darknet/ai'</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">05</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">06</span> <span className="text-orange-400">class</span> <span className="text-yellow-400">DarkCypherBot</span> <span className="text-red-400">{'{'}</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">07</span>   <span className="text-pink-400">constructor</span><span className="text-red-400">()</span> <span className="text-red-400">{'{'}</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">08</span>     <span className="text-cyan-400">this</span><span className="text-red-400">.</span><span className="text-yellow-400">darkEngine</span> <span className="text-red-400">=</span> <span className="text-cyan-400">new</span> <span className="text-yellow-400">DarkTradingEngine</span><span className="text-red-400">()</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">09</span>     <span className="text-cyan-400">this</span><span className="text-red-400">.</span><span className="text-yellow-400">exploit</span> <span className="text-red-400">=</span> <span className="text-cyan-400">new</span> <span className="text-yellow-400">QuantumExploit</span><span className="text-red-400">()</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">10</span>     <span className="text-cyan-400">this</span><span className="text-red-400">.</span><span className="text-yellow-400">infiltrator</span> <span className="text-red-400">=</span> <span className="text-cyan-400">new</span> <span className="text-yellow-400">MarketInfiltrator</span><span className="text-red-400">()</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">11</span>     <span className="text-cyan-400">this</span><span className="text-red-400">.</span><span className="text-yellow-400">neural</span> <span className="text-red-400">=</span> <span className="text-cyan-400">new</span> <span className="text-yellow-400">NeuralHacker</span><span className="text-red-400">()</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">12</span>   <span className="text-red-400">{'}'}</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">13</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">14</span>   <span className="text-pink-400">async</span> <span className="text-yellow-400">initiateDarkProtocol</span><span className="text-red-400">()</span> <span className="text-red-400">{'{'}</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">15</span>     <span className="text-gray-400">// Infiltrating market systems...</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">16</span>     <span className="text-pink-400">await</span> <span className="text-cyan-400">this</span><span className="text-red-400">.</span><span className="text-yellow-400">darkEngine</span><span className="text-red-400">.</span><span className="text-yellow-400">breachSecurity</span><span className="text-red-400">()</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">17</span>     <span className="text-pink-400">await</span> <span className="text-cyan-400">this</span><span className="text-red-400">.</span><span className="text-yellow-400">exploit</span><span className="text-red-400">.</span><span className="text-yellow-400">scanVulnerabilities</span><span className="text-red-400">()</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">18</span>     <span className="text-pink-400">await</span> <span className="text-cyan-400">this</span><span className="text-red-400">.</span><span className="text-yellow-400">infiltrator</span><span className="text-red-400">.</span><span className="text-yellow-400">deployPayload</span><span className="text-red-400">()</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">19</span>     <span className="text-pink-400">await</span> <span className="text-cyan-400">this</span><span className="text-red-400">.</span><span className="text-yellow-400">neural</span><span className="text-red-400">.</span><span className="text-yellow-400">establishBackdoor</span><span className="text-red-400">()</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">20</span>   <span className="text-red-400">{'}'}</span>
              </div>
              <div className="text-red-400/90">
                <span className="text-red-600/50">21</span> <span className="text-red-400">{'}'}</span>
              </div>
            </div>

            {/* Dark Status Indicators */}
            <div className="mt-8 grid grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 bg-red-600/20 border border-red-600/50 rounded">
                <Search className="w-5 h-5 text-red-400 animate-spin" />
                <div>
                  <div className="text-red-400 font-mono text-sm">SCANNING</div>
                  <div className="text-red-400/60 font-mono text-xs">FINDING TARGETS...</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-red-600/20 border border-red-600/50 rounded">
                <Activity className="w-5 h-5 text-red-400 animate-pulse" />
                <div>
                  <div className="text-red-400 font-mono text-sm">EXPLOITING</div>
                  <div className="text-red-400/60 font-mono text-xs">BREACHING SYSTEMS...</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-red-600/20 border border-red-600/50 rounded">
                <Lock className="w-5 h-5 text-red-400 animate-bounce" />
                <div>
                  <div className="text-red-400 font-mono text-sm">ENCRYPTING</div>
                  <div className="text-red-400/60 font-mono text-xs">SECURING PAYLOAD...</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-red-600/20 border border-red-600/50 rounded">
                <Skull className="w-5 h-5 text-red-400 animate-pulse" />
                <div>
                  <div className="text-red-400 font-mono text-sm">DEPLOYING</div>
                  <div className="text-red-400/60 font-mono text-xs">LAUNCHING ATTACK...</div>
                </div>
              </div>
            </div>

            {/* Dark Progress Bar */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-400 font-mono text-sm">INFILTRATION PROGRESS</span>
                <span className="text-red-400 font-mono text-sm">66.6%</span>
              </div>
              <div className="w-full bg-gray-900 border border-red-600/30 rounded-full h-3">
                <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 h-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" style={{width: '66.6%'}}></div>
              </div>
            </div>

            {/* Dark Features Section */}
            <div className="mt-8 p-6 bg-gray-900/70 border border-red-600/30 rounded shadow-[0_0_20px_rgba(220,38,38,0.2)]">
              <h3 className="text-red-400 font-mono text-xl mb-6 flex items-center gap-3">
                <Skull className="w-6 h-6" />
                COMING SOON TO THE SHADOWS...
              </h3>
              <div className="grid grid-cols-2 gap-4 text-red-400/90 font-mono text-sm">
                <div>• DARK WEB MARKET INFILTRATION</div>
                <div>• QUANTUM ENCRYPTION BREAKING</div>
                <div>• NEURAL NETWORK EXPLOITATION</div>
                <div>• ADVANCED STEGANOGRAPHY TRADING</div>
                <div>• MULTI-EXCHANGE VULNERABILITY SCANNING</div>
                <div>• AI-POWERED SOCIAL ENGINEERING</div>
                <div>• ZERO-DAY ARBITRAGE EXPLOITS</div>
                <div>• BLOCKCHAIN FORENSICS EVASION</div>
              </div>
            </div>

            {/* Warning Section */}
            <div className="mt-6 p-4 bg-red-900/30 border border-red-600/50 rounded flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
              <div className="text-red-400 font-mono text-sm">
                <strong>WARNING:</strong> UNAUTHORIZED ACCESS DETECTED. DEPLOYING COUNTERMEASURES...
              </div>
            </div>
          </div>
        </div>

        {/* Dark Footer */}
        <div className="mt-8 text-red-400/60 font-mono text-sm text-center">
          <div className="animate-pulse">
            DARK CYPHER PROTOCOL © 2025 | OPERATING FROM THE SHADOWS
          </div>
          <div className="text-red-600/40 text-xs mt-2">
            "In the darkness, we find opportunity"
          </div>
        </div>
      </div>
    </div>
  );
}