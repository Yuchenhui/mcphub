# 文档模块 (docs/)

**[根目录](../CLAUDE.md) > docs**

> **模块职责**: API 参考文档、用户指南、功能说明
> **文档框架**: Mintlify (MDX 格式)
> **最后更新**: 2025-12-01 12:10:33

---

## 变更记录 (Changelog)

### 2025-12-01
- 初始化文档模块文档
- 记录文档结构与内容组织

---

## 模块职责

文档模块提供：

1. **API 参考** - HTTP API 端点详细说明
2. **功能指南** - 核心功能使用教程
3. **配置指南** - MCP 服务器配置、数据库配置
4. **开发指南** - 本地开发环境搭建

文档托管地址: https://docs.mcphubx.com/

---

## 入口与启动

### 文档结构

**文件**: `docs/docs.json`

```json
{
  "name": "MCPHub",
  "logo": {
    "dark": "/logo/dark.svg",
    "light": "/logo/light.svg"
  },
  "navigation": [
    {
      "group": "快速开始",
      "pages": ["quickstart"]
    },
    {
      "group": "配置",
      "pages": [
        "configuration/mcp-settings",
        "configuration/database-configuration",
        "configuration/docker-setup"
      ]
    },
    {
      "group": "功能",
      "pages": [
        "features/authentication",
        "features/oauth",
        "features/server-management",
        "features/group-management",
        "features/monitoring",
        "features/smart-routing"
      ]
    },
    {
      "group": "API 参考",
      "pages": [
        "api-reference/introduction",
        "api-reference/auth",
        "api-reference/config",
        "api-reference/groups"
      ]
    }
  ]
}
```

---

## 对外接口

### 文档分类

**快速开始**:
- `quickstart.mdx` - 5 分钟快速上手

**配置指南**:
- `configuration/mcp-settings.mdx` - MCP 服务器配置选项
- `configuration/database-configuration.mdx` - PostgreSQL 生产环境配置
- `configuration/docker-setup.mdx` - Docker 部署指南

**功能指南**:
- `features/authentication.mdx` - JWT 认证与用户管理
- `features/oauth.mdx` - OAuth 2.0 客户端与服务器配置
- `features/server-management.mdx` - 服务器管理功能
- `features/group-management.mdx` - 服务器分组功能
- `features/monitoring.mdx` - 监控与日志
- `features/smart-routing.mdx` - 智能路由（AI 驱动的工具发现）

**API 参考**:
- `api-reference/introduction.mdx` - API 总览
- `api-reference/auth.mdx` - 认证 API
- `api-reference/config.mdx` - 配置 API
- `api-reference/groups.mdx` - 分组 API

**开发指南**:
- `development.mdx` - 本地开发环境详细配置

---

## 关键依赖与配置

### Mintlify 配置

**文件**: `docs/docs.json`

主要配置项：
- `name`: 文档站点名称
- `logo`: 站点 Logo（深色/浅色模式）
- `favicon`: 站点图标
- `navigation`: 导航结构
- `colors`: 主题颜色配置
- `topbarLinks`: 顶部导航链接

### 部署

文档通过 Mintlify 平台自动部署：
- 推送到 GitHub → Mintlify 自动构建 → 发布到 docs.mcphubx.com

---

## 数据模型

### MDX 文档格式

```mdx
---
title: "API 参考 - 认证"
description: "MCPHub 认证 API 端点详细说明"
---

# 认证 API

## 登录

<Card>
  **POST** `/api/auth/login`
</Card>

### 请求体

```json
{
  "username": "admin",
  "password": "admin123"
}
```

### 响应

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "admin"
  }
}
```
```

---

## 测试与质量

### 文档质量检查

- **链接检查**: 确保所有内部链接有效
- **代码示例验证**: 确保代码示例可运行
- **多语言支持**: 检查翻译一致性（未来）

### 更新策略

- **API 变更**: 必须同步更新 API 参考文档
- **功能新增**: 必须添加对应功能指南
- **重大变更**: 必须在 Changelog 中标注

---

## 常见问题 (FAQ)

**Q: 如何本地预览文档？**
A: 安装 Mintlify CLI: `npm i -g mintlify` → 运行 `mintlify dev` 在 `docs/` 目录。

**Q: 如何添加新文档页面？**
A:
1. 在 `docs/` 创建 `.mdx` 文件
2. 在 `docs.json` 的 `navigation` 中添加引用
3. 提交到 GitHub，Mintlify 自动部署

**Q: 如何嵌入代码示例？**
A: 使用 MDX 的代码块语法，支持语法高亮和复制按钮。

**Q: 文档如何支持多语言？**
A: 目前主要支持英文，中文通过 README.zh.md 提供。未来可通过 Mintlify 的多语言功能扩展。

---

## 相关文件清单

### 核心文档

**快速开始**:
- `docs/quickstart.mdx` - 快速开始指南

**配置指南**:
- `docs/configuration/mcp-settings.mdx` - MCP 服务器配置
- `docs/configuration/database-configuration.mdx` - 数据库配置
- `docs/configuration/docker-setup.mdx` - Docker 部署

**功能指南**:
- `docs/features/authentication.mdx` - 认证功能
- `docs/features/oauth.mdx` - OAuth 集成
- `docs/features/server-management.mdx` - 服务器管理
- `docs/features/group-management.mdx` - 分组管理
- `docs/features/monitoring.mdx` - 监控与日志
- `docs/features/smart-routing.mdx` - 智能路由

**API 参考**:
- `docs/api-reference/introduction.mdx` - API 总览
- `docs/api-reference/auth.mdx` - 认证 API
- `docs/api-reference/config.mdx` - 配置 API
- `docs/api-reference/groups.mdx` - 分组 API

**开发指南**:
- `docs/development.mdx` - 开发环境配置

### 辅助文档

**示例文档**:
- `docs/essentials/markdown.mdx` - Markdown 语法示例
- `docs/essentials/code.mdx` - 代码块示例
- `docs/essentials/images.mdx` - 图片使用示例
- `docs/essentials/settings.mdx` - 配置示例
- `docs/essentials/navigation.mdx` - 导航示例
- `docs/essentials/reusable-snippets.mdx` - 可复用片段

**配置文件**:
- `docs/docs.json` - Mintlify 配置文件
- `docs/favicon.svg` - 站点图标
- `docs/README.md` - 文档模块说明

---

## 下一步建议

已完成文档模块核心架构扫描，主要覆盖：
- ✅ 文档结构与分类
- ✅ Mintlify 配置
- ✅ MDX 文档格式
- ✅ 部署流程

**建议深入扫描**:
1. `docs/features/smart-routing.mdx` - 理解智能路由文档内容
2. `docs/api-reference/*.mdx` - 理解 API 文档写作风格
3. `docs/docs.json` - 理解 Mintlify 完整配置选项
