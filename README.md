# Sectotech Frontend

Frontend da plataforma Sectotech, construído com Next.js 16, React 18 e autenticação via Keycloak. A aplicação consome a API Spring do backend e exige login para acessar as áreas principais do sistema.

## Stack

- Next.js 16 com App Router
- React 18
- TypeScript
- Tailwind CSS 4
- Keycloak JS para autenticação

## Pré-requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Backend rodando localmente ou acessível por URL
- Instância do Keycloak configurada com o realm e o client do frontend

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com o conteúdo abaixo:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180
NEXT_PUBLIC_KEYCLOAK_REALM=secto-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=secto-frontend
```

### O que cada variável faz

- `NEXT_PUBLIC_API_BASE_URL`: URL base do backend. Como a API usa `server.servlet.context-path=/api`, o valor precisa incluir `/api`.
- `NEXT_PUBLIC_KEYCLOAK_URL`: URL base do Keycloak, sem `/realms/...`.
- `NEXT_PUBLIC_KEYCLOAK_REALM`: realm usado na autenticação.
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`: client público ou confidencial configurado para a aplicação web.

## Configuração do Keycloak

O frontend monta o fluxo de login diretamente a partir das variáveis públicas. Para funcionar localmente, o client do frontend no Keycloak deve ter pelo menos:

- Redirect URI permitindo `http://localhost:3000/*`
- Web origin permitindo `http://localhost:3000`
- Realm igual ao valor configurado em `NEXT_PUBLIC_KEYCLOAK_REALM`

Se o backend estiver usando o realm padrão do projeto, o nome esperado tende a ser `secto-realm`.

## Instalação

```bash
npm install
```

## Executando em desenvolvimento

```bash
npm run dev
```

A aplicação ficará disponível em [http://localhost:3000](http://localhost:3000).

Como o provider do Keycloak é inicializado com `login-required`, abrir a aplicação sem autenticação válida redireciona automaticamente para o login.

## Build de produção

```bash
npm run build
npm run start
```

## Scripts disponíveis

- `npm run dev`: inicia o ambiente de desenvolvimento
- `npm run build`: gera a build de produção
- `npm run start`: sobe a aplicação em modo produção
- `npm run lint`: executa o ESLint

## Rodando com Docker

O projeto possui um `Dockerfile` baseado em Node 20 e build standalone do Next.js.

### Build da imagem

```bash
docker build -t sectotech-frontend .
```

### Execução do container

```bash
docker run --rm -p 3000:3000 \
	-e NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api \
	-e NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180 \
	-e NEXT_PUBLIC_KEYCLOAK_REALM=secto-realm \
	-e NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=secto-frontend \
	sectotech-frontend
```

## Fluxo recomendado para desenvolvimento local

1. Suba Postgres e Keycloak pelo `docker-compose` do backend.
2. Configure o realm, os clients e os usuários no Keycloak.
3. Suba o backend em `http://localhost:8080`.
4. Configure o `.env.local` deste frontend.
5. Rode `npm run dev`.

## Problemas comuns

### Loop de login ou tela carregando indefinidamente

Revise:

- `NEXT_PUBLIC_KEYCLOAK_URL`
- `NEXT_PUBLIC_KEYCLOAK_REALM`
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`
- Redirect URIs e Web Origins do client no Keycloak

### Requisições falhando com erro de rede

Revise se `NEXT_PUBLIC_API_BASE_URL` aponta para a API com o prefixo `/api`. Exemplo válido:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### Erros de CORS

O backend já aceita origens locais em `localhost`, mas ele ainda precisa estar rodando e configurado com o Keycloak correto.

## Integração com o backend

- Base local da API: `http://localhost:8080/api`
- Swagger do backend: `http://localhost:8080/api/swagger-ui.html`
- Keycloak local: `http://localhost:8180`

Se você ainda não configurou a API, consulte o README do backend antes de iniciar o frontend.
