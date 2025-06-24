# Runes Advanced Tables System

Sistema completo de tabelas avançadas para dados de mercado Runes com funcionalidades profissionais e design Bloomberg Terminal.

## 🚀 Funcionalidades

### 📊 Tabelas Implementadas

1. **TopRunesTable** - Ranking por market cap
2. **HoldersTable** - Top holders com distribuição
3. **RecentTransactionsTable** - Transações em tempo real
4. **MarketMoversTable** - Maiores valorizações/desvalorizações

### ⚡ Funcionalidades Avançadas

- ✅ Ordenação por colunas (clicável)
- ✅ Paginação com lazy loading
- ✅ Filtros por valor, tempo, tipo
- ✅ Export para CSV/Excel/JSON
- ✅ Search/busca em tempo real
- ✅ Cache inteligente com SWR
- ✅ Atualização automática a cada 30s
- ✅ Loading states com skeletons
- ✅ Responsive design
- ✅ Hover effects e animações
- ✅ Cores condicionais (verde/vermelho)

## 🎨 Design

- **Bloomberg Terminal Theme** - Estilo profissional com cores características
- **Monospace Fonts** - Para dados numéricos
- **Terminal Effects** - Bordas e sombras com glow
- **Responsive Layout** - Funciona em todos os dispositivos
- **Dark Theme** - Otimizado para uso prolongado

## 📋 Componentes

### BaseTable
Componente base reutilizável para todas as tabelas.

```tsx
import { BaseTable } from '@/components/runes/tables';

<BaseTable
  data={data}
  columns={columns}
  loading={isLoading}
  error={error}
  sortConfig={sortConfig}
  pagination={pagination}
  onSort={handleSort}
  onPageChange={handlePageChange}
  onExport={handleExport}
/>
```

### TopRunesTable
Tabela de ranking por market cap.

```tsx
import { TopRunesTable } from '@/components/runes/tables';

<TopRunesTable
  autoRefresh={true}
  onRuneSelect={(runeId) => console.log('Selected:', runeId)}
/>
```

### HoldersTable
Análise de distribuição de holders.

```tsx
import { HoldersTable } from '@/components/runes/tables';

<HoldersTable
  runeId="example-rune-id"
  runeName="Example Rune"
  runeSymbol="EXAMPLE"
  autoRefresh={true}
  onAddressSelect={(address) => console.log('Address:', address)}
/>
```

### RecentTransactionsTable
Monitor de transações em tempo real.

```tsx
import { RecentTransactionsTable } from '@/components/runes/tables';

<RecentTransactionsTable
  autoRefresh={true}
  runeFilter="EXAMPLE"
  onTransactionSelect={(txHash) => console.log('TX:', txHash)}
  onAddressSelect={(address) => console.log('Address:', address)}
/>
```

### MarketMoversTable
Top gainers e losers.

```tsx
import { MarketMoversTable } from '@/components/runes/tables';

<MarketMoversTable
  autoRefresh={true}
  onRuneSelect={(runeId) => console.log('Mover:', runeId)}
/>
```

### RunesTablesDemo
Demo completo integrando todas as tabelas.

```tsx
import { RunesTablesDemo } from '@/components/runes/tables';

<RunesTablesDemo className="min-h-screen" />
```

### BloombergTableStyles
Wrapper com estilos Bloomberg Terminal.

```tsx
import { BloombergTableStyles, TopRunesTable } from '@/components/runes/tables';

<BloombergTableStyles>
  <TopRunesTable />
</BloombergTableStyles>
```

## 🔧 Hooks Customizados

### useTopRunesTable
```tsx
const {
  data,
  total,
  pagination,
  filters,
  isLoading,
  error,
  updateFilters,
  updateSort,
  goToPage,
  refresh
} = useTopRunesTable({
  autoRefresh: true,
  refreshInterval: 30000
});
```

### useHoldersTable
```tsx
const holdersData = useHoldersTable(runeId, {
  autoRefresh: true,
  refreshInterval: 60000
});
```

### useRecentTransactionsTable
```tsx
const transactionsData = useRecentTransactionsTable({
  autoRefresh: true,
  refreshInterval: 15000
});
```

### useMarketMoversTable
```tsx
const moversData = useMarketMoversTable({
  autoRefresh: true,
  refreshInterval: 60000
});
```

### useTableExport
```tsx
const { exportToCSV, exportToJSON } = useTableExport();

// Export data
exportToCSV(data, 'runes-data.csv');
exportToJSON(data, 'runes-data.json');
```

## 📊 Tipos TypeScript

### RuneTokenData
```typescript
interface RuneTokenData {
  id: string;
  name: string;
  symbol: string;
  marketCap: number;
  price: number;
  priceChange24h: number;
  volume24h: number;
  supply: number;
  holders: number;
  rank: number;
  logo?: string;
  // ... mais campos
}
```

### TableFilters
```typescript
interface TableFilters {
  search?: string;
  minMarketCap?: number;
  maxMarketCap?: number;
  minPrice?: number;
  maxPrice?: number;
  timeframe?: '1h' | '24h' | '7d' | '30d';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
```

## 🔌 Integração com APIs

### APIs Necessárias
As tabelas esperam os seguintes endpoints:

```
GET /api/runes/top?limit=50&offset=0&sortBy=marketCap&sortOrder=desc
GET /api/runes/{id}/holders?limit=50&offset=0
GET /api/runes/transactions?timeframe=24h&limit=100
GET /api/runes/market-movers?timeframe=24h
```

### Exemplo de Resposta
```json
{
  "data": [
    {
      "id": "rune-1",
      "name": "Example Rune",
      "symbol": "EXAMPLE",
      "marketCap": 1000000,
      "price": 0.001,
      "priceChange24h": 5.5,
      "volume24h": 50000,
      "supply": 1000000000,
      "holders": 1500,
      "rank": 1
    }
  ],
  "total": 1000,
  "page": 1,
  "pageSize": 50,
  "timestamp": "2025-06-22T20:00:00Z"
}
```

## 🎯 Cache e Performance

- **SWR Integration** - Cache inteligente com revalidação
- **Deduping** - Evita requisições duplicadas
- **Background Updates** - Atualiza dados em background
- **Error Retry** - Retry automático em caso de erro
- **Stale While Revalidate** - Mostra dados cached enquanto atualiza

### Configuração de Cache
```tsx
const config = {
  refreshInterval: 30000,      // 30 segundos
  revalidateOnFocus: false,    // Não revalida ao focar
  dedupingInterval: 5000,      // 5 segundos de dedup
  errorRetryCount: 3,          // 3 tentativas
  staleTime: 10000            // 10 segundos stale
};
```

## 📱 Responsividade

As tabelas são completamente responsivas:

- **Desktop** - Layout completo com todas as colunas
- **Tablet** - Layout adaptado com colunas essenciais
- **Mobile** - Layout vertical com cards

## 🎨 Personalização

### Cores e Temas
```css
:root {
  --bloomberg-bg: #000000;
  --bloomberg-surface: #1a1a1a;
  --bloomberg-orange: #ff8c00;
  --bloomberg-green: #00ff00;
  --bloomberg-red: #ff0000;
  --bloomberg-blue: #0080ff;
}
```

### Customizar Colunas
```tsx
const customColumns: TableColumn[] = [
  {
    key: 'rank',
    label: '#',
    sortable: true,
    width: '60px',
    align: 'center'
  },
  {
    key: 'price',
    label: 'Price',
    sortable: true,
    format: 'currency',
    align: 'right'
  }
];
```

## 🚀 Como Usar

1. **Instalação**
```bash
npm install swr
```

2. **Import dos Componentes**
```tsx
import {
  TopRunesTable,
  HoldersTable,
  RecentTransactionsTable,
  MarketMoversTable,
  BloombergTableStyles
} from '@/components/runes/tables';
```

3. **Uso Básico**
```tsx
function MyDashboard() {
  return (
    <BloombergTableStyles>
      <div className="space-y-6">
        <TopRunesTable autoRefresh />
        <RecentTransactionsTable autoRefresh />
      </div>
    </BloombergTableStyles>
  );
}
```

4. **Demo Completo**
```tsx
import { RunesTablesDemo } from '@/components/runes/tables';

function App() {
  return <RunesTablesDemo />;
}
```

## 🔧 APIs Mock para Desenvolvimento

Para desenvolvimento, você pode usar dados mock:

```tsx
// Mock data para desenvolvimento
const mockRunesData = {
  data: [
    {
      id: 'rune-1',
      name: 'Example Rune',
      symbol: 'EXAMPLE',
      marketCap: 1000000,
      price: 0.001,
      priceChange24h: 5.5,
      // ... outros campos
    }
  ],
  total: 100,
  page: 1,
  pageSize: 50,
  timestamp: new Date().toISOString()
};
```

## 📋 Checklist de Implementação

- ✅ BaseTable com funcionalidades core
- ✅ TopRunesTable com ranking e filtros
- ✅ HoldersTable com análise de distribuição
- ✅ RecentTransactionsTable com monitoramento real-time
- ✅ MarketMoversTable com gainers/losers
- ✅ AdvancedFilters para filtragem avançada
- ✅ Hooks customizados com SWR
- ✅ Types TypeScript completos
- ✅ Export para CSV/JSON
- ✅ Loading states e error handling
- ✅ Responsive design
- ✅ Bloomberg Terminal styling
- ✅ Demo integrado
- ✅ Documentação completa

## 🎊 Resultado Final

Sistema completo de tabelas avançadas para dados Runes com:
- 4 tabelas especializadas
- Funcionalidades profissionais
- Design Bloomberg Terminal
- Performance otimizada
- TypeScript completo
- Documentação detalhada

Pronto para uso em produção! 🚀