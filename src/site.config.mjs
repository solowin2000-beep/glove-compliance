/*
 * 全站唯一配置中心。
 * 站点名、域名、邮箱、验证码、每页的 TDK 都在这里改，改完全站生效。
 * title 控制在 60 字符以内、description 控制在 155 字符以内（含品牌后缀）。
 */

export const SITE = {
  url: 'https://glove-compliance.pages.dev',
  name: 'GloveSpec',
  tagline: 'Cut-level compliance for industrial glove buyers',

  // GEO：页面与结构化数据里的发布/更新日期。以后改了内容，把 updated 改成当天。
  published: '2026-09-28',
  updated: '2026-09-29',
  email: 'everqueen19@gmail.com',
  // 换品牌名或邮箱只改上面两处，页面、页脚、询价链接会一起更新。

  verification: {
    google: '2AyL_UnLnHfOFQTyTsuwMSUsq5aD1JfIelroMhRNBCw',
    bing: '205FC90A906C0863517A6F214571522A',
  },

  // IndexNow（Bing / Yandex 即时收录）。public/indexnow-key.txt 的内容必须与这个值完全一致。
  indexNowKey: 'b7d24e6f1a3c58e09d4f2b6a8c1e3f5d',

  // Cloudflare Web Analytics（免费、不放 cookie、不用隐私弹窗）。留空则不下发统计脚本。
  cloudflareAnalyticsToken: 'a7823e4a499e4a56bb63346f7f0e7222',
};

export const PAGES = [
  {
    path: '/',
    nav: 'Home',
    title: 'Cut Level Checker: Glove Levels by Country & Task',
    description:
      'Pick your country and the task, and see the cut level buyers usually specify — with the EN 388 and ANSI/ISEA 105 numbers and the standard behind them.',
    keyword: 'what cut level gloves do i need',
    ogType: 'website',
  },
  {
    path: '/cut-level-checker/',
    nav: 'Cut level checker',
    title: 'Cut Level Checker: What Level Do You Need?',
    description:
      'Select a country and an application to see the cut level normally specified, the EN 388 and ANSI A-level numbers behind it, and the glove spec to quote.',
    keyword: 'what cut level gloves do i need',
    ogType: 'website',
  },
  {
    path: '/cut-level-chart/',
    nav: 'EN 388 vs ANSI chart',
    title: 'EN 388 vs ANSI Cut Levels: Conversion Chart',
    description:
      'EN 388 cut letters A–F converted to ANSI/ISEA 105 A1–A9 levels, how to read a marking like 4X42D, and why the two scales are not equivalent.',
    keyword: 'en388 vs ansi cut level',
    ogType: 'article',
  },
  {
    path: '/gloves-by-industry/',
    nav: 'Gloves by industry',
    title: 'Cut-Resistant Gloves by Industry & Task',
    description:
      'Cut levels for sheet metal, glass handling, automotive, food processing, recycling and more — with liner, coating and feature recommendations.',
    keyword: 'cut resistant gloves by industry',
    ogType: 'article',
  },
  {
    path: '/request-quote/',
    nav: 'Request a quote',
    title: 'Request a Quote',
    description:
      'Send your application, target level and quantity and we will come back with glove specifications, MOQ, samples and a quotation.',
    keyword: 'cut resistant glove supplier quote',
    ogType: 'website',
  },
];