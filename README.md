# NTPU Law News Radar

簡單的校園資訊自動化工具，介接新版校網頁 Strapi 獲取院網資訊，並讀取系網 RSS，將國立臺北大學法律學院、法律學系兩個獨立網站的公告訊息整合為一，提供 Web UI 瀏覽及 RSS Feed 訂閱。

## 核心功能

* **現代化介面** ：使用 Nuxt 4 與響應式設計，讓公告在手機與電腦上皆能流暢閱讀。
* **RSS 自動化** ：提供標準的 `rss/law.xml` 接口，可直接匯入 Feedly, Inoreader 等閱讀器，即時追蹤院系動態。
* **內部 API 轉發** ：採用 Server-side API 封裝技術，減少前端負擔並確保安全查詢 GraphQL。
* **Edge Deployment** ：採用 Cloudflare Pages，有極高的反應速度與全球邊緣運算能力。

## 技術棧

* **Framework**: [Nuxt 4](https://nuxt.com/)
* **Runtime**: [Nitro Server Engine](https://nitro.unjs.io/)
* **Package Manager**: `pnpm`
* **API**: GraphQL (NTPU Strapi API)
* **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)

## DEV

1. 本地開發環境須安裝 Node.js 以及 `pnpm`。
2. 存取路徑：
    * **首頁**: `http://localhost:3000/` - 瀏覽最新公告。
    * **API 接口**: `POST http://localhost:3000/api/ntpu-news` - 獲取校首頁 Strapi 原始 JSON 資料。並保留擴充彈性(讀取頻道作為 body 傳入)。
    * **RSS Feed**: 例如 `GET http://localhost:3000/rss/law.xml` - 訂閱資訊。

## 專案結構

```text
├── app/
│   └── pages/
│       └── index.vue          # 前端展示介面
├── server/
│   ├── api/
│   │   ├── ntpu-law-news.post.ts  # 院系整合訊息
│   │   └── ntpu-news.post.ts  # 處理院網資料 (GraphQL Bridge)
│   └── routes/rss/
│       └── lawsch.xml.ts  # 院網 RSS (調用內部 API)
│       └── lawdept.xml.ts # 抓取系網 RSS
│       └── law.xml.ts     # 整合 (調用內部 API)
├── nuxt.config.ts             # 專案配置
└── pnpm-lock.yaml             # 鎖定依賴版本

```

## Disclaimer

本專案所有資訊，均擷取自「國立臺北大學 NTPU」校首頁公開 API 端點，及法律學系網站公開 RSS 頻道。儘管專案設定公開，惟係個人學術研究與技術開發練習使用，並非校、院、系官方維護。本專案之資訊更新，可能稍有延遲，亦不擔保正確。所有公告內容，應以院網、系網為準。

## 授權

本站開放原始碼，使用 Mozilla Public License 2.0 (MPL-2.0) 釋出，惟訊息內容著作權仍歸屬於國立臺北大學法律學院、系，不在授權範圍內。
