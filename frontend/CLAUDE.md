# 前端模块 (frontend/)

**[根目录](../CLAUDE.md) > frontend**

> **模块职责**: 可视化管理界面、服务器/组/用户管理、实时监控
> **主要技术**: React 19.1.1 + Vite 6.3.5 + Tailwind CSS 4.1.12
> **最后更新**: 2025-12-01 12:10:33

---

## 变更记录 (Changelog)

### 2025-12-01
- 初始化前端模块文档
- 记录页面结构与组件架构

---

## 模块职责

前端提供 MCPHub 的可视化管理界面，包括：

1. **仪表板 (Dashboard)** - 服务器状态总览、工具/提示预览
2. **服务器管理 (Servers)** - 添加、编辑、删除、启用/禁用 MCP 服务器
3. **分组管理 (Groups)** - 创建服务器分组、批量管理
4. **用户管理 (Users)** - 用户账户管理（管理员功能）
5. **市场 (Market)** - 浏览社区 MCP 服务器
6. **日志查看 (Logs)** - 实时系统日志流
7. **设置 (Settings)** - 系统配置、OAuth 客户端管理
8. **认证 (Auth)** - 登录、注册、密码修改

---

## 入口与启动

### 主入口

**文件**: `frontend/src/main.tsx`

```typescript
// 启动流程：
// 1. 加载运行时配置（BASE_PATH、版本号）
// 2. 初始化 i18next（国际化）
// 3. 设置 fetch 拦截器（JWT、错误处理）
// 4. 渲染 React 根组件
```

### 根组件

**文件**: `frontend/src/App.tsx`

```typescript
// 应用结构：
<ThemeProvider>
  <AuthProvider>
    <ToastProvider>
      <ServerProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/servers" element={<ServersPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                {/* ... */}
              </Route>
            </Route>
          </Routes>
        </Router>
      </ServerProvider>
    </ToastProvider>
  </AuthProvider>
</ThemeProvider>
```

---

## 对外接口

### 页面路由

| 路径 | 组件 | 权限 | 说明 |
|------|------|------|------|
| `/login` | `LoginPage` | 公开 | 登录页面 |
| `/` | `Dashboard` | 需登录 | 仪表板 |
| `/servers` | `ServersPage` | 需登录 | 服务器管理 |
| `/groups` | `GroupsPage` | 需登录 | 分组管理 |
| `/users` | `UsersPage` | 需 admin | 用户管理 |
| `/market` | `MarketPage` | 需登录 | 市场浏览 |
| `/logs` | `LogsPage` | 需登录 | 日志查看 |
| `/settings` | `SettingsPage` | 需登录 | 系统设置 |

### API 服务

**文件**: `frontend/src/services/*.ts`

```typescript
// authService.ts
export const authService = {
  login(username: string, password: string): Promise<LoginResponse>
  register(username: string, password: string): Promise<void>
  getCurrentUser(): Promise<User>
  changePassword(currentPassword: string, newPassword: string): Promise<void>
}

// configService.ts
export const configService = {
  getAllServers(): Promise<ServerConfig[]>
  createServer(config: ServerConfig): Promise<void>
  updateServer(name: string, config: ServerConfig): Promise<void>
  deleteServer(name: string): Promise<void>
}

// toolService.ts
export const toolService = {
  callTool(server: string, tool: string, args: any): Promise<ToolResult>
}

// promptService.ts
export const promptService = {
  getPrompt(server: string, prompt: string, args: any): Promise<PromptResult>
}

// logService.ts
export const logService = {
  getLogs(limit?: number): Promise<LogEntry[]>
  clearLogs(): Promise<void>
  streamLogs(callback: (log: LogEntry) => void): EventSource
}
```

---

## 关键依赖与配置

### 核心依赖

```json
{
  "react": "19.1.1",                          // UI 框架
  "react-dom": "19.1.1",                      // React DOM
  "react-router-dom": "^7.8.2",               // 路由
  "vite": "^6.3.5",                           // 构建工具
  "@vitejs/plugin-react": "^4.7.0",          // Vite React 插件
  "tailwindcss": "^4.1.12",                   // CSS 框架
  "@tailwindcss/vite": "^4.1.12",            // Tailwind Vite 集成
  "react-i18next": "^15.7.2",                 // 国际化
  "i18next-browser-languagedetector": "^8.2.0", // 语言检测
  "lucide-react": "^0.552.0",                 // 图标库
  "zod": "^3.25.76"                           // Schema 验证
}
```

### 构建配置

**文件**: `frontend/vite.config.ts`

```typescript
export default defineConfig({
  base: './',  // 相对路径（运行时动态 BASE_PATH）
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // @ 别名
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',        // 开发代理
      '/auth': 'http://localhost:3000',
      '/config': 'http://localhost:3000',
    },
  },
})
```

### 环境变量

**运行时配置** (通过后端 `/config` 端点):
- `window.__MCPHUB_CONFIG__.basePath` - API 基础路径
- `window.__MCPHUB_CONFIG__.version` - 版本号
- `window.__MCPHUB_CONFIG__.name` - 应用名称

---

## 数据模型

### 核心类型

**文件**: `frontend/src/types/index.ts`

```typescript
export interface Server {
  name: string
  type: 'stdio' | 'sse' | 'streamable-http' | 'openapi'
  url?: string
  command?: string
  args?: string[]
  enabled: boolean
  owner?: string
  tools?: Tool[]
  prompts?: Prompt[]
}

export interface Group {
  id: string
  name: string
  description?: string
  serverNames: string[]
  owner?: string
}

export interface User {
  id: string
  username: string
  role: 'admin' | 'user'
}

export interface Tool {
  name: string
  description?: string
  enabled: boolean
  inputSchema?: any
}

export interface Prompt {
  name: string
  description?: string
  enabled: boolean
  arguments?: any[]
}
```

### 上下文状态

**AuthContext** (`frontend/src/contexts/AuthContext.tsx`):
```typescript
interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}
```

**ServerContext** (`frontend/src/contexts/ServerContext.tsx`):
```typescript
interface ServerContextType {
  servers: Server[]
  groups: Group[]
  refreshServers: () => Promise<void>
  refreshGroups: () => Promise<void>
}
```

**ToastContext** (`frontend/src/contexts/ToastContext.tsx`):
```typescript
interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}
```

---

## 测试与质量

### 测试策略

前端测试主要通过后端集成测试覆盖：
- API 交互通过 `tests/integration/` 验证
- 组件渲染由人工测试保障
- 构建正确性通过 `pnpm frontend:build` 验证

### 代码质量

- **类型检查**: TypeScript strict mode
- **构建验证**: Vite 构建成功
- **代码风格**: 遵循后端 ESLint/Prettier 规则

---

## 常见问题 (FAQ)

**Q: 如何调试 API 调用？**
A: 打开浏览器开发者工具 Network 面板，查看 `/api/*` 请求。或在 `frontend/src/utils/fetchInterceptor.ts` 添加 console.log。

**Q: 如何添加新页面？**
A:
1. 在 `frontend/src/pages/` 创建组件
2. 在 `App.tsx` 添加 `<Route>`
3. 在 `Sidebar.tsx` 添加导航链接

**Q: 如何修改主题颜色？**
A: 编辑 `frontend/src/index.css` 中的 CSS 变量，或修改 Tailwind 配置。

**Q: i18n 翻译如何添加？**
A: 在 `frontend/public/locales/{lang}/{namespace}.json` 添加键值对，然后在组件中使用 `t('key')`。

**Q: 为什么前端刷新后 404？**
A: 确保后端正确配置了 SPA 回退路由（`server.ts` 中的通配符路由）。

---

## 相关文件清单

### 页面组件

- `src/pages/Dashboard.tsx` - 仪表板（服务器状态总览）
- `src/pages/ServersPage.tsx` - 服务器管理页面
- `src/pages/GroupsPage.tsx` - 分组管理页面
- `src/pages/UsersPage.tsx` - 用户管理页面（管理员）
- `src/pages/MarketPage.tsx` - 市场浏览页面
- `src/pages/LogsPage.tsx` - 日志查看页面
- `src/pages/SettingsPage.tsx` - 系统设置页面
- `src/pages/LoginPage.tsx` - 登录页面

### 核心组件

**表单组件**:
- `src/components/AddServerForm.tsx` - 添加服务器表单
- `src/components/EditServerForm.tsx` - 编辑服务器表单
- `src/components/AddGroupForm.tsx` - 添加分组表单
- `src/components/AddUserForm.tsx` - 添加用户表单

**卡片组件**:
- `src/components/ServerCard.tsx` - 服务器卡片
- `src/components/GroupCard.tsx` - 分组卡片
- `src/components/UserCard.tsx` - 用户卡片
- `src/components/MarketServerCard.tsx` - 市场服务器卡片

**布局组件**:
- `src/components/layout/Sidebar.tsx` - 侧边栏导航
- `src/components/layout/Header.tsx` - 顶部栏
- `src/components/layout/Content.tsx` - 内容容器

**UI 组件**:
- `src/components/ui/Button.tsx` - 按钮
- `src/components/ui/Toast.tsx` - 提示消息
- `src/components/ui/Pagination.tsx` - 分页
- `src/components/ui/DeleteDialog.tsx` - 删除确认对话框
- `src/components/ui/ToolCard.tsx` - 工具卡片
- `src/components/ui/PromptCard.tsx` - 提示卡片

### 服务与工具

- `src/services/authService.ts` - 认证 API
- `src/services/configService.ts` - 配置 API
- `src/services/toolService.ts` - 工具调用 API
- `src/services/promptService.ts` - 提示获取 API
- `src/services/logService.ts` - 日志 API
- `src/utils/api.ts` - API 基础封装
- `src/utils/fetchInterceptor.ts` - Fetch 拦截器（JWT 自动注入）
- `src/utils/runtime.ts` - 运行时配置加载

### Hooks

- `src/hooks/useServerData.ts` - 服务器数据 Hook
- `src/hooks/useGroupData.ts` - 分组数据 Hook
- `src/hooks/useUserData.ts` - 用户数据 Hook
- `src/hooks/useMarketData.ts` - 市场数据 Hook
- `src/hooks/useCloudData.ts` - 云服务器数据 Hook
- `src/hooks/useRegistryData.ts` - 注册中心数据 Hook

---

## 下一步建议

已完成前端核心架构扫描，主要覆盖：
- ✅ 页面路由与组件结构
- ✅ API 服务封装
- ✅ 核心数据模型
- ✅ 上下文状态管理
- ✅ 常用组件清单

**建议深入扫描**:
1. `src/pages/Dashboard.tsx` - 理解仪表板数据流
2. `src/utils/fetchInterceptor.ts` - 理解 API 拦截逻辑
3. `src/components/ServerForm.tsx` - 理解表单验证逻辑
4. `src/contexts/AuthContext.tsx` - 理解认证状态管理
