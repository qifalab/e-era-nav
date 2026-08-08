# 部署说明

`nav.emoera.com` 的构建与发布全部由 GitHub Actions 完成。服务器只接收构建产物，不安装 Node 或任何构建依赖。

## 分支策略

| 场景 | 触发的工作流 | 行为 |
| --- | --- | --- |
| Pull Request | `ci.yml` | 安装锁定依赖并执行生产构建，上传构建产物。**不会部署**，也拿不到部署密钥 |
| 合并进 `main` | `ci.yml` + `deploy.yml` | 生产构建并发布到源站 |
| 手动 | `deploy.yml`（workflow_dispatch） | `deploy` / `rollback` / `list` |

`main` 是唯一会发布的分支。外部贡献者的 PR 只做生产构建，且 GitHub 不会向 PR 暴露仓库 Secret。

自动化部署不运行 lint、类型检查、单元测试或 E2E；提交者应在推送前于本地完成需要的验证。3D E2E 需要真实硬件 WebGL 环境，不属于远端发布链路。

## 发布机制

`deploy.yml` 使用 UTC 时间戳和提交短 SHA 生成版本号，将 `dist/` 打包后交给受限部署接口。源站以版本目录保存发布结果并原子切换当前版本，避免出现半更新状态；具体服务器目录和账号配置不属于公开仓库。

发布完成后 CI 会直接回源验收（绕过 CDN）：确认 `current` 已切到新版本、`/` 返回 200、且本次构建产出的 `assets/*` 文件在源站可取到。任何一项不通过就让工作流失败。

## 回滚

GitHub → Actions → **Deploy** → Run workflow：

- `operation: rollback`，`version` 留空 → 回到上一个版本
- `operation: rollback`，填入版本号 → 回到指定版本
- `operation: list` → 查看服务器上现有版本

回滚只是切符号链接，秒级完成，不重新构建。

## 本地构建

```bash
nvm use            # 读取 .nvmrc（Node 22）
npm ci
npm run dev        # 开发服务器
npm run build      # 产物在 dist/
npm run preview    # 本地预览构建结果
npm run lint && npm run typecheck && npm test
npm run test:e2e   # 需要先 npx playwright install chromium
```

## CDN 与缓存

`nav.emoera.com` 使用 CDN。源站缓存策略：

- `/assets/*`：`public, max-age=31536000, immutable` —— Vite 产物带内容哈希，改动必然换文件名
- `/brand/*`、`/app-icons/*`：`public, max-age=86400`（无内容哈希，按天回源校验）
- `index.html` 与 SPA 回退：`no-store, must-revalidate`

因为 HTML 不缓存、静态资源换名，**正常发布不需要刷新 CDN**。只有在改了不带哈希的文件（例如替换 `brand/` 下的图）且需要立即生效时，才去 EdgeOne 控制台对相应路径刷新缓存。

## 需要在 GitHub 配置的 Secret

仓库 → Settings → Secrets and variables → Actions：

| 名称 | 内容 |
| --- | --- |
| `DEPLOY_HOST` | 源站地址 |
| `DEPLOY_USER` | 受限部署账号 |
| `DEPLOY_SSH_KEY` | 专用部署私钥（ed25519，无口令） |
| `DEPLOY_KNOWN_HOSTS` | 源站主机公钥行，用于严格校验，避免中间人 |

部署账号应使用受限权限，并将部署公钥绑定到只允许发布、回滚和查询版本的服务器端入口。任何 Secret 都不得提交到仓库。
