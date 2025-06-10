# Enhanced UI Components

Esta biblioteca contém componentes UI avançados com animações suaves e micro-interações para a plataforma Bitcoin Analytics.

## 📦 Componentes Disponíveis

### 1. LoadingStates.tsx
Estados de carregamento elegantes com várias opções de animação.

```tsx
import { SpinnerLoader, DotsLoader, SkeletonLoader, LoadingOverlay } from '@/components/ui';

// Spinner básico
<SpinnerLoader size="md" color="primary" text="Carregando..." />

// Dots animados
<DotsLoader size="lg" color="success" />

// Skeleton para conteúdo
<SkeletonLoader variant="card" lines={3} />

// Overlay de tela cheia
<LoadingOverlay isVisible={loading} variant="wave" text="Processando dados..." />
```

**Variantes disponíveis:**
- `spinner`, `dots`, `pulse`, `wave`, `bars`, `ring`, `bounce`, `skeleton`

### 2. AnimatedCards.tsx
Cards com animações e micro-interações avançadas.

```tsx
import { AnimatedCard, HoverEffectCard, FlipCard, GlowCard } from '@/components/ui';

// Card com hover animado
<AnimatedCard variant="hover" intensity="normal">
  <h3>Bitcoin Price</h3>
  <p>$45,230.50</p>
</AnimatedCard>

// Card com efeito flip
<FlipCard
  frontContent={<div>Front Content</div>}
  backContent={<div>Back Content</div>}
  flipTrigger="hover"
/>

// Card com brilho
<GlowCard glowColor="blue" intensity="high" animated>
  <h3>Mining Stats</h3>
</GlowCard>
```

**Variantes:**
- `default`, `hover`, `glow`, `float`, `flip`, `scale`, `slide`, `rotate`

### 3. ProgressIndicators.tsx
Indicadores de progresso modernos e interativos.

```tsx
import { CircularProgress, LinearProgress, StepProgress, SkillBar } from '@/components/ui';

// Progresso circular
<CircularProgress value={75} size="lg" color="success" gradient />

// Progresso linear com gradiente
<LinearProgress value={60} variant="gradient" thickness="thick" />

// Progresso em etapas
<StepProgress
  steps={[
    { id: '1', label: 'Setup', description: 'Initial configuration' },
    { id: '2', label: 'Processing', description: 'Data processing' },
    { id: '3', label: 'Complete', description: 'Finished' }
  ]}
  currentStep={1}
  variant="horizontal"
/>

// Barra de habilidade
<SkillBar skill="Bitcoin Trading" value={85} duration={2000} />
```

### 4. InteractiveCharts.tsx
Gráficos interativos com tooltips e animações.

```tsx
import { LineChart, BarChart, PieChart, MiniChart } from '@/components/ui';

// Gráfico de linha suave
<LineChart
  data={bitcoinPriceData}
  smooth
  showPoints
  gradient
  interactive
  animated
/>

// Gráfico de barras
<BarChart
  data={volumeData}
  showValues
  gradient
  rounded
  orientation="vertical"
/>

// Gráfico de pizza
<PieChart
  data={portfolioData}
  showLabels
  showPercentages
  explodeOnHover
/>

// Mini gráfico (sparkline)
<MiniChart
  data={[1, 3, 2, 5, 4, 6]}
  type="line"
  color="#3b82f6"
  width={100}
  height={30}
/>
```

### 5. ResponsiveLayouts.tsx
Layouts responsivos e adaptáveis.

```tsx
import { 
  ResponsiveContainer, 
  GridLayout, 
  FlexLayout, 
  SidebarLayout,
  useBreakpoint 
} from '@/components/ui';

// Container responsivo
<ResponsiveContainer maxWidth="2xl" padding centered>
  <h1>Dashboard</h1>
</ResponsiveContainer>

// Grid responsivo
<GridLayout
  columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
  gap={6}
  responsive
>
  {cards.map(card => <Card key={card.id}>{card.content}</Card>)}
</GridLayout>

// Layout com sidebar
<SidebarLayout
  sidebar={<Navigation />}
  main={<Dashboard />}
  sidebarWidth="16rem"
  position="left"
  breakpoint="lg"
/>

// Hook para breakpoints
const { breakpoint, isLarge, windowSize } = useBreakpoint();
```

## 🎨 Temas e Customização

### Cores Disponíveis
- `primary` (azul)
- `secondary` (cinza)
- `success` (verde)
- `warning` (amarelo)
- `error` (vermelho)
- `info` (ciano)

### Tamanhos
- `sm` (pequeno)
- `md` (médio)
- `lg` (grande)
- `xl` (extra grande)

### Dark Mode
Todos os componentes suportam dark mode automaticamente através das classes do Tailwind CSS.

## 🔧 Configuração

### Dependências
- React 18+
- Tailwind CSS
- TypeScript

### Instalação
Os componentes já estão incluídos no projeto. Para usar:

```tsx
import { LoadingStates, AnimatedCard, CircularProgress } from '@/components/ui';
```

## 📱 Responsividade

Todos os componentes são totalmente responsivos com:
- Breakpoints padrão: `sm`, `md`, `lg`, `xl`, `2xl`
- Layouts adaptativos
- Touch-friendly em dispositivos móveis
- Otimizados para performance

## ⚡ Performance

### Otimizações incluídas:
- Lazy loading de animações
- Memoização de cálculos complexos
- Debounce em eventos de resize
- CSS-in-JS minimal para animações customizadas

## 🎭 Animações

### Tipos de animação:
- **Entrada**: Fade in, slide in, scale in
- **Hover**: Scale, glow, float, rotate
- **Loading**: Spin, pulse, wave, bounce
- **Transição**: Smooth curves, easing functions

### Configuração de animações:
```tsx
// Velocidade
duration="fast" | "normal" | "slow"

// Intensidade
intensity="subtle" | "normal" | "strong"

// Delay personalizado
delay={500} // ms
```

## 🚀 Exemplos de Uso no Dashboard

### Dashboard Principal
```tsx
import { 
  ResponsiveContainer, 
  GridLayout, 
  AnimatedCard, 
  CircularProgress,
  LineChart 
} from '@/components/ui';

export const Dashboard = () => {
  return (
    <ResponsiveContainer maxWidth="2xl">
      <GridLayout columns={{ sm: 1, md: 2, lg: 3 }} gap={6}>
        
        {/* Card de preço do Bitcoin */}
        <AnimatedCard variant="glow" intensity="normal">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Bitcoin Price</h3>
            <div className="text-3xl font-bold text-green-500">$45,230.50</div>
            <LineChart data={priceHistory} height={100} />
          </div>
        </AnimatedCard>
        
        {/* Progresso de mining */}
        <AnimatedCard variant="hover">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Mining Progress</h3>
            <CircularProgress value={75} size="lg" gradient />
          </div>
        </AnimatedCard>
        
        {/* Portfolio overview */}
        <AnimatedCard variant="float">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Portfolio</h3>
            <PieChart data={portfolioData} height={200} />
          </div>
        </AnimatedCard>
        
      </GridLayout>
    </ResponsiveContainer>
  );
};
```

### Loading States
```tsx
// Durante carregamento de dados
{loading && <LoadingOverlay isVisible variant="wave" text="Carregando dados do blockchain..." />}

// Skeleton para cards
{loading ? (
  <SkeletonLoader variant="card" />
) : (
  <AnimatedCard>
    {/* Conteúdo real */}
  </AnimatedCard>
)}
```

## 🎯 Melhores Práticas

1. **Performance**: Use `animated={false}` em listas grandes
2. **Acessibilidade**: Sempre inclua `aria-labels` apropriados
3. **Responsive**: Teste em diferentes tamanhos de tela
4. **Temas**: Mantenha consistência com o design system
5. **Loading**: Mostre estados de carregamento para melhor UX

## 🔍 Debug

Para debug de layouts, use o `LayoutDebugger`:

```tsx
import { LayoutDebugger } from '@/components/ui';

// Em desenvolvimento
<LayoutDebugger 
  enabled={process.env.NODE_ENV === 'development'} 
  showBreakpoints 
  showGrid 
/>
```

---

**Criado para o projeto Bitcoin Analytics Platform**
*Componentes otimizados para trading, análise de mercado e visualização de dados blockchain.*