# Pet Front

SPA em React + TypeScript para o registro público de Pets e seus Tutores, consumindo a API pública do desafio.

## Dados de inscrição
  Nome: Vinicius Rodrigues da Silva
  Email: viniciusrodriguess.dev@gmail.com
  CPF: 029.609.*** - **

## Vaga
- Cargo: Desenvolvedor(a) Front-End
- Senioridade: Senior

## Arquitetura
O projeto segue uma arquitetura em camadas com **Facade** e **Use Cases**, mantendo separação de responsabilidades.

**Camadas principais:**
- **domain**: entidades e contratos de repositórios.
- **application**: casos de uso e facades com estado via RxJS (`BehaviorSubject`).
- **infrastructure**: integração com API, HTTP client e storage de token.
- **presentation**: páginas, componentes, hooks e rotas (com lazy loading).
- **services**: composição de dependências (injeção simples).

**Fluxo:**
`presentation → services → application (facade/use-case) → domain (contracts) → infrastructure (API/HTTP)`

### Organização de pastas
- [src/presentation](src/presentation): UI, páginas e rotas.
- [src/application](src/application): facades e casos de uso.
- [src/domain](src/domain): entidades e interfaces.
- [src/infrastructure](src/infrastructure): API, HTTP, storage e repositórios.
- [src/services](src/services): composição das dependências.

## Funcionalidades principais
- Listagem e detalhe de pets com paginação e busca.
- CRUD de pets e tutores.
- Upload de fotos e vínculo pet ↔ tutor.
- Autenticação com refresh token.
- Página de health check.

## Requisitos
- Node.js 20+

## Como utilizar a aplicação:

Existem 3 formas de testar: 
- Executando localmente
- Executando container
- Acessando https://meu-pet-app.vercel.app

Abaixo eu deixo explicado como executar o projeto localmente das duas formas

# Executando localmente
```bash
pnpm install
pnpm dev
```

A aplicação será iniciada em `http://localhost:5173` (porta padrão do Vite).

### Build e preview
```bash
pnpm build
pnpm preview
```

### Testes
```bash
pnpm test
pnpm test:coverage
```

### Lint
```bash
pnpm lint
```

## Deploy
O build gera arquivos estáticos em `dist/`, compatíveis com qualquer static hosting (Vercel, Netlify, S3, etc.).

Fluxo sugerido:
1. `pnpm build`
2. Publicar o diretório `dist/`

# Executando container
Este repositório inclui um `Dockerfile` multi-stage para empacotar o build estático.

### Build da imagem
```bash
docker build -t pet-front:latest .
```

### Executar
```bash
docker run --rm -p 8080:80 pet-front:latest
```

A aplicação ficará disponível em `http://localhost:8080`.