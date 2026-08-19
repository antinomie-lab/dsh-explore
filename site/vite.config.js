import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 部署在子路径下：base 改产物里的资源引用，outDir 让文件落进同名目录
  base: '/dsh-explore/',
  build: {
    outDir: 'dist/dsh-explore',
  },
  plugins: [vue()],
  server: {
    fs: {
      // 允许引用 site/ 之外的文章源文件（../cordis-在做什么-从-deepseek-harness-看.md）
      allow: ['..'],
    },
  },
})
