<template>
  <div class="container">
    <h1>國立臺北大學最新公告(法律學院)</h1>

    <div v-if="pending" class="loading">正在讀取訊息...</div>

    <div v-else-if="error" class="error">
      發生錯誤：{{ error.message }}
    </div>

    <div v-else class="news-grid">
      <article v-for="news in newsList" :key="news._id" class="news-card">
        
        <div class="content">
          <span class="date">{{ formatDate(news.publishAt) }}</span>
          <h3>{{ news.title }}</h3>
          <p class="excerpt">{{ stripHtml(news.content).substring(0, 60) }}...</p>
          
          <div class="tags">
            <span v-for="tag in news.tags" :key="tag" class="tag">#{{ tag }}</span>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
// 1. 呼叫我們之前寫好的 POST API
// Nuxt 3/4 的 useFetch 會自動處理 SSR 與客戶端抓取
const { data, pending, error } = await useFetch('/api/ntpu-news', {
  method: 'POST'
});

// 2. 取得 API 回傳的 news 陣列
const newsList = computed(() => data.value?.data || []);

// 3. 工具函數：格式化日期
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 4. 工具函數：移除 HTML 標籤（用於摘要顯示）
const stripHtml = (html) => {
  return html ? html.replace(/<[^>]*>?/gm, '') : '';
};
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: sans-serif;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.news-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  background: white;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.image-wrapper img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.content {
  padding: 1rem;
}

.date {
  font-size: 0.8rem;
  color: #666;
}

h3 {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  line-height: 1.4;
}

.excerpt {
  font-size: 0.9rem;
  color: #444;
}

.tag {
  display: inline-block;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-right: 5px;
  color: #005aab; /* 藍色系 */
}

.loading, .error {
  text-align: center;
  padding: 3rem;
}
</style>