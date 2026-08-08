# e-era-nav

E时代导航站（`https://nav.emoera.com/`）。Vite + 原生 JS/Three.js 构建的单页应用，聚合 E时代生态的产品服务、通行证生态与团队入口。

## 快速开始

```bash
nvm use        # Node 22，见 .nvmrc
npm ci
npm run dev
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 开发服务器 |
| `npm run build` | 生产构建，输出到 `dist/` |
| `npm run preview` | 预览构建结果 |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest 单元测试 |
| `npm run test:e2e` | Playwright 端到端测试 |

## 提交与发布

PR 只会跑检查，合并进 `master` 才会自动发布到线上。流程、回滚方式与所需 Secret 见 [`docs/deploy.md`](docs/deploy.md)。

## 其他文档

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — 架构与设计约束
- [`CARD-3D-DESIGN.md`](CARD-3D-DESIGN.md) — 3D 卡片设计
- [`CONTENT-AUDIT.md`](CONTENT-AUDIT.md) — 内容核对
