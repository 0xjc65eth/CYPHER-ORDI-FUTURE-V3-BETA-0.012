[2025-06-10T17:01:52.054Z] [HiroAPI] Inicializado com baseURL: https://api.hiro.so

---
[2025-06-10T17:01:52.063Z] [HiroAPI] Tentativa 1/3 para: https://api.hiro.so/ordinals/v1/inscriptions?offset=0&limit=20&order=desc&order_by=number

---
[2025-06-10T17:01:52.619Z] [HiroAPI] Cache hit para: /ordinals/v1/inscriptions

---
[2025-06-10T17:02:47.411Z] [HiroAPI] Inicializado com baseURL: https://api.hiro.so

---
[2025-06-10T17:02:47.418Z] [HiroAPI] Tentativa 1/3 para: https://api.hiro.so/runes/v1/etchings?offset=0&limit=20

---
[2025-06-10T17:02:47.770Z] [HiroAPI] Cache hit para: /runes/v1/etchings

---
[2025-06-10T17:03:20.749Z] [API] Fetching runes balances for address: bc1pjck2lh7e6yav9us6k7446jtp3984dukzze4597l7mjmp5au7rsnq25t5zn, page: 0, limit: 20

---
[2025-06-10T17:03:20.750Z] [API_CACHE] Fetching from hiro:runes

---
[2025-06-10T17:03:20.974Z] [ERROR] Hiro Runes API error: 404 Not Found
{
  "stack": "Error: Hiro Runes API error: 404 Not Found\n    at fetchFromHiro (webpack-internal:///1796:37:15)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async ApiCacheManager.getWithFallback (webpack-internal:///8440:170:30)\n    at async GET (webpack-internal:///1796:245:31)\n    at async /Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:57228\n    at async eT.execute (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:46851)\n    at async eT.handle (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:58760)\n    at async doRender (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:1366:42)\n    at async cacheEntry.responseCache.get.routeKind (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:1576:40)\n    at async DevServer.renderToResponseWithComponentsImpl (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:1496:28)\n    at async DevServer.renderPageComponent (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:1924:24)\n    at async DevServer.renderToResponseImpl (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:1962:32)\n    at async DevServer.pipeImpl (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:922:25)\n    at async NextNodeServer.handleCatchallRenderRequest (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/next-server.js:272:17)\n    at async DevServer.handleRequestImpl (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:818:17)\n    at async /Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/dev/next-dev-server.js:339:20\n    at async Span.traceAsyncFn (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/trace/trace.js:154:20)\n    at async DevServer.handleRequest (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/dev/next-dev-server.js:336:24)\n    at async invokeRender (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/lib/router-server.js:178:21)\n    at async handleRequest (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/lib/router-server.js:355:24)\n    at async requestHandlerImpl (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/lib/router-server.js:379:13)\n    at async Server.requestListener (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/lib/start-server.js:141:13)",
  "context": "API Error: hiro:runes",
  "timestamp": "2025-06-10T17:03:20.974Z"
}
---
[2025-06-10T17:03:20.978Z] [Cache] Set: api:health:hiro:runes (TTL: 3600s)

---
[2025-06-10T17:03:20.979Z] [API_CACHE] Fetching from ordscan:runes

---
[2025-06-10T17:03:21.024Z] [ERROR] fetch failed
{
  "stack": "TypeError: fetch failed\n    at node:internal/deps/undici/undici:12618:11\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async fetchFromOrdScan (webpack-internal:///1796:87:22)\n    at async ApiCacheManager.getWithFallback (webpack-internal:///8440:170:30)\n    at async GET (webpack-internal:///1796:245:31)\n    at async /Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:57228\n    at async eT.execute (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:46851)\n    at async eT.handle (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:58760)\n    at async doRender (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:1366:42)\n    at async cacheEntry.responseCache.get.routeKind (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:1576:40)\n    at async DevServer.renderToResponseWithComponentsImpl (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:1496:28)\n    at async DevServer.renderPageComponent (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:1924:24)\n    at async DevServer.renderToResponseImpl (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:1962:32)\n    at async DevServer.pipeImpl (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:922:25)\n    at async NextNodeServer.handleCatchallRenderRequest (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/next-server.js:272:17)\n    at async DevServer.handleRequestImpl (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:818:17)\n    at async /Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/dev/next-dev-server.js:339:20\n    at async Span.traceAsyncFn (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/trace/trace.js:154:20)\n    at async DevServer.handleRequest (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/dev/next-dev-server.js:336:24)\n    at async invokeRender (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/lib/router-server.js:178:21)\n    at async handleRequest (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/lib/router-server.js:355:24)\n    at async requestHandlerImpl (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/lib/router-server.js:379:13)\n    at async Server.requestListener (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/lib/start-server.js:141:13)",
  "context": "API Error: ordscan:runes",
  "timestamp": "2025-06-10T17:03:21.024Z"
}
---
[2025-06-10T17:03:21.025Z] [Cache] Set: api:health:ordscan:runes (TTL: 3600s)

---
[2025-06-10T17:03:21.025Z] [ERROR] All API providers failed. Last error: fetch failed
{
  "stack": "Error: All API providers failed. Last error: fetch failed\n    at ApiCacheManager.getWithFallback (webpack-internal:///8440:187:15)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async GET (webpack-internal:///1796:245:31)\n    at async /Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:57228\n    at async eT.execute (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:46851)\n    at async eT.handle (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:6:58760)\n    at async doRender (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:1366:42)\n    at async cacheEntry.responseCache.get.routeKind (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:1576:40)\n    at async DevServer.renderToResponseWithComponentsImpl (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:1496:28)\n    at async DevServer.renderPageComponent (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:1924:24)\n    at async DevServer.renderToResponseImpl (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:1962:32)\n    at async DevServer.pipeImpl (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:922:25)\n    at async NextNodeServer.handleCatchallRenderRequest (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/next-server.js:272:17)\n    at async DevServer.handleRequestImpl (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/base-server.js:818:17)\n    at async /Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/dev/next-dev-server.js:339:20\n    at async Span.traceAsyncFn (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/trace/trace.js:154:20)\n    at async DevServer.handleRequest (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/dev/next-dev-server.js:336:24)\n    at async invokeRender (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/lib/router-server.js:178:21)\n    at async handleRequest (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/lib/router-server.js:355:24)\n    at async requestHandlerImpl (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/lib/router-server.js:379:13)\n    at async Server.requestListener (/Users/juliocesar/Desktop/CYPHER ORDI FUTURE V3/node_modules/next/dist/server/lib/start-server.js:141:13)",
  "context": "Failed to fetch runes balances with fallback",
  "timestamp": "2025-06-10T17:03:21.025Z"
}
---
[2025-06-10T17:03:21.026Z] [API] Returning mock data for runes due to provider failures

---
[2025-06-10T17:03:21.026Z] [PERFORMANCE] Runes Balance API (Mock): 277ms

---
[2025-06-10T17:05:37.677Z] [HiroAPI] Inicializado com baseURL: https://api.hiro.so

---
[2025-06-10T17:05:37.683Z] [HiroAPI] Tentativa 1/3 para: https://api.hiro.so/runes/v1/etchings?offset=0&limit=20

---
[2025-06-10T17:05:37.699Z] [HiroAPI] Cache hit para: /runes/v1/etchings

---
[2025-06-10T17:06:21.728Z] [HiroAPI] Inicializado com baseURL: https://api.hiro.so

---
[2025-06-10T17:06:21.736Z] [HiroAPI] Tentativa 1/3 para: https://api.hiro.so/runes/v1/etchings?offset=0&limit=20

---
[2025-06-10T17:06:21.755Z] [HiroAPI] Cache hit para: /runes/v1/etchings

---
