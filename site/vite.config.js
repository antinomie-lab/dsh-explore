import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    fs: {
      // 允许引用 site/ 之外的文章源文件（../cordis-在做什么-从-deepseek-harness-看.md）
      allow: ['..'],
    },
  },
})
