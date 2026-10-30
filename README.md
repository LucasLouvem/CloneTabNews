# CloneTabNews

Projeto de estudos do curso [curso.dev](https://curso.dev), de Filipe Deschamps, em que se constrói um clone do [TabNews](https://www.tabnews.com.br) do zero.

O curso usa JavaScript. Eu estou refazendo tudo em **TypeScript**, como exercício de tipagem e de adaptar o conteúdo em vez de copiá-lo.

## O que já tem

- **`GET /api/v1/status`**: devolve a hora da consulta, a versão do Postgres, o máximo de conexões e quantas estão abertas.
- **`GET /api/v1/migrations`**: lista as migrations pendentes (dry run, não altera o banco).
- **`POST /api/v1/migrations`**: aplica as migrations pendentes.
- **Testes de integração** que sobem o servidor e chamam a API de verdade.
- **CI no GitHub Actions** com testes, ESLint, Prettier e commitlint.

## Tecnologias

| Área | Ferramentas |
| --- | --- |
| Aplicação | Next.js 13, React 18, TypeScript |
| Banco de dados | PostgreSQL 16 (Docker), `pg`, `node-pg-migrate` |
| Testes | Jest, ts-jest, `async-retry` |
| Qualidade | ESLint, Prettier, commitlint, Husky |
| Infra | Docker Compose, GitHub Actions |

## Como rodar

Pré-requisitos: **Node 18.17.0** (veja o `.tool-versions`) e **Docker**.

```bash
npm install
npm run dev
```

O `npm run dev` sobe o Postgres no Docker, espera ele aceitar conexões e inicia o Next.js em `http://localhost:3000`.

Para criar as tabelas, aplique as migrations:

```bash
curl -X POST http://localhost:3000/api/v1/migrations
```

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Banco + servidor de desenvolvimento |
| `npm test` | Banco + servidor + Jest (`--runInBand`) |
| `npm run test:watch` | Jest em modo watch |
| `npm run services:up` / `stop` / `down` | Controla o container do Postgres |
| `npm run migrations:create <nome>` | Cria uma migration a partir do template |
| `npm run eslint:check` / `eslint:fix` | Lint |
| `npm run prettier:check` / `prettier:fix` | Formatação |

## Estrutura

```
infra/        Docker Compose, conexão com o banco, migrations e scripts
pages/        Páginas e rotas da API (pages/api/v1/...)
test/         Testes de integração e orchestrator (setup dos testes)
.github/      Workflows de CI
```

## Convenção de commits

Os commits seguem o [Conventional Commits](https://www.conventionalcommits.org), validado pelo commitlint em um hook do Husky (`feat:`, `fix:`, `chore:`, `ci:`...).

## Licença

[MIT](LICENSE)
