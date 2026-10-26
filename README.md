# dsh-ygritte-boot

**给 DeepSeek Harness 加一段「冰与火」开机片头，接一张 Ygritte 的自由民身份授权卡。**

打开 DSH 的第一眼：上冷下热的冰霜/余烬温度场、霜雪与火星双向流动、双色 Ygritte 词标与纹章，然后是启动日志、发丝进度与一次五步身份核验。核验对象是一名为自由民工作的游骑兵 —— **Ygritte**，编号 `YGRT-0117`。点击或按 `Enter` 快进，`Esc` 随时跳过；设置里可以换档、关掉或立刻预览。

> 发布包名：`dsh-ygritte-boot`（npm / 插件市场）。本工作区的 `@local/ygritte-boot` 是本地开发副本，两者代码相同。

---

## 安装

- **DSH Desktop**：设置 → 插件 → 安装 → 输入 `dsh-ygritte-boot`（装完重启/刷新客户端）
- **命令行**：`dsh plugin --profile <profile> add dsh-ygritte-boot`
- **插件市场**：dsh-market「发现」或官方 Discover 搜 `Ygritte`（收录后）
- **本地开发**：见下方「安装 / 启用」的 `link:` 流程

---

## 功能

### 🧊 开机片头

- **两个档位**：简易档约 4 秒（上电 → 符环 / 字标 → 身份卡）／ 完整档约 8 秒（含启动日志、进度条、五步核验）
- **随时跳过**：`Esc` 跳过整段，`Enter` / 空格 / 点击快进到下一幕
- **不露馅**：首帧由宿主半边在文档解析阶段就盖上去，DSH 自己的 `HARNESS / Loading plugins…` 卡片不会再闪出来
- **失败兜底**：首帧盖板有 12 秒硬上限与 boot-card 观察器；客户端半天没画出来也不会留下黑屏

### 🪪 Ygritte 身份授权

- **冰与火双极构图**（v1.3.0）：画面顶部是冰霜冷光池、底部是余烬火池，两层缓慢呼吸形成上冷下热的连续温度场；canvas 里霜雪从冷区飘落、火星从火区上升，在中部交汇
- **Ygritte 词标双色**：每个字母自身做冰霜白 → 冰蓝 → 琥珀 → 余烬的垂直渐变（保留逐字升起与故障闪，带实色回退）
- **纹章冰火同体**：符文环冷色刻度与火色符文/弧线并存，火焰纹章两侧新增冰晶刻痕；进度线冰蓝 → 琥珀 → 余烬，完成转火色
- 一整块连续画面：没有方框面板、没有竖向条纹/格子、没有扫描线（v1.1.0 按「不要做成竖条的格子」重构）
- 授权段是单列连续构图：暖核冷环全息胸像 → `Ygritte` / 耶哥蕊特 / `FREE FOLK · RANGER` → 无边框资料字段 → 五步授权核验（`ICE & FIRE · SECURE`，行到即亮起冰→火光带）→ 白霜外环 + 余烬内核的 `VERIFIED` 钢印
- 过场是「冷白核心 + 火色外晕」的柔光辉光；自动授权默认开启（核验通过后约 1.8 秒进入），关掉后等你点击 / `Enter`（12 秒后也会自动放行，绝不卡住 DSH）
- 主色严格限定在冰霜 / 冰蓝 / 琥珀 / 余烬 / 虚空，无旧绿色残留

### 🎛️ 设置

设置 → **Ygritte** 页：

| 分组 | 内容 |
| --- | --- |
| 开机片头与授权界面 | 关闭 / 简易 / 完整 三档、立即预览 |
| 授权界面 | 自动授权开关、快捷键说明 |
| 关于 | 版本、独立预览页入口 |

「通用」设置里也有一行 **Ygritte 启动界面**，可以直接换档或点「预览」。

### 🖼️ 独立预览

宿主半边把预览页挂在插件自己的 HTTP 前缀下，打开 DSH 后访问：

```
http://127.0.0.1:52497/ygritte/preview
```

页面是自包含的（内联同一份动画引擎），不依赖 DSH 外壳：`?mode=quick` 直接看简易档，`?auto=0` 关掉自动授权，播完会浮出「重播 / 切换档位」控制条。也可以直接从磁盘打开 `preview/index.html`。

---

## 安装 / 启用

前提：插件已经构建（`client.js` 与 `preview/index.html` 存在）。

```powershell
# 1. 构建（改动 src/ 后必须重跑）
node scripts/build.mjs
node scripts/check.mjs

# 2. 写入 desktop profile：先 pnpm 链接依赖，再把 bundle 追加进 dsh.profile.bundles
node scripts/activate-profile.mjs
```

第二步会改动 `$DSH_HOME/profiles/desktop/package.json`：

1. `pnpm add link:<this dir>` —— 只改依赖与 `node_modules` 链接，DSH 的 profile 监视器忽略"仅依赖"变化，所以此时不会重载；
2. 再把 `@local/ygritte-boot` 追加到 `dsh.profile.bundles` —— 有序 bundle 列表变化才会触发 HMR 实时重组合，插件随之挂载，**无需重启客户端**。

<details>
<summary>如果 HMR 没有生效 / 想彻底停用 / 改完源码怎么热更新</summary>

```powershell
# 改完源码后：重新构建、自检，再让 profile 的 HMR 重组合一次（无需重启客户端）
node scripts/build.mjs
node scripts/check.mjs
node scripts/activate-profile.mjs --reload

# 回滚：先取消选择（热卸载），再移除依赖
node scripts/activate-profile.mjs --rollback
```

`--reload` 只是在 profile 的 `cordis.patch.yml` 里替换一行自己写的标记注释，用一次真实文件事件让 HMR 去比较链接包的新文件并重载插件；重载时片头会再播一次。

脚本会在 `%DSH_HOME%\profiles\desktop\.plugin-manager\backups\ygritte-<时间戳>\` 留一份 `package.json` 与 `pnpm-lock.yaml` 备份。若客户端重启后仍显示 401，请确认 profile 只跑了一个 DSH 进程，然后重启客户端一次。

</details>

---

## 工程结构

```
ygritte-boot/
├─ package.json          # dsh.bundle.patch + dsh.client(platform=web) 两个 block 缺一不可
├─ cordis.patch.yml      # profile 层：insert 出 ygritte-boot 这一行
├─ index.js              # 宿主半边：index-inject 首帧盖板 + /ygritte 路由
├─ client.js             # 浏览器半边（构建产物，勿手改）
├─ preview/index.html    # 独立预览页（构建产物）
├─ src/
│  ├─ show.js            # 动画引擎：纯 DOM / 无依赖 / Shadow DOM 内运行
│  └─ client-entry.js    # DSH 集成胶水：尽早挂载、设置页、生命周期、诊断为
├─ scripts/
│  ├─ build.mjs          # 组装 client.js 与 preview/index.html
│  ├─ check.mjs          # 不依赖浏览器/DSH 进程的静态与宿主半边自检
│  ├─ stage-publish.mjs  # 生成公共包名、可直接 push 的发布目录
│  └─ activate-profile.mjs
├─ PUBLISHING.md         # 上架插件市场的完整步骤
├─ market-entry.example.yml  # 提交 awesome-dsh-plugin 的条目模板
└─ locale/*.json         # 插件管理页里的显示名与简介
```

### 两半的分工

- **宿主半边**（`index.js`）在文档解析阶段注入一段 `style` + 同步 `script`：把页面刷成片头的底色，并暴露 `window.__ygritteBoot.end()`。客户端片头第一帧上屏时同步撤掉盖板，衔接无空档。宿主还提供 `/ygritte/preview`、`/ygritte/health`、`/ygritte/report`。
- **浏览器半边**（`client.js`）在 `__ModuleLoader__` 工厂求值时就挂载 Shadow DOM 片头（比 `apply()` 更早），并在 `apply()` 里注册设置行 / 设置页与卸载清理。引擎不依赖 React；只有设置 UI 使用平台基线里的 `react`。

### 诊断

```
GET /ygritte/health
```

返回插件版本、首帧契约、最近若干条浏览器端时间线报告（`mounted` / `first-frame` / `phase:*` / `login` / `verified` / `applied` / `done` / `skipped` …），每条报告带浏览器端 bundle 的 `version`（用来确认页面真正跑的是哪一版客户端）。Web 载体下是普通同源请求；桌面载体下页面发起的相对请求会被 `dsh-app://` 协议处理器带着浏览器 Cookie 转发给宿主，因此同样能收到报告。

本机 desktop profile 上的实测记录（v1.3.0「冰与火」版，`/ygritte/health` 抓取，完整档自动授权）：

- `mounted` → `first-frame`：约 60 ms（首帧盖板在这一刻同步撤掉）
- 相位时间线：`power-on → sigil → wordmark → bootlog → progress → wipe(冷白+火晕过场) → login → verified → prompt → outro → done`，前台窗口整段约 10 秒
- 设置注册检查点：`applied settings.general.item`、`applied settings.section`、`apply done` 全部成功
- 说明：窗口在后台/被遮挡时 Chromium 会节流 `rAF` 与定时器，动画会变慢直到窗口回到前台；首帧盖板与 12 秒兜底仍会保证不会卡在黑屏

---

## 发布到插件市场

想把这个插件放到社区插件市场（`dsh-market` / DSH「插件 → 发现」共用同一份目录）让别人搜索、一键安装，完整步骤见 **[PUBLISHING.md](PUBLISHING.md)**，条目模板见 **[market-entry.example.yml](market-entry.example.yml)**。一句话概括：

1. 改公共包名（建议 `dsh-ygritte-boot`，已查 npm 可用）并同步 `cordis.patch.yml`，重新 build/check；
2. 推一个公开 GitHub 仓库（声明了 `dsh.bundle`，加 `dsh-plugin` topic，仓库满 1 天）；
3. `npm publish --access public`（`repository` 指回该仓库）；
4. 往 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 提一个只加 `data/plugins/<owner>__<repo>.yml` 的 PR，合并后市场自动收录；
5. 可选：在仓库里放 `screenshots.json` 与位图 icon，商店详情页会展示。

---

## 已知限制

- **桌面端窗口标题栏**：片头播放时 Windows 的系统按钮仍由系统绘制，没有像 550C 那样临时透明化；片头底色与深色标题栏观感接近。
- **只在页面加载时播放**：HMR 热更新插件时也会重挂一次（开发时正常）；设置里的「预览」可以随时重播。
- **`Esc` 是全局的**：片头存在的几秒内会拦截 `Esc`（这正是跳过的方式），片头结束后监听器即被移除。
- **无声音**：目前没有配音/音效；如需可以后续接 Audiosprite 或 WebAudio。

---

## 许可

MIT。设计文案与动画为本仓库原创；主题致敬《冰与火之歌》的 Ygritte 与"火吻"意象。
