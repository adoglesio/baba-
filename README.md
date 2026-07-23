# Pelada+ — App Expo/React Native com Supabase

Este é o mesmo app que você já testou em HTML, agora como projeto **React Native/Expo de verdade**,
pronto pra virar um APK instalável e, depois, ir pra Play Store. Os dados (jogadores, grupos,
histórico de partidas) ficam salvos no **Supabase**, então não somem se você trocar de celular.

## 0. O que você precisa ter instalado no computador
- **Node.js** (versão 18 ou mais nova) — baixe em nodejs.org
- Uma conta grátis em **supabase.com**
- Uma conta grátis em **expo.dev** (pra usar o EAS Build na nuvem — não precisa Android Studio)

## 1. Criar o banco de dados no Supabase
1. Crie um projeto novo em supabase.com (escolha uma senha de banco e guarde ela).
2. No menu lateral, vá em **SQL Editor** → **New query**.
3. Abra o arquivo `supabase/schema.sql` (está nessa mesma pasta), copie tudo e cole lá. Clique em **Run**.
   Isso cria as tabelas `players`, `groups` e `matches`, já com segurança (cada "conta" só vê os próprios dados).
4. Vá em **Authentication → Providers** e habilite **Anonymous Sign-Ins**. É isso que permite o
   app funcionar sem tela de login/senha — cada celular vira uma "conta" sozinho.
5. Vá em **Project Settings → API** e copie a **Project URL** e a **anon public key**.

## 2. Configurar o app com as chaves do Supabase
Abra `src/lib/supabase.js` e troque:
```js
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';
```
pelos valores que você copiou no passo anterior.

## 3. Instalar as dependências
Dentro da pasta do projeto, no terminal:
```bash
npm install
npx expo install @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill expo-status-bar
```
Uso o `npx expo install` (em vez de `npm install` direto) pra essas libs porque ele escolhe
automaticamente a versão certinha compatível com a versão do Expo que você tiver — evita
dor de cabeça de versão incompatível.

## 4. Testar no seu celular (sem precisar de APK ainda)
```bash
npx expo start
```
Instale o app **Expo Go** (Play Store) no seu celular, escaneie o QR code que aparece no
terminal, e o Pelada+ abre direto pra você testar tudo — jogadores, sorteio, partida, ranking.

## 5. Gerar o APK de verdade
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
Isso builda na nuvem da Expo (grátis, sem precisar de Android Studio no seu PC). Ao terminar,
ele te dá um **link** — abre esse link no celular (ou manda por WhatsApp) e baixa o `.apk`.
Depois é só abrir o arquivo baixado e instalar (o Android vai pedir pra liberar "instalar de
fontes desconhecidas" na primeira vez).

## 6. Publicar na Google Play Store
Pra chegar na loja de verdade, os passos são:

1. **Crie uma conta de desenvolvedor Google** em play.google.com/console — tem uma taxa única
   de US$ 25 (não é mensalidade, paga uma vez só).
2. Antes de gerar o build de produção, abra `app.json` e troque `"package": "br.com.peladaplus.app"`
   por algo só seu (ex: `br.com.seunome.peladaplus`) — esse identificador tem que ser único na
   Play Store e **não dá pra mudar depois de publicado**.
3. Gere o pacote de produção (formato `.aab`, que é o que a Play Store exige):
   ```bash
   eas build -p android --profile production
   ```
4. Envie direto pra Play Store com:
   ```bash
   eas submit -p android
   ```
   (ele vai te pedir uma chave de API do Google Play Console na primeira vez — o próprio EAS
   te guia por isso).
5. Dentro do **Google Play Console**, ainda falta preencher a ficha da loja: nome, descrição,
   capturas de tela do app (pode tirar do próprio Expo Go rodando), ícone, classificação
   indicativa (questionário simples) e uma **política de privacidade** (obrigatória — mesmo
   sendo um app simples, hoje em dia a Google exige um link. Se quiser, eu te ajudo a escrever uma).
6. Depois de enviado, a Google faz uma revisão que pode levar de algumas horas a alguns dias.

## Estrutura do projeto
```
App.js                        ponto de entrada
src/theme.js                  cores e helpers visuais (mesma identidade do app web)
src/lib/supabase.js           conexão com o Supabase (troque as chaves aqui)
src/context/AppContext.js     estado global: jogadores, grupos, sorteio, partida, histórico
src/utils/teamBalancer.js     algoritmo de sorteio balanceado
src/navigation/BottomTabNavigator.js
src/screens/                  as 5 telas: Início, Jogadores, Sorteio, Partida, Ranking
supabase/schema.sql           script para criar as tabelas no Supabase
eas.json                      perfis de build (apk de teste / pacote pra loja)
```

## Se algo der errado
- **Erro de versão de dependência**: rode `npx expo install --check` — ele aponta e corrige
  sozinho qualquer pacote com versão incompatível com o SDK do Expo.
- **"Anonymous sign-ins are disabled"**: volta no passo 1.4, esqueceu de habilitar no Supabase.
- **Times não aparecem depois do sorteio**: confere se marcou jogadores como "presente" antes,
  na aba Jogadores.
