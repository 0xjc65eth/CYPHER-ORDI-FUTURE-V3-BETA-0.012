# CLAUDE.md - CYPHER ORDi Future V3

## Project Context
This is CYPHER ORDi Future V3 - Beta 0.012, a Bloomberg Terminal style cryptocurrency trading dashboard with advanced Bitcoin, Ordinals, and Runes trading capabilities.

## Current Version Status
- **Version**: Beta 0.012
- **Date**: June 13, 2025
- **Status**: ✅ FULLY OPERATIONAL
- **Server**: http://localhost:4444
- **Branch**: bloomberg-terminal-restored-fixed

## Key Features Implemented
### Bloomberg Terminal Dashboard
- Real-time market data (Bitcoin, Ethereum, Solana)
- Mining network metrics and statistics
- Lightning Network data integration
- Live transaction activity feed
- Professional terminal UI with orange/black theme

### Portfolio Management
- Xverse wallet integration
- Bitcoin balance and transaction history
- Ordinals and inscriptions viewing
- Portfolio analytics and performance tracking

### CYPHER AI Analytics
- Market sentiment analysis
- Trading opportunity detection
- Risk assessment algorithms
- Performance metrics and reporting

### Security Features
- Enhanced wallet security protocols
- Safe transaction signing
- Address validation and sanitization
- Wallet provider conflict resolution

## Technical Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Bloomberg Terminal theme
- **State Management**: React Query + Zustand
- **Wallet Integration**: Xverse, LaserEyes
- **APIs**: CoinGecko, Hiro, Mempool.space, BlockCypher

## Critical Fixes Applied
1. **BigInt Serialization**: Enhanced conversion and error handling
2. **Wallet Security**: HTTPS development skip and safe contexts
3. **Logger System**: Proper exports and enhanced functionality
4. **Hydration Errors**: Safe component mounting and context wrappers
5. **Performance**: Optimized loading states and error boundaries

## Development Commands
```bash
npm run dev        # Start development server on port 4444
npm run build      # Build for production
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

## Important Notes for Claude
- This project requires careful handling of wallet integrations
- Always test changes on localhost:4444 before deployment
- Maintain Bloomberg Terminal UI consistency
- Follow security best practices for wallet operations
- Use the enhanced logging system for debugging

## Recent Commits Restored
- 902aece5777f55db083ba9998f2679bf31956b11: Bloomberg Terminal fixes
- 7d01f1814fb8774ba76dc2fa3e17ecffd48baf97: Documentation backup

## File Structure Priority
```
src/
├── app/                    # Next.js App Router
├── components/            # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── services/             # API services
└── types/                # TypeScript definitions
```

## Testing Protocol
1. Server starts without errors ✅
2. Dashboard loads with real data ✅
3. Portfolio page functional ✅
4. No console errors ✅
5. Wallet integration working ✅

---
**Last Updated**: June 13, 2025 21:30
**Maintained by**: Claude Code Assistant