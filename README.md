# Auth System (Node.js + JWT)

Um sistema de autenticação robusto implementado em JavaScript puro (Node.js) sem frameworks (como Express), utilizando o módulo `http` nativo. Este projeto demonstra práticas seguras de autenticação como JWT (JSON Web Tokens), Refresh Tokens rotativos, controle de acesso baseado em roles (RBAC) e logs de auditoria.

## 🚀 Funcionalidades

- **Autenticação JWT**: Access Tokens de curta duração (15min) e Refresh Tokens de longa duração (7 dias).
- **Refresh Token Rotation**: Prevenção de reuso de tokens. O uso de um token antigo invalida toda a cadeia.
- **Role-Based Access Control (RBAC)**: Proteção de rotas baseada em permissões de usuário (ex: `admin`).
- **Auditoria**: Registro detalhado de ações (login, logout, refresh) e acessos em arquivo JSON.
- **Persistência em Arquivo**: Simulação de banco de dados usando arquivos JSON para fácil portabilidade e didática.
- **Segurança**: Hashing de Refresh Tokens no servidor para evitar vazamentos diretos.

## 📂 Estrutura do Projeto

```
auth-system/
├── server.js          # Servidor HTTP principal e roteamento
├── .env               # Variáveis de ambiente (Configuração sensível)
├── data/              # Camada de Persistência (Simulação de BD)
│   ├── users.json     # Dados dos usuários (mock)
│   ├── refresh.json   # Hash dos Refresh Tokens ativos
│   └── audit.json     # Logs de auditoria do sistema
└── utils/             # Módulos Utilitários
    ├── auth.js        # Middleware e lógica de controle de acesso
    ├── db.js          # Gerenciamento de leitura/escrita nos arquivos JSON
    ├── jwt.js         # Geração e validação de tokens
    └── logger.js      # Logger de requisições HTTP
```

## 🛠️ Instalação e Configuração

1.  **Pré-requisitos**: Node.js instalado.
2.  **Instalar dependências**:
    ```bash
    npm install
    ```
3.  **Configurar Ambiente**:
    O arquivo `.env` já vem pré-configurado para dev:
    ```env
    JWT_SECRET=supersecretkey
    ```
    *Em produção, altere este segredo para uma string longa e aleatória.*

## ▶️ Execução

Para iniciar o servidor:

```bash
npm start
```

O servidor rodará em `http://localhost:3000`.

## 📚 Documentação da API

### 1. Autenticação

#### Login
Autentica um usuário e retorna o par de tokens.

- **URL**: `/login`
- **Método**: `POST`
- **Body**:
  ```json
  {
    "email": "user@test.com",
    "senha": "password123"
  }
  ```
- **Sucesso (200)**:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
  ```

#### Refresh Token
Renova o Access Token usando um Refresh Token válido. Isso invalida o Refresh Token anterior e retorna um novo.

- **URL**: `/refresh`
- **Método**: `POST`
- **Body**:
  ```json
  {
    "refreshToken": "eyJhbGciOi..."
  }
  ```
- **Sucesso (200)**: Retorna no mesmo formato do Login.

#### Logout
Invalida a sessão do usuário (remove o Refresh Token do servidor).

- **URL**: `/logout`
- **Método**: `POST`
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
- **Sucesso (200)**: `{ "message": "Logged out successfully" }`

### 2. Rotas Protegidas

#### Área Protegida
Exemplo de rota que exige autenticação e role de `admin`.

- **URL**: `/protected`
- **Método**: `GET` ou `POST`
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
- **Resposta**: Dados do usuário e mensagem de boas-vindas.

#### Auditoria (Logs)
Lista as últimas 100 ações registradas no sistema (apenas Admin).

- **URL**: `/audit`
- **Método**: `GET`
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
- **Resposta**: Array de objetos de log.

## 🧪 Testes Manuais (cURL)

**1. Realizar Login:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"user@test.com","senha":"password123"}' http://localhost:3000/login
```

**2. Acessar Rota Protegida (Copie o accessToken da resposta anterior):**
```bash
curl -H "Authorization: Bearer <SEU_ACCESS_TOKEN>" http://localhost:3000/protected
```

**3. Renovar Token (Copie o refreshToken):**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"refreshToken":"<SEU_REFRESH_TOKEN>"}' http://localhost:3000/refresh
```

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
Copyright (c) 2026 ens-Emilio
