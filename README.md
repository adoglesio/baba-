# Pelada+ — App Expo/React Native com Supabase (APK + Web)

Mesmo projeto gera **os dois**: o APK do celular e uma versão web — e como os dois usam o
**mesmo banco Supabase**, jogadores, times e placar ficam sincronizados entre eles (eles não
conversam direto um com o outro — cada um fala com o mesmo Supabase, e é isso que faz os
dados aparecerem nos dois lugares).

## 0. O que você precisa ter instalado no computador
- **Node.js** (versão 18 ou mais nova) — nodejs.org
- Conta grátis em **supabase.com**
- Conta grátis em **expo.dev** (pra usar o EAS Build na nuvem)
- Conta grátis em **vercel.com** (pra publicar o site)

## 1. Criar o banco de dados no Supabase
1. Crie um projeto novo em supabase.com.
2. **SQL Editor** → **New query** → cola o conteúdo de `supabase/schema.sql` → **Run**.
   Confirma que aparece "Success" em verde.
3. Confere em **Table Editor** se `players`, `groups` e `matches` aparecem na lista.
4. **Project Settings → API** → copia a **Project URL** e a **anon public key**.

Este app não tem login — é pra UM grupo de baba só, e qualquer aparelho com a chave do seu
projeto lê/escreve nos mesmos dados. Não deixe essas chaves em repositório público.

Se já tinha rodado uma versão anterior (com `user_id`/login), rode antes:
```sql
drop table if exists public.matches;
drop table if exists public.groups;
drop table if exists public.players;
```
e recola o `schema.sql` inteiro depois.

## 2. Configurar as chaves do Supabase (variáveis de ambiente)
Em vez de colar as chaves direto no código, o projeto usa variáveis de ambiente — assim dá
pra configurar diferente em cada lugar (seu PC, Vercel, EAS) sem editar arquivo nenhum.

**No seu computador (pra testar local):**
```bash
cp .env.example .env
```
Abre o `.env` e preenche com a URL e a anon key do seu projeto Supabase.

**No Vercel (pro site):**
1. No painel do projeto na Vercel → **Settings → Environment Variables**
2. Adiciona duas variáveis:
   - `EXPO_PUBLIC_SUPABASE_URL` → a Project URL do Supabase
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` → a anon public key do Supabase
3. Salva e clica em **Redeploy** (ou roda `vercel --prod` de novo) — variável de ambiente só
   entra em builds novos, não afeta um deploy que já foi feito.

**No EAS (pro APK):**
```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://SEU-PROJETO.supabase.co" --environment preview --visibility plaintext
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "SUA_ANON_KEY" --environment preview --visibility plaintext
```
Repete com `--environment production` quando for gerar o build pra Play Store. Se o comando
`eas env:create` não existir na sua versão da CLI, use `eas secret:create` no lugar (mesma ideia,
nome mais antigo do mesmo recurso).

⚠️ O `.gitignore` já está configurado pra nunca subir o `.env` pro GitHub — só sobe o
`.env.example` (sem valores reais).

## 3. Instalar as dependências
```bash
npm install
npx expo install --fix
```

## 4. Testar
**No celular (recomendado):** `npx expo start`, escaneia o QR code com o app **Expo Go**.

**No navegador:** `npx expo start -c` e aperta `w`.

## 5. Gerar o APK
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
Confirma que não existe `extra.eas.projectId` "preso" no `app.json` de um projeto antigo —
se existir, apague antes de rodar. Ao terminar, baixa o `.apk` pelo link que aparece.

## 6. Publicar a versão web no Vercel
Já tem um `vercel.json` pronto configurando o build (`npx expo export -p web`, saída em `dist/`).
```bash
npm install -g vercel
vercel login
vercel --prod
```
Ele detecta o `vercel.json` sozinho e devolve o link do site.

## 7. Publicar na Google Play Store
1. Conta de desenvolvedor Google (US$ 25, taxa única).
2. Troca `"package"` no `app.json` por algo só seu antes do build de produção.
3. `eas build -p android --profile production` (gera `.aab`)
4. `eas submit -p android`
5. Preenche a ficha da loja (descrição, capturas de tela, política de privacidade).

## Sorteio e partida agora ficam salvos
O time sorteado e a partida em andamento não somem mais se você fechar a aba ou recarregar
a página — ficam guardados no aparelho (não no Supabase, então não aparecem no outro
aparelho — ex: se sortear no site, o celular não vê esse sorteio específico, só os jogadores
e o histórico, que aí sim são compartilhados). Pra começar um sorteio do zero, é só apertar
"Sortear de novo" na aba Sorteio.

## Editar gols/assistências manualmente
Na ficha de cada jogador (aba Jogadores → toca no jogador) agora dá pra digitar o número
total de gols e assistências direto, sem precisar que tenha vindo de uma partida registrada
no app — útil pra corrigir ou já cadastrar o retrospecto de alguém que você quer adicionar
com histórico. O Ranking também ganhou uma seção "Times que mais venceram", somando quantos
gols cada cor de colete fez nas partidas que venceu.

## Como funciona o placar com gol + assistência
Na tela **Partida**, o **+** do time abre uma janela: primeiro escolhe **quem fez o gol**
(obrigatório), depois **quem deu a assistência** (opcional). O **–** desfaz o último gol
daquele time. O Ranking mostra artilharia, assistências e vitórias.

## Se algo der errado
- **"Cannot find module 'expo-asset'" (ou outro)**: `npx expo install --fix`
- **JSON inválido**: `node -e "console.log(JSON.parse(require('fs').readFileSync('eas.json')))"`
- **"Could not find the table 'public.players'"**: o `schema.sql` não rodou nesse projeto
  Supabase específico — confere a URL na barra de endereço do navegador e no `supabase.js`
- **Erro de permissão no `eas build`**: `eas whoami` pra conferir a conta, apaga
  `extra.eas.projectId` velho do `app.json`
