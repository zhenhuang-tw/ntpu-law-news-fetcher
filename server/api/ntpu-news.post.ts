// server/api/ntpu-news.post.ts

export default defineEventHandler(async (event) => {
  // 1. 目前 ISO 8601 時間
  const nowTime = new Date().toISOString();

  // 2. 定義 GraphQL 查詢語句
  // 非活動、發布於 law_ntpu 頻道、非英文、且在發佈時間範圍內的新聞
  // 頻道定義：校首頁 = www_ntpu
  const graphqlQuery = `
    query {
      publications(
        sort: "publishAt:desc,createdAt:desc"
        start: 0
        limit: 20
        where: {
          isEvent: false
          sitesApproved_contains: "law_ntpu"
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
    // 3. 發送 POST 請求至 NTPU Strapi API
    const response = await $fetch<{ data: { publications: any[] } }>(
      'https://api-carrier.ntpu.edu.tw/strapi',
      {
        method: 'POST',
        body: {
          query: graphqlQuery
        }
      }
    );

    // 4. 取得新聞列表
    const newsJson = response.data?.publications || [];

    // 如果需要進行處理，應在回傳前進行 map 轉換
    // 這裡先回傳原始獲取的資料清單
    return {
      success: true,
      data: newsJson
    };

  } catch (error) {
    // 錯誤處理：回傳友善的錯誤訊息
    throw createError({
      statusCode: 500,
      statusMessage: '無法從 NTPU API 獲取資料',
      data: error
    });
  }
});