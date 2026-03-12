// server/routes/rss/lawdept.xml.ts

export default defineEventHandler(async (event) => {
  try {
    const xmlText = await $fetch<string>('https://www.law.ntpu.edu.tw/rss', {
      responseType: 'text'
    });

    setResponseHeader(event, 'Content-Type', 'text/xml; charset=UTF-8');
    return xmlText;

  } catch (error) {
    console.error('lawdept RSS proxy 錯誤：', error);
    throw createError({
      statusCode: 500,
      statusMessage: '無法取得法律學系 RSS'
    });
  }
});