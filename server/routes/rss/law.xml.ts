// server/routes/rss/law.xml.ts
import { XMLParser } from 'fast-xml-parser';

export default defineEventHandler(async (event) => {
  try {
    // 1. 同時抓取兩個來源
    const [localResponse, externalXml] = await Promise.all([
      $fetch<{ data: any[] }>('/api/ntpu-news', {
        method: 'POST',
        body: { sitesApproved: 'law_ntpu' }
      }),
      $fetch<string>('https://www.law.ntpu.edu.tw/rss', {
        responseType: 'text'
      })
    ]);

    // 2. 將來自本地之院網資料轉為統一格式
    const localItems = (localResponse.data || []).map((item: any) => ({
      title: item.title,
      link: `https://new.ntpu.edu.tw/news/${item._id}`,
      guid: `ntpu-news-${item._id}`,
      pubDate: new Date(item.publishAt),
      category: '',
      description: item.content
        ? item.content.replace(/<[^>]*>?/gm, '').substring(0, 300) + '...'
        : '',
      source: '院網'
    }));

    // 3. 解析來自外部之系網 RSS XML
    // allowBooleanAttributes、ignoreAttributes 確保屬性與命名空間正常解析
    // isArray 強制讓 item 永遠是陣列，避免只有一筆時變成物件
    const parser = new XMLParser({
      ignoreAttributes: false,
      allowBooleanAttributes: true,
      isArray: (tagName) => tagName === 'item'
    });
    const parsed = parser.parse(externalXml);
    const externalRawItems: any[] = parsed?.rss?.channel?.item || [];

    const externalItems = externalRawItems.map((item: any) => ({
      title: item.title ?? '',
      link: item.link ?? '',
      guid: item.guid?.['#text'] ?? item.guid ?? item.link,
      pubDate: new Date(item.pubDate),
      category: item.category ?? '',
      description: item.description ?? '',
      source: '系網'
    }));

    // 4. 合併並依發布時間降冪排序
    const allItems = [...localItems, ...externalItems].sort(
      (a, b) => b.pubDate.getTime() - a.pubDate.getTime()
    );

    // 5. 產生 RSS 項目 XML
    const rssItems = allItems.map((item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="false">${item.guid}</guid>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      ${item.category ? `<category><![CDATA[${item.category}]]></category>` : ''}
      <description><![CDATA[(${item.source})${item.description}]]></description>
    </item>`).join('');

    // 6. 組合完整 XML
    const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>臺北大學法律學院系訊息</title>
    <link>https://new.ntpu.edu.tw/law/news</link>
    <description>整合國立臺北大學法律學院網站與法律學系網站公告訊息</description>
    <language>zh-tw</language>
    <copyright>國立臺北大學</copyright>
    <image>
      <url>https://www.law.ntpu.edu.tw/favicon.ico</url>
      <title>臺北大學法律學院系訊息</title>
      <link>https://new.ntpu.edu.tw/law/news</link>
    </image>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${getRequestURL(event).href}" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

    setResponseHeader(event, 'Content-Type', 'text/xml; charset=UTF-8');
    return feed;

  } catch (error) {
    console.error('RSS 整合錯誤：', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'RSS 整合失敗'
    });
  }
});