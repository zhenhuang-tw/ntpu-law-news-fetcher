// https://nuxt.com/docs/api/configuration/nuxt-config

const iconRoute = 'https://zhenhuang.tw/icon/'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    baseURL: '/labs/ntpu-law-news/',
    
    head: {
      htmlAttrs: {
        lang: 'zh-TW',
      },
      title: '臺北大學法律學院系公告訊息',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '整合顯示臺北大學法律學院、系訊息。' }
      ],
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: iconRoute+'apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: iconRoute+'favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: iconRoute+'favicon-16x16.png' },
        { rel: 'manifest', href: iconRoute+'site.webmanifest' },
        { rel: 'icon', type: 'image/x-icon', href: iconRoute+'favicon.ico' }
      ]
    }
  },

  nitro: {
    preset: 'cloudflare-pages',
    routeRules: {
      '/api/ntpu-law-news': {
        cache: {
          maxAge: 60 * 60 * 8,
          staleMaxAge: 60 * 60 * 8,
          swr: true,
        }
      },
    }
  }
})
