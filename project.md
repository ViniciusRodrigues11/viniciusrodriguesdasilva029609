Projeto – Desenvolvedor Front-End

Implementar uma SPA em Angular ou React para um registro público de Pets e seus Tutores, consumindo uma API pública.

Swagger da API:
https://pet-manager-api.geia.vip/q/swagger-ui/

Requisitos Gerais

SPA em Angular ou React

Consumo de API em tempo real (fetch, axios ou similar)

TypeScript

Layout responsivo

Priorizar Tailwind CSS, se usar framework CSS

Lazy loading de rotas para módulos:

Pets

Tutores

Paginação ou scroll infinito

Boas práticas de organização, componentização e separação de responsabilidades

Testes unitários básicos

Requisitos Funcionais
1. Tela Inicial – Listagem de Pets

Endpoint: GET /v1/pets

Exibir em cards:

Foto (se existir)

Nome

Espécie

Idade

Paginação:

10 itens por página

Busca por nome do pet

2. Tela de Detalhamento do Pet

Navegação ao clicar no card

Endpoint:

GET /v1/pets/{id}

Se houver tutor:

Buscar dados do tutor em GET /v1/tutores/{id}

Exibir nome e contato

Dar destaque visual ao nome do pet

3. Tela de Cadastro / Edição de Pet

Criar pet:

POST /v1/pets

Editar pet:

PUT /v1/pets/{id}

Campos:

Nome

Espécie

Idade

Raça

Upload de foto:

POST /v1/pets/{id}/fotos

Aplicar máscaras de input quando necessário

4. Tela de Cadastro / Edição de Tutor

Criar tutor:

POST /v1/tutores

Atualizar tutor:

PUT /v1/tutores/{id}

Campos:

Nome completo

Telefone

Endereço

Upload de foto:

POST /v1/tutores/{id}/fotos

Vinculação Pet ↔ Tutor

Listar pets vinculados ao tutor

Vincular pet:

POST /v1/tutores/{id}/pets/{petId}

Remover vínculo:

DELETE /v1/tutores/{id}/pets/{petId}

5. Autenticação

Login:

POST /autenticacao/login

Refresh token:

PUT /autenticacao/refresh

Gerenciar expiração e renovação do token

Requisitos Adicionais (Apenas para Sênior)

Health check

Liveness / Readiness

Testes unitários

Arquitetura em camadas com Padrão Facade

Gerenciamento de estado com BehaviorSubject