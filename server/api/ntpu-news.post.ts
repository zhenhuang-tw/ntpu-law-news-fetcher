// server/api/ntpu-news.post.ts

export default defineEventHandler(async (event) => {
  // 1. 讀取 POST body 中的參數
  const body = await readBody(event);
  const sitesApproved: string = body?.sitesApproved ?? 'www_ntpu'; // 預設為校首頁頻道

  // 2. 目前 ISO 8601 時間
  const nowTime = new Date().toISOString();

  // 3. 定義 GraphQL 查詢語句
  //    非活動、發布於特定頻道、非英文、且在發佈時間範圍內的新聞
  /* 頻道代碼：
    校首頁 = www_ntpu
    校首頁_校內公告: internal_ntpu
    法律學院: law_ntpu
  */
  const graphqlQuery = `
    query {
      publications(
        sort: "publishAt:desc,createdAt:desc"
        start: 0
        limit: 20
        where: {
          isEvent: false
          sitesApproved_contains: "${sitesApproved}"
          lang_ne: "english"
          tags_contains: [[]]
          publishAt_lte: "${nowTime}"
          unPublishAt_gte: "${nowTime}"
        }
      ) {
        _id
        createdAt
        title
        content
        tags
        bannerLink
        publishAt
      }
    }
  `;

// 其他可選參數
/*
        title_en
        content_en

        coverImage {
          url
        }
        coverImageDesc
        coverImageDesc_en
        files {
          url
          name
          mime
        }
        fileMeta
*/

  try {
    // 4. 發送 POST 請求至 NTPU Strapi API
    const response = await $fetch<{ data: { publications: any[] } }>(
      'https://api-carrier.ntpu.edu.tw/strapi',
      {
        method: 'POST',
        body: {
          query: graphqlQuery
        }
      }
    );

    // 5. 取得新聞列表，並排除 title 為空的公告
    const newsJson = (response.data?.publications || []).filter(
      (item) => item.title && item.title.trim() !== ''
    );

    return {
      success: true,
      data: newsJson
    };

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: '無法從 NTPU API 獲取資料',
      data: error
    });
  }
});