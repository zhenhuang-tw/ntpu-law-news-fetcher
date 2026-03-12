// server/api/ntpu-law-news.post.ts
import { XMLParser } from 'fast-xml-parser';

export default defineCachedEventHandler(async (_event) => {
  try {
    const [localResponse, externalXml] = await Promise.all([
      $fetch<{ data: any[] }>('/api/ntpu-news', {
        method: 'POST',
        body: { sitesApproved: 'law_ntpu' }
      }),
      $fetch<string>('https://www.law.ntpu.edu.tw/rss', {
        responseType: 'text'
      })
    ]);

    const localItems = (localResponse.data || []).map((item: any) => ({
      _id: item._id,
      title: item.title,
      publishAt: item.publishAt,
      content: item.content ?? '',
      tags: item.tags ?? [],
      link: `https://new.ntpu.edu.tw/news/${item._id}`,
      source: '院網'
    }));

    const parser = new XMLParser({
      ignoreAttributes: false,
      allowBooleanAttributes: true,
      isArray: (tagName) => tagName === 'item'
    });
    const parsed = parser.parse(externalXml);
    const externalRawItems: any[] = parsed?.rss?.channel?.item || [];

    const externalItems = externalRawItems.map((item: any) => ({
      _id: item.guid?.['#text'] ?? item.guid ?? item.link,
      title: item.title ?? '',
      publishAt: new Date(item.pubDate).toISOString(),
      content: '',
      tags: item.category ? [item.category] : [],
      link: item.link ?? '',
      source: '系網'
    }));

    const allItems = [...localItems, ...externalItems].sort(
      (a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime()
    );

    return { success: true, data: allItems };

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '無法整合法律學院系訊息',
      data: error
    });
  }
}, {
  maxAge: 60 * 60 * 8,
  name: 'ntpu-law-news',
  getKey: () => 'ntpu-law-news-merged'
});