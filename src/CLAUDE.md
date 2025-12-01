# 后端模块 (src/)

**[根目录](../CLAUDE.md) > src**

> **模块职责**: MCP 服务编排、HTTP API 网关、认证授权、数据持久化
> **主要语言**: TypeScript (ESM)
> **最后更新**: 2025-12-01 12:10:33

---

## 变更记录 (Changelog)

### 2025-12-01
- 初始化后端模块文档
- 记录核心服务架构与数据流

---

## 模块职责

后端是 MCPHub 的核心，负责：

1. **MCP 服务编排** - 连接、管理多个上游 MCP 服务器（stdio/SSE/HTTP/OpenAPI）
2. **HTTP API 网关** - 提供 RESTful API 供前端调用
3. **SSE 流式传输** - 实时转发 MCP 消息到客户端（Claude/Cursor）
4. **认证与授权** - JWT + bcrypt 密码保护
5. **OAuth 集成** - 支持上游 MCP OAuth（客户端）和自身 OAuth（服务器）
6. **数据持久化** - 双模式支持（JSON 文件 / PostgreSQL）
7. **智能路由** - 基于 pgvector 的语义搜索工具发现
8. **国际化** - i18next 后端服务

---

## 入口与启动

### 主入口

**文件**: `src/index.ts`

```typescript
import AppServer from './server.js';
import { initializeDatabaseMode } from './utils/migration.js';

// 启动流程：
// 1. 检测数据库模式（USE_DB 或 DB_URL）
// 2. 如果启用数据库，初始化 TypeORM 连接
// 3. 初始化 AppServer
// 4. 启动 HTTP 服务器
```

**启动顺序**:
1. 环境检测（数据库模式 vs JSON 模式）
2. 数据库初始化（如启用）
3. i18n 初始化
4. 默认管理员用户创建（如不存在）
5. OAuth Provider 初始化
6. OAuth Server 初始化
7. 中间件注册
8. 路由注册
9. MCP 上游服务器连接
10. 前端静态文件服务

### 服务器类

**文件**: `src/server.ts`

```typescript
export class AppServer {
  async initialize(): Promise<void>
  start(): void
  connected(): boolean
  getApp(): express.Application
}
```

**关键配置**:
- 端口: `config.port` (默认 3000)
- 基础路径: `config.basePath` (默认 '')
- 前端路径: 自动查找 `frontend/dist/`

---

## 对外接口

### HTTP API 端点

#### 认证 (无需 auth)

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/user` - 获取当前用户信息（需 JWT）
- `POST /api/auth/change-password` - 修改密码（需 JWT）

#### MCP 服务器管理 (需 auth)

- `GET /api/servers` - 列出所有 MCP 服务器
- `GET /api/servers/:name` - 获取单个服务器配置
- `POST /api/servers` - 创建新服务器
- `PUT /api/servers/:name` - 更新服务器配置
- `DELETE /api/servers/:name` - 删除服务器
- `POST /api/servers/:name/toggle` - 启用/禁用服务器

#### 分组管理 (需 auth)

- `GET /api/groups` - 列出所有分组
- `POST /api/groups` - 创建新分组
- `PUT /api/groups/:id` - 更新分组
- `DELETE /api/groups/:id` - 删除分组
- `POST /api/groups/:id/servers` - 添加服务器到分组
- `DELETE /api/groups/:id/servers/:serverName` - 从分组移除服务器

#### 用户管理 (需 admin)

- `GET /api/users` - 列出所有用户
- `POST /api/users` - 创建新用户
- `PUT /api/users/:username` - 更新用户
- `DELETE /api/users/:username` - 删除用户

#### MCP 代理端点 (支持 auth/OAuth)

- `GET /mcp` - SSE 连接（所有服务器）
- `GET /mcp/:group` - SSE 连接（指定分组）
- `POST /mcp` - MCP 消息转发
- `GET /mcp/$smart` - 智能路由（语义搜索）

#### OAuth 端点

**客户端回调**:
- `GET /oauth/callback` - 上游 MCP OAuth 回调

**服务器端点**:
- `GET /oauth/authorize` - 授权页面
- `POST /oauth/token` - Token 交换
- `GET /oauth/userinfo` - 用户信息
- `GET /.well-known/oauth-authorization-server` - 元数据

#### 其他

- `GET /health` - 健康检查
- `GET /api/logs` - 查看日志（需 auth）
- `GET /api/openapi.json` - OpenAPI 规范

---

## 关键依赖与配置

### 核心依赖

```json
{
  "@modelcontextprotocol/sdk": "^1.20.2",   // MCP 协议实现
  "express": "^4.21.2",                      // HTTP 框架
  "typeorm": "^0.3.26",                      // ORM（数据库模式）
  "jsonwebtoken": "^9.0.2",                  // JWT 认证
  "bcrypt": "^6.0.0",                        // 密码哈希
  "@node-oauth/oauth2-server": "^5.2.1",    // OAuth 服务器
  "openid-client": "^6.8.1",                 // OAuth 客户端
  "i18next": "^25.5.0",                      // 国际化
  "axios": "^1.12.2",                        // HTTP 客户端
  "pg": "^8.16.3",                           // PostgreSQL 驱动
  "pgvector": "^0.2.1"                       // 向量搜索
}
```

### 配置来源

1. **环境变量** (`.env`)
   - `PORT` - 服务端口（默认 3000）
   - `DB_URL` - 数据库连接字符串
   - `USE_DB` - 强制启用数据库模式
   - `NODE_ENV` - 运行环境

2. **配置文件** (`mcp_settings.json`)
   - `mcpServers` - MCP 服务器定义
   - `users` - 用户账户（JSON 模式）
   - `groups` - 服务器分组（JSON 模式）
   - `systemConfig` - 系统配置

3. **运行时配置** (`src/config/index.ts`)
   - `config.port` - HTTP 端口
   - `config.basePath` - API 基础路径
   - `config.mcpHubName` - 服务名称
   - `config.jwtSecret` - JWT 密钥

---

## 数据模型

### 核心实体（TypeORM）

**Server** (`src/db/entities/Server.ts`)
```typescript
@Entity({ name: 'servers' })
export class Server {
  id: string                      // UUID
  name: string                    // 唯一名称
  type?: string                   // stdio/sse/streamable-http/openapi
  url?: string                    // SSE/HTTP URL
  command?: string                // Stdio 命令
  args?: string[]                 // 命令参数
  env?: Record<string, string>    // 环境变量
  enabled: boolean                // 启用状态
  owner?: string                  // 所属用户
  tools?: Record<string, {...}>   // 工具配置
  prompts?: Record<string, {...}> // 提示配置
  oauth?: Record<string, any>     // OAuth 配置
}
```

**Group** (`src/db/entities/Group.ts`)
```typescript
@Entity({ name: 'groups' })
export class Group {
  id: string                      // UUID
  name: string                    // 分组名称
  description?: string            // 描述
  serverNames: string[]           // 服务器名称列表
  owner?: string                  // 所属用户
}
```

**User** (`src/db/entities/User.ts`)
```typescript
@Entity({ name: 'users' })
export class User {
  id: string                      // UUID
  username: string                // 用户名（唯一）
  password: string                // bcrypt 哈希密码
  role: string                    // 角色（admin/user）
}
```

**VectorEmbedding** (`src/db/entities/VectorEmbedding.ts`)
```typescript
@Entity({ name: 'vector_embeddings' })
export class VectorEmbedding {
  id: string                      // UUID
  serverName: string              // 服务器名称
  toolName: string                // 工具名称
  embedding: string               // pgvector 向量
  description: string             // 工具描述
  dimensions: number              // 向量维度（1536）
}
```

### DAO 抽象层

**双数据源实现**:
- JSON 实现: `src/dao/*Dao.ts` (默认)
- DB 实现: `src/dao/*DaoDbImpl.ts` (数据库模式)

**DAO 接口示例**:
```typescript
export interface ServerDao {
  getAllServers(): Promise<ServerConfigWithName[]>
  getServerByName(name: string): Promise<ServerConfig | undefined>
  createServer(name: string, config: ServerConfig): Promise<void>
  updateServer(name: string, config: ServerConfig): Promise<void>
  deleteServer(name: string): Promise<void>
}
```

---

## 测试与质量

### 测试覆盖

**单元测试**:
- `src/services/__tests__/` - 服务层测试
- `src/clients/__tests__/` - 客户端测试
- `tests/services/` - 服务集成测试
- `tests/controllers/` - 控制器测试

**集成测试**:
- `tests/integration/server-smart-routing.test.ts` - 智能路由端到端
- `tests/integration/sse-service-real-client.test.ts` - SSE 实时连接

### 质量工具

- **Linter**: ESLint (`pnpm lint`)
- **Formatter**: Prettier (`pnpm format`)
- **Type Check**: TypeScript (`pnpm backend:build`)
- **Test Runner**: Jest (`pnpm test`)

---

## 常见问题 (FAQ)

**Q: 如何调试 MCP 服务器连接？**
A: 查看控制台日志，搜索 "Successfully connected client for server" 或错误信息。启用 `DEBUG=true` 环境变量获取详细日志。

**Q: 数据库迁移如何运行？**
A: 首次启用数据库模式时，系统会自动从 `mcp_settings.json` 迁移数据。TypeORM 的 `synchronize: true` 会自动同步 schema。

**Q: 如何添加新的 API 端点？**
A: 参考 AGENTS.md 的"API 开发"章节，需要在 routes、controllers、types 三层添加代码。

**Q: OAuth 客户端注册失败？**
A: 检查上游 MCP 服务器的 OAuth 配置，确保 `clientId`、`clientSecret`、`authUrl`、`tokenUrl` 正确。

---

## 相关文件清单

### 核心服务

- `src/services/mcpService.ts` - MCP 服务编排核心（606 行）
- `src/services/sseService.ts` - SSE 连接与消息处理
- `src/services/vectorSearchService.ts` - 智能路由向量搜索
- `src/services/oauthService.ts` - OAuth 客户端管理
- `src/services/oauthServerService.ts` - OAuth 授权服务器
- `src/services/groupService.ts` - 分组管理
- `src/services/userService.ts` - 用户管理
- `src/services/keepAliveService.ts` - 连接保活

### 数据访问

- `src/dao/DaoFactory.ts` - DAO 工厂（根据模式选择实现）
- `src/dao/ServerDao.ts` - 服务器 DAO（JSON）
- `src/dao/ServerDaoDbImpl.ts` - 服务器 DAO（DB）
- `src/db/connection.ts` - TypeORM 连接管理
- `src/db/repositories/` - Repository 层封装

### 路由与控制器

- `src/routes/index.ts` - 路由总入口（279 行）
- `src/controllers/serverController.ts` - 服务器管理
- `src/controllers/groupController.ts` - 分组管理
- `src/controllers/authController.ts` - 认证控制器
- `src/controllers/oauthServerController.ts` - OAuth 服务器控制器

### 中间件

- `src/middlewares/auth.ts` - JWT 认证中间件
- `src/middlewares/userContext.ts` - 用户上下文中间件
- `src/middlewares/i18n.ts` - i18n 中间件

### 工具与配置

- `src/config/index.ts` - 配置管理
- `src/config/configManager.ts` - 配置管理器
- `src/utils/migration.ts` - 数据库迁移工具
- `src/utils/i18n.ts` - i18n 初始化

---

## 下一步建议

已完成后端核心架构扫描，主要覆盖：
- ✅ 入口与启动流程
- ✅ HTTP API 端点清单
- ✅ 核心服务与数据模型
- ✅ DAO 双数据源实现
- ✅ 测试与质量工具

**建议深入扫描**:
1. `src/services/mcpService.ts` - 理解 MCP 连接管理细节
2. `src/services/vectorSearchService.ts` - 理解智能路由实现
3. `src/db/connection.ts` - 理解 pgvector 初始化逻辑
4. `src/utils/migration.ts` - 理解数据迁移流程
