# 提交到 DSH 插件市场

DSH 目前唯一被社区市场（[dsh-market](https://github.com/dsh-market/dsh-market)、[dshmarket.com](https://dshmarket.com)、[awesome-dsh-plugin.com](https://awesome-dsh-plugin.com)，以及 official DSH 的 **插件 → 发现 → 索引源**）共用的目录是精选列表仓库 **`awesome-dsh-plugin/awesome-dsh-plugin`**。

**流程一句话：把插件做成一个公开 GitHub 仓库（`package.json` 里声明 `dsh.bundle`）→（推荐）发到 npm → 往 awesome-dsh-plugin 提一个只加一个 YAML 文件的 PR → 合并后市场自动收录。**

当前状态：包名还是本地私有的 `@local/ygritte-boot`（`link:` 安装），**还不能直接发布**。下面从发布前改造开始。

---

## 0. 先选公共名字

建议：

- npm 包名：**`dsh-ygritte-boot`** —— 已查 npm registry，当前**未被占用**
- GitHub 仓库名：**`dsh-ygritte-boot`**（与包名一致最省事）

> 如果你的 npm 账号是 scoped 包（如 `@yourname/dsh-ygritte-boot`），安装命令和 `cordis.patch.yml` 里都用带 scope 的全名即可；市场 YAML 里不需要写 npm 名，npm ↔ 仓库的关联由已发布包的 `repository` 字段自动识别。

## 1. 发布前改造

本地这份 `ygritte-boot/` 继续作为 `link:` 安装的开发副本，不要直接改它的包名。仓库自带一个 staging 脚本，会生成一份公共名、可直接 push 的发布目录：

```powershell
# 在 ygritte-boot/ 下执行
node scripts/stage-publish.mjs --owner <你的GitHub用户名> --name dsh-ygritte-boot
```

它会在同级生成 `dsh-ygritte-boot/`：`package.json` 换成公共名、写入 `repository/homepage/bugs`、去掉 `private`，`cordis.patch.yml` 同步改名；随后在发布目录里执行：

```powershell
cd ../dsh-ygritte-boot
node scripts/build.mjs
node scripts/check.mjs
pnpm pack          # 或 npm pack，确认 tarball 内容
```

手工改造（不用脚本）时同样要做这几处：

1. **`package.json`** 改这几处：

   ```jsonc
   {
     "name": "dsh-ygritte-boot",
     "version": "1.3.0",
     // 删除 "private": true —— 私有包发不了 npm
     "description": "Full-screen ice-and-fire boot intro + Ygritte identity authorization for DSH",
     "license": "MIT",
     "repository": { "type": "git", "url": "git+https://github.com/Ygritteee/dsh-ygritte-boot.git" },
     "homepage": "https://github.com/Ygritteee/dsh-ygritte-boot#readme",
     "bugs": { "url": "https://github.com/Ygritteee/dsh-ygritte-boot/issues" },
     "keywords": ["dsh", "dsh-plugin", "boot-animation", "splash", "ui"],
     "publishConfig": { "access": "public" },
     "dsh": {
       "bundle": { "patch": "./cordis.patch.yml" },   // 必须；只声明 dsh.client 会被市场 CI 拒绝
       "client": { "platform": "web" }                 // 本插件有浏览器半边
     }
   }
   ```

2. **`cordis.patch.yml`** 里的模块名必须同步改成已发布的包名，否则安装后加载失败：

   ```yaml
   - insert:
       - id: ygritte-boot
         name: dsh-ygritte-boot
   ```

3. **重新构建并自检**（新包名会被写进浏览器 bundle 的 module id）：

   ```powershell
   node scripts/build.mjs
   node scripts/check.mjs
   ```

4. **确认要发布的内容**（`client.js` / `preview/` 是预构建产物，必须一起进仓库和 npm 包）：

   ```powershell
   pnpm pack            # 或 npm pack
   tar -tf dsh-ygritte-boot-1.3.0.tgz
   ```

5. 本仓库已带 `LICENSE`、`README.md`、`icon.svg`、`locale/`、`preview/`；仓库根再加一个 `.gitignore` 就齐了。

## 2. 建公开 GitHub 仓库

- 新建 public 仓库，把本目录内容推上去；**已构建的 `client.js` 与 `preview/index.html` 要提交**（这样从源码安装也不需要构建授权）。
- 仓库加 topic：**`dsh-plugin`**。
- **仓库创建必须满 1 天**才能通过市场 CI（会读 GitHub API 校验，不是人工判断）。
- 项目要保持可维护：描述属实、有真实代码、不是占位仓库。

## 3. 发布到 npm（可选但强烈推荐）

```powershell
npm login
npm publish --access public
```

- 预构建 npm 安装可以跳过 `allowBuilds` 构建审批，安装体验最好。
- **`repository` 字段必须指回上面那个 GitHub 仓库**；市场靠它自动把 npm 包和条目关联起来（条目里没有、也不能手写 `npm:` 字段）。
- 之后每次更新：改版本号 → build/check → `npm publish` → 市场会显示新版本。

> 不想发 npm 也可以：把 `pnpm pack` 出来的 tgz 挂到 GitHub Release，提交条目时用 `tarball:` 字段指向**带 tag 的固定 URL**（`releases/download/v1.3.0/...`，不要用 `latest/download/` + 带版本文件名，会 404）。

## 4. 本地验证安装

```powershell
dsh plugin --profile web add dsh-ygritte-boot
```

Desktop 端由应用自己管理 profile：**设置 → 插件 → 安装**，输入 `dsh-ygritte-boot`，装完重启/刷新。
展开后的行为应与本仓库「预览页 + 设置页 + 开机片头」一致。

## 5. 提交市场 PR

1. Fork **`https://github.com/awesome-dsh-plugin/awesome-dsh-plugin`**。
2. 新建一个分支，**只加一个文件**：

   ```
   data/plugins/Ygritteee__dsh-ygritte-boot.yml
   ```

   内容照 [`market-entry.example.yml`](./market-entry.example.yml)（`url` 必须和仓库地址完全一致；`description.en` 必填，中文可留空由维护者补）。

3. 提交 PR。**一个 PR 最多 3 条**；不要手改两个 README（它们由 `data/plugins/*.yml` 生成）。
4. CI 依次检查：条目数 → 仓库 `package.json` 的 `dsh.bundle` → 仓库年龄 → awesome-lint/站点构建。
5. 维护者会实际读你的仓库，确认：描述与代码一致、分类合理、不是空壳、没有和已有条目重复、没有可疑代码。
6. 合并后站点自动重建；`dshmarket` 每次打开都实时拉目录，**通常一天内**就能在「插件 → 发现」搜到；official DSH 的 Discover 添加索引源后同样可搜：

   ```
   https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json
   ```

## 6. 可选的商店素材（推荐）

- **截图**：在仓库根放 `screenshots.json`，列出 1–8 张仓库内相对路径：

  ```json
  ["docs/preview-full.png", "docs/preview-quick.png"]
  ```

  市场详情页会像 App Store 一样轮播；不写则回退到从 README 自动抽取图片。
- **图标**：条目里的 `icon:` 必须是 **GitHub 托管的位图**（png/jpg/webp，约 96px 显示，方形最佳）。SVG 与第三方图床会被拒绝；不写则回退到作者 GitHub 头像。
- 截图/图标都可以之后推自己仓库更新，不用再提 PR。

## 7. 常见被拒原因（对照自查）

- 只声明了 `dsh.client`，没有 `dsh.bundle.patch`（本插件两者都有）。
- 仓库创建不满 1 天。
- 描述夸大/不准确（写了不存在的功能、数字、命令）。
- 分类不符合实际（本插件选 `ui`；纯主题/皮肤才选 `theme`）。
- 仓库是占位或没有可运行代码。
- 一个 PR 提太多条，或顺手改了别人的条目。
- 手改生成的 README 而不是 `data/plugins/*.yml`。

## 8. 生效后用户怎么装

- **装了 dshmarket 的用户**：插件 → 发现 / Discover → 搜索 `Ygritte` 或 `dsh-ygritte-boot` → 一键安装。
- **official DSH 用户**：插件 → 发现 → 索引源 添加上面那条 jsDelivr 地址 → 搜索。
- **命令行**：`dsh plugin --profile <profilename> add dsh-ygritte-boot`。
- **Desktop**：设置 → 插件 → 安装 → 输入包名。
