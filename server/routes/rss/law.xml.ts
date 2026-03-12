// server/routes/rss/law.xml.ts

export default defineEventHandler(async (event) => {
  try {
    // 1. 呼叫整合 API，取得已合併排序的統一格式資料
    const response = await $fetch<{ data: any[] }>('/api/ntpu-law-news', {
      method: 'POST'
    });

    const allItems = response.data || [];

    // 2. 產生 RSS 項目 XML
    const rssItems = allItems.map((item: any) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <guid isPermaLink="false">${item._id}</guid>
      <pubDate>${new Date(item.publishAt).toUTCString()}</pubDate>
      ${item.tags?.length ? `<category><![CDATA[${item.tags.join(', ')}]]></category>` : ''}
      <description><![CDATA[(${item.source})${item.content ? item.content.replace(/<[^>]*>?/gm, '').substring(0, 300) + '...' : ''}]]></description>
    </item>`).join('');

    // 3. 組合完整 XML
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
    <atom:link href="https://zhenhuang.tw/labs/ntpu-law-news/rss/law.xml" rel="self" type="application/rss+xml" />
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