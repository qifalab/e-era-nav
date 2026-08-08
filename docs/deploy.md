# 部署说明

`nav.emoera.com` 的构建与发布全部由 GitHub Actions 完成。服务器只接收构建产物，不安装 Node 或任何构建依赖。

## 分支策略

| 场景 | 触发的工作流 | 行为 |
| --- | --- | --- |
| Pull Request | `ci.yml` | lint、类型检查、单元测试、构建。**不会部署**，也拿不到部署密钥 |
| 合并进 `master` | `ci.yml` + `deploy.yml` | 重新校验并构建，然后发布到源站并自动验收 |
| 手动 | `deploy.yml`（workflow_dispatch） | `deploy` / `rollback` / `list` |

`master` 是唯一会发布的分支。外部贡献者的 PR 只跑检查，因为 `pull_request` 事件在 GitHub 上拿不到仓库 Secret。

### 关于 Playwright E2E

E2E 不是 PR 的必过关卡，需要手动开启：给 PR 打 `run-e2e` 标签，或手动 dispatch `CI` 工作流。

原因是这套测试跑的是真实 3D 场景，而 `src/lib/capabilities.js` 里的 `detectWebGL()` 有意把 SwiftShader / llvmpipe 等软件渲染器判为不可用（`capabilities.test.js` 里有对应断言）。GitHub 托管 runner 没有 GPU，页面会正确地降级到 2D 列表，于是所有 3D 断言都失败 —— 强行开 SwANGLE 也没用，因为拒绝是刻意的。**本地有 GPU 的机器上这套测试是全绿的**，请在本地跑：

```bash
npx playwright install chromium
npm run test:e2e
```

## 发布机制

服务器上是"版本目录 + 符号链接"的原子切换：

```
/opt/datacore/frontend-sites/.releases/nav.emoera.com/<版本>/   构建产物
/opt/datacore/frontend-sites/nav.emoera.com -> .releases/nav.emoera.com/<版本>
```

版本号形如 `20260728T145718Z-ad44394`（UTC 时间戳 + 提交短 SHA）。切换是一次 `rename(2)`，不存在"半新半旧"的中间状态；保留最近 5 个版本。

发布由服务器上的 `/opt/datacore/web-sites/bin/site-deploy` 执行，`we.emoera.com` 用的是同一套机制。CI 侧的 `scripts/deploy-release.sh` 是唯一的客户端，两个站点仓库里的这个脚本内容一致，改动时请同步。

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

`nav.emoera.com` 走腾讯云 EdgeOne，源站是 `DEPLOY_HOST` 这台机器的 80 端口（HTTP 回源，用户侧 HTTPS 由 EdgeOne 终结）。源站缓存策略：

- `/assets/*`：`public, max-age=31536000, immutable` —— Vite 产物带内容哈希，改动必然换文件名
- `/brand/*`、`/app-icons/*`：`public, max-age=86400`（无内容哈希，按天回源校验）
- `index.html` 与 SPA 回退：`no-store, must-revalidate`

因为 HTML 不缓存、静态资源换名，**正常发布不需要刷新 CDN**。只有在改了不带哈希的文件（例如替换 `brand/` 下的图）且需要立即生效时，才去 EdgeOne 控制台对相应路径刷新缓存。

## 需要在 GitHub 配置的 Secret

仓库 → Settings → Secrets and variables → Actions：

| 名称 | 内容 |
| --- | --- |
| `DEPLOY_HOST` | 源站 IP |
| `DEPLOY_USER` | 服务器上的部署账号（`deployer`） |
| `DEPLOY_SSH_KEY` | 专用部署私钥（ed25519，无口令） |
| `DEPLOY_KNOWN_HOSTS` | 源站主机公钥行，用于严格校验，避免中间人 |

`deployer` 不是 root，没有 sudo shell，SSH 公钥绑定了 forced command：这把钥匙只能执行 `publish` / `activate` / `rollback` / `list` / `current`，且只能作用于允许清单里的站点。即使私钥泄露，也无法在服务器上执行任意命令。
