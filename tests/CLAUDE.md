# 测试模块 (tests/)

**[根目录](../CLAUDE.md) > tests**

> **模块职责**: 单元测试、集成测试、测试工具与辅助函数
> **测试框架**: Jest 30.2.0 + ts-jest + Supertest
> **最后更新**: 2025-12-01 12:10:33

---

## 变更记录 (Changelog)

### 2025-12-01
- 初始化测试模块文档
- 记录测试结构与覆盖策略

---

## 模块职责

测试模块负责：

1. **单元测试** - 独立函数、工具类、服务类的单元测试
2. **集成测试** - 跨服务、跨层的端到端测试
3. **控制器测试** - HTTP API 端点测试（使用 Supertest）
4. **服务测试** - 业务逻辑与数据流测试
5. **测试工具** - Mock 数据、测试辅助函数、共享 Setup

---

## 入口与启动

### 测试配置

**文件**: `jest.config.cjs`

```javascript
module.exports = {
  preset: 'ts-jest/presets/default-esm',  // ESM 支持
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{ts,tsx}',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],  // 全局 Setup
  coverageDirectory: 'coverage',
  testTimeout: 30000,  // 30 秒超时（MCP 连接需要时间）
}
```

### 全局 Setup

**文件**: `tests/setup.ts`

```typescript
// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

// Mock 外部依赖（如需要）
// 清理测试数据（如需要）
```

---

## 对外接口

### 测试运行命令

```bash
# 交互模式（开发）
pnpm test

# Watch 模式（TDD）
pnpm test:watch

# CI 模式（快速）
pnpm test:ci

# 覆盖率报告
pnpm test:coverage

# 详细输出
pnpm test:verbose
```

---

## 关键依赖与配置

### 测试依赖

```json
{
  "jest": "^30.2.0",                    // 测试框架
  "ts-jest": "^29.4.1",                 // TypeScript 支持
  "@swc/jest": "^0.2.39",               // SWC 转换器（可选）
  "supertest": "^7.1.4",                // HTTP 测试
  "jest-mock-extended": "4.0.0",        // Mock 增强
  "@types/jest": "^30.0.0",             // Jest 类型
  "@types/supertest": "^6.0.3"          // Supertest 类型
}
```

### 覆盖率配置

```javascript
collectCoverageFrom: [
  'src/**/*.{ts,tsx}',      // 覆盖所有 src 文件
  '!src/**/*.d.ts',         // 排除类型定义
  '!src/index.ts',          // 排除入口文件
  '!src/**/__tests__/**',   // 排除测试文件
]
```

---

## 数据模型

### Mock 数据

**文件**: `tests/utils/mockSettings.ts`

```typescript
export const mockMcpSettings = {
  mcpServers: {
    'test-server': {
      command: 'node',
      args: ['test.js'],
      enabled: true,
    },
  },
  users: [
    {
      username: 'admin',
      password: 'hashedPassword',
      role: 'admin',
    },
  ],
}
```

### 测试辅助函数

**文件**: `tests/utils/testHelpers.ts`

```typescript
// 创建测试用 Express 应用
export function createTestApp(): express.Application

// 生成测试用 JWT Token
export function generateTestToken(user: User): string

// Mock MCP 服务器响应
export function mockMcpServerResponse(tools: Tool[]): void
```

**文件**: `tests/utils/testServerHelper.ts`

```typescript
// 创建测试用 MCP 服务器实例
export async function createTestServer(config: ServerConfig): Promise<void>

// 清理测试服务器
export async function cleanupTestServer(name: string): Promise<void>
```

---

## 测试与质量

### 测试结构

```
tests/
├── setup.ts                          # 全局 Setup
├── basic.test.ts                     # 基础功能测试
├── auth.logic.test.ts                # 认证逻辑测试
├── utils/                            # 测试工具
│   ├── mockSettings.ts               # Mock 数据
│   ├── testHelpers.ts                # 辅助函数
│   ├── testServerHelper.ts           # 服务器辅助
│   ├── parameterConversion.test.ts   # 参数转换测试
│   ├── pathLogic.test.ts             # 路径逻辑测试
│   └── cliPathHandling.test.ts       # CLI 路径测试
├── integration/                      # 集成测试
│   ├── server-smart-routing.test.ts  # 智能路由端到端
│   └── sse-service-real-client.test.ts # SSE 实时连接
├── services/                         # 服务测试
│   ├── mcpService-smart-routing-group.test.ts
│   ├── mcpService-headers.test.ts
│   ├── keepalive.test.ts
│   ├── oauthService.test.ts
│   ├── requestContextService.test.ts
│   └── openApiGeneratorService.test.ts
├── controllers/                      # 控制器测试
│   ├── openApiController.test.ts
│   └── configController.test.ts
├── models/                           # 模型测试
│   └── oauth.test.ts
└── config/                           # 配置测试
    └── replaceEnvVars.test.ts
```

### 测试类型

**单元测试** (快速、隔离):
- `tests/utils/*.test.ts` - 工具函数测试
- `tests/config/*.test.ts` - 配置逻辑测试
- `tests/models/*.test.ts` - 数据模型测试

**服务测试** (业务逻辑):
- `tests/services/*.test.ts` - 服务层测试
- `src/services/__tests__/*.test.ts` - 服务内部测试

**控制器测试** (HTTP API):
- `tests/controllers/*.test.ts` - 使用 Supertest 的 API 测试

**集成测试** (端到端):
- `tests/integration/*.test.ts` - 跨层、跨服务的完整流程测试

### 覆盖率目标

当前覆盖率（参考）:
- **Branches**: 实际覆盖关键分支
- **Functions**: 覆盖核心业务函数
- **Lines**: 覆盖主要代码路径
- **Statements**: 覆盖关键语句

> 注：`jest.config.cjs` 中 `coverageThreshold` 设为 0，表示不强制最低覆盖率，但应保持或提升覆盖率。

---

## 常见问题 (FAQ)

**Q: 测试超时怎么办？**
A: 增加 `jest.config.cjs` 中的 `testTimeout`，或在特定测试中使用 `jest.setTimeout(60000)`。

**Q: 如何 Mock MCP 服务器？**
A: 使用 `jest.mock()` Mock `@modelcontextprotocol/sdk`，或使用 `tests/utils/testServerHelper.ts` 创建真实测试服务器。

**Q: 如何运行单个测试文件？**
A: `pnpm test tests/services/mcpService-smart-routing-group.test.ts`

**Q: 如何调试测试？**
A: 在 VS Code 中使用 Jest 调试配置，或添加 `console.log` 并运行 `pnpm test:verbose`。

**Q: 集成测试失败怎么排查？**
A: 检查日志输出、验证 Mock 数据、确认测试环境变量正确设置。

---

## 相关文件清单

### 核心测试文件

**基础测试**:
- `tests/basic.test.ts` - 基础功能测试（项目结构、配置加载）
- `tests/auth.logic.test.ts` - 认证逻辑测试（JWT、密码验证）

**集成测试**:
- `tests/integration/server-smart-routing.test.ts` - 智能路由完整流程（向量搜索 → 工具调用）
- `tests/integration/sse-service-real-client.test.ts` - SSE 实时连接测试（真实客户端）

**服务测试**:
- `tests/services/mcpService-smart-routing-group.test.ts` - 智能路由分组测试
- `tests/services/mcpService-headers.test.ts` - MCP 请求头测试
- `tests/services/keepalive.test.ts` - Keep-Alive 服务测试
- `tests/services/oauthService.test.ts` - OAuth 服务测试
- `tests/services/requestContextService.test.ts` - 请求上下文测试
- `tests/services/openApiGeneratorService.test.ts` - OpenAPI 生成器测试

**控制器测试**:
- `tests/controllers/openApiController.test.ts` - OpenAPI 端点测试
- `tests/controllers/configController.test.ts` - 配置端点测试

**工具测试**:
- `tests/utils/parameterConversion.test.ts` - 参数转换工具测试
- `tests/utils/pathLogic.test.ts` - 路径逻辑测试
- `tests/utils/cliPathHandling.test.ts` - CLI 路径处理测试

### 测试辅助文件

- `tests/setup.ts` - Jest 全局 Setup
- `tests/utils/mockSettings.ts` - Mock MCP 配置数据
- `tests/utils/testHelpers.ts` - 通用测试辅助函数
- `tests/utils/testServerHelper.ts` - MCP 服务器测试辅助

---

## 下一步建议

已完成测试模块核心架构扫描，主要覆盖：
- ✅ 测试配置与运行方式
- ✅ 测试结构与分类
- ✅ Mock 数据与辅助函数
- ✅ 覆盖率策略

**建议深入扫描**:
1. `tests/integration/server-smart-routing.test.ts` - 理解智能路由完整测试流程
2. `tests/services/oauthService.test.ts` - 理解 OAuth 测试策略
3. `tests/utils/testServerHelper.ts` - 理解如何创建测试用 MCP 服务器
4. `src/services/__tests__/schema-cleanup.test.ts` - 理解服务内部测试模式
