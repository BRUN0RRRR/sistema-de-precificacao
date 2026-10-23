# Calculo de produtos (precificafardo)

Calculadora de preços e margens de fardos/caixas, em React, num **monolito para a Vercel**:
o front (Vite + React) e a API (`api/db.ts`, função serverless) ficam no mesmo repositório.
Os dados ficam **num único arquivo JSON** (`precificafardo-db.json`) guardado num **Vercel Blob privado**.

```
Navegador (React + cache local)  ──►  /api/db (Vercel)  ──►  Vercel Blob privado  ──►  precificafardo-db.json
```

- Edita no app → salva sozinho (1 s depois da última alteração).
- Abre o app → carrega o JSON. Voltou ao app depois de 30 s → busca mudanças feitas no outro aparelho.
- Sem internet → continua com o cache local e envia quando a conexão volta.
- O acesso é protegido por uma senha (`APP_PASSWORD`), porque o site é público na internet.
- Backup extra: Configurações → "Exportar Dados" baixa o mesmo JSON no seu aparelho.

## Publicar na Vercel (uns 5 minutos)

1. Suba o projeto para um repositório no GitHub.
2. Na [Vercel](https://vercel.com/new), faça **Import** do repositório (ela detecta o Vite sozinha).
3. Em **Environment Variables**, cadastre `APP_PASSWORD` com a senha que vocês dois vão usar. Clique em **Deploy**.
4. No projeto, abra a aba **Storage** → **Create Storage** → **Blob** → escolha o acesso **Private** →
   crie o store e conecte ao projeto (deixe Production e Preview marcados; marque Development se for rodar local).
   A conexão configura `BLOB_STORE_ID`; a autenticação OIDC é gerenciada pela Vercel e usada automaticamente pelo SDK.
5. Faça um novo deploy (**Deployments → ⋯ → Redeploy**) para aplicar as variáveis ao app.
6. Abra a URL, digite a senha e pronto. No primeiro acesso o arquivo é criado com o catálogo inicial de 46 produtos.

> O store precisa ser **Private**. Com store público a gravação falha.

## Rodar no seu computador (opcional)

```bash
npm install                      # gera o package-lock.json (faça commit dele)
vercel link                      # conecte a pasta local ao projeto, se ainda não estiver vinculada
vercel env pull .env.local       # puxe as variáveis; habilite Development na conexão do Blob
npm run dev                      # http://localhost:3000 (a rota /api/db também funciona aqui)
```

Configure `APP_PASSWORD` também no ambiente Development da Vercel antes de puxar as variáveis.
O SDK do Blob usa a autenticação OIDC obtida pela Vercel; não copie nem compartilhe tokens.
Atenção: rodando local você mexe nos **mesmos dados** de produção.

## Problemas comuns

| Mensagem no app | O que fazer |
| --- | --- |
| "O armazenamento não está configurado…" | Falta conectar o Blob store ao projeto (passo 4) ou fazer o redeploy (passo 5). |
| "Falha ao gravar os dados: …access…" | O Blob store foi criado como Public. Crie outro como **Private**. |
| "A variável APP_PASSWORD não está configurada" | Cadastre a variável na Vercel e faça um novo deploy. |
| "Senha incorreta." | A senha digitada não é a do `APP_PASSWORD`. |

## Estrutura

```
api/db.ts                  função serverless: GET lê / PUT grava o JSON no Blob
src/hooks/useCloudSync.ts  carregar, salvar sozinho, atualizar ao voltar ao app, offline
src/services/api.ts        chamadas do front para /api/db
src/components/            telas (calculadora, tabela, simulador) + LoginGate + CloudSyncBar
```

## Observações

- O catálogo inicial de 46 produtos (nomes, custos e margens) vem do código e fica dentro do JavaScript
  público do site. A senha protege o que está salvo no Blob, não esse catálogo inicial.
- Edição ao mesmo tempo nos dois aparelhos: vence a última gravação.
- O plano gratuito da Vercel dá e sobra para um arquivo JSON usado por duas pessoas.
