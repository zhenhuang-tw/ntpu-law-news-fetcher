// server/routes/rss/lawsch.xml.ts

export default defineEventHandler(async (event) => {
  try {
    // 1. 呼叫本站 API (server/api/ntpu-news.post.ts)
    const response = await $fetch('/api/ntpu-news', {
      method: 'POST',
      body: {
        sitesApproved: 'law_ntpu'
      }
    });

    const items = response.data || [];

    // 2. 頻道設定
    const channel = {
      title: "國立臺北大學訊息",
      author: "國立臺北大學",
      image: "https://new.ntpu.edu.tw/assets/logo/ntpu_logo.png",
      link: "https://new.ntpu.edu.tw/news",
      description: "國立臺北大學新版校首頁公告訊息",
      language: "zh-tw",
      copyright: "國立臺北大學"
    };

    // 3. 生成 RSS 項目
    const rssItems = items.map((item: any) => {
      // 移除內容中的 HTML 標籤以提供乾淨的摘要
      const cleanDescription = item.content ? item.content.replace(/<[^>]*>?/gm, '').substring(0, 300) : '';
      
      return `
      <item>
        <title><![CDATA[${item.title}]]></title>
        <link>https://new.ntpu.edu.tw/news/${item._id}</link>
        <guid isPermaLink="false">${item._id}</guid>
        <pubDate>${new Date(item.publishAt).toUTCString()}</pubDate>
        <description><![CDATA[${cleanDescription}...]]></description>
        <author>${channel.author}</author>
      </item>`;
    }).join('');

    // 4. 組合完整 XML
    const feed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${channel.title}</title>
    <link>${channel.link}</link>
    <description>${channel.description}</description>
    <language>${channel.language}</language>
    <copyright>${channel.copyright}</copyright>
    <image>
      <url>${channel.image}</url>
      <title>${channel.title}</title>
      <link>${channel.link}</link>
    </image>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${getRequestURL(event).href}" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

    // 5. 設定正確的 Content-Type
    setResponseHeader(event, 'Content-Type', 'text/xml; charset=UTF-8');
    
    return feed;

  } catch (error) {
    console.error('RSS Generation Error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error during RSS generation'
    });
  }
});