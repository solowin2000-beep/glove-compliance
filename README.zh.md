# GloveSpec — 劳保手套合规工具站（Astro 版）

一个用 Astro 搭的静态工具站，第一批 5 个页面：首页、防割等级自检器、EN 388/ANSI 对照表、
行业对照、询盘页。所有内容都是静态 HTML，构建产物可以整个文件夹上传到 Cloudflare Pages。

网址：https://glove-compliance.pages.dev ｜ 品牌名：GloveSpec ｜ 询盘邮箱：everqueen19@gmail.com

---

## 一、文件结构（你以后要改的只有这几个）

| 路径 | 作用 |
| --- | --- |
| `src/site.config.mjs` | **全站配置**：站点名、网址、邮箱、Google/Bing 验证码、Cloudflare 统计 token、每页的标题和描述 |
| `src/data/glove-model.mjs` | **合规数据**：EN 388 / ANSI 105 等级刻度、各国法规框架、12 个工种的等级与规格建议、涂层指南 |
| `src/pages/` | 每个页面一个文件；文件名就是网址 |
| `src/components/Checker.astro` | 自检器（选国家 + 选工种 → 等级、规格、可复制的询价单） |
| `public/` | 原样复制的静态文件：favicon、OG 分享图、IndexNow 密钥 |
| `dist/` | 构建产物（`npm run build` 之后生成，上传的就是这个文件夹里的内容） |

改等级数字只改 `src/data/glove-model.mjs`，改文字或标题只改对应的 `src/pages/*.astro`。

## 二、本地预览和构建（PowerShell 里 npm 要用 `npm.cmd`）

    npm.cmd install      # 第一次才需要（本机已装好，可跳过）
    npm.cmd run dev      # 本地预览，浏览器打开 http://localhost:4321
    npm.cmd run build    # 生成 dist/ 文件夹，就是要上传的东西

构建时建议带上环境变量：`$env:ASTRO_TELEMETRY_DISABLED='1'` 再执行 `npm.cmd run build`。

## 三、部署到 Cloudflare Pages

1. `npm.cmd run build`
2. Cloudflare → Workers & Pages → 进入项目 **glove-compliance** → Create new deployment
3. 上传 `dist` 文件夹**里面的全部内容**（不是 dist 这个文件夹本身）
4. 打开 https://glove-compliance.pages.dev/ 确认显示正常

## 四、SEO 已经做好的部分

- 每页独立 TDK；标题控制在 60 字符内、描述 155 字符内
- canonical、`lang="en"`、Open Graph、Twitter Card
- 结构化数据：WebSite / Organization / WebApplication / Article / ContactPage / FAQPage / BreadcrumbList
- `sitemap.xml` 和 `robots.txt` 构建时自动生成，网址取自 `src/site.config.mjs`，不会写错
- noindex 只用在 404 页面
- 每页只有一个 H1；所有交互都在页面内联代码里，不依赖第三方脚本
- 移动端适配；零第三方请求（加载快，Core Web Vitals 好）
- 自检器的结果由 JavaScript 渲染，但**同样的等级数据在页面上有静态表格**，所以不执行 JS 也能被搜索引擎读到

## 五、上线后要做的三件事

1. **Google Search Console**：加网址前缀资源 `https://glove-compliance.pages.dev`，
   用「HTML 标记」验证；把那段 `content="..."` 里的验证码填进 `src/site.config.mjs` 的
   `verification.google`，重新构建部署。之后提交 sitemap 并逐个请求收录。
2. **Bing 站长工具**：用 Google 账号直接导入，最省事；如改用 meta 验证，把验证码填进
   `verification.bing`。
3. **Cloudflare Web Analytics**：建好站点后把 token 填进 `cloudflareAnalyticsToken`，重新构建部署。
   统计脚本会自动出现在每个页面上（无 cookie、不用隐私弹窗）。

## 六、以后加页面的正确姿势

1. 在 `src/pages/` 新建一个 `.astro` 文件（文件名 = 网址）
2. 在 `src/site.config.mjs` 的 `PAGES` 里加一条（路径、导航名、标题、描述、主关键词）
3. 导航和页脚会自动出现新链接，sitemap 会自动包含它
4. 重新构建、部署

## 七、免责与合规声明（不要删）

每个页面底部的免责声明说明「等级是行业常见做法，不是法规强制值」。这不是套话：
工具站的权威性正是建立在「不吹法律强制」上，删掉它会同时降低可信度和合规安全性。