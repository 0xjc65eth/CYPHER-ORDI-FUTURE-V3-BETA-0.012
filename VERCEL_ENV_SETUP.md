# 🚀 Configuração de Variáveis de Ambiente no Vercel

## ⚠️ IMPORTANTE: Configurar antes do deploy!

Para o projeto funcionar corretamente no Vercel, você DEVE configurar as seguintes variáveis de ambiente:

## 1. Variáveis OBRIGATÓRIAS (sem estas o build falhará):

### Supabase (Autenticação)
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**Como obter:**
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto (gratuito)
3. Vá em Settings > API
4. Copie a URL e a chave `anon public`

## 2. Variáveis RECOMENDADAS (para funcionalidades completas):

### APIs de Criptomoedas
```
NEXT_PUBLIC_COINGECKO_API_KEY=sua-chave-aqui
NEXT_PUBLIC_COINMARKETCAP_API_KEY=sua-chave-aqui
NEXT_PUBLIC_HIRO_API_KEY=3100ea7623797d267da3bd6dc94f47f9
```

### Wallet Connect
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=seu-project-id
```

## 3. Como Configurar no Vercel:

1. **Acesse o Dashboard do Vercel**
   - Entre em [vercel.com](https://vercel.com)
   - Selecione seu projeto

2. **Vá para Settings > Environment Variables**

3. **Adicione cada variável:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://seu-projeto.supabase.co`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - Clique em "Save"

4. **Repita para todas as variáveis necessárias**

5. **Faça um novo deploy:**
   - Vá para a aba "Deployments"
   - Clique nos 3 pontos do último deploy
   - Selecione "Redeploy"

## 4. Modo de Desenvolvimento (sem Supabase):

Se você não quiser configurar o Supabase agora, o projeto usará automaticamente um "stub" de autenticação que permite:
- Build sem erros
- Login simulado (não persiste dados)
- Navegação básica no site

⚠️ **Nota:** Sem Supabase configurado, as funcionalidades de autenticação real não funcionarão.

## 5. Verificação:

Após configurar e fazer o redeploy, verifique:
- ✅ Build completo sem erros
- ✅ Página de login carrega sem erro 404
- ✅ Outras páginas funcionam normalmente

## 6. Troubleshooting:

**Erro: "useAuth must be used within an AuthProvider"**
- Causa: Faltam variáveis do Supabase
- Solução: Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Erro: Build falhou com "Module not found"**
- Causa: Dependências faltando
- Solução: Verifique se todas as dependências estão no package.json

---

📌 **Dica:** Guarde suas chaves de API em um gerenciador de senhas seguro!