<script setup>
import { computed, watchEffect } from 'vue'
import { route } from './router.js'
import { findArticle } from './articles.js'
import ProgressBar from './components/ProgressBar.vue'
import SiteHeader from './components/SiteHeader.vue'
import TocNav from './components/TocNav.vue'
import ArticleBody from './components/ArticleBody.vue'
import SiteFooter from './components/SiteFooter.vue'
import ArticleIndex from './components/ArticleIndex.vue'

const current = computed(() => findArticle(route.value))

watchEffect(() => {
  document.title = current.value
    ? `${current.value.title} · ${current.value.sub}`
    : 'dsh-explore'
})
</script>

<template>
  <div class="page">
    <template v-if="current">
      <ProgressBar />
      <SiteHeader :article="current" />
      <div :key="current.slug" class="layout">
        <TocNav :toc="current.toc" :motif="current.motif" />
        <ArticleBody :article="current" />
      </div>
      <SiteFooter :note="current.footer" />
    </template>
    <ArticleIndex v-else />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
}

.layout {
  max-width: 1080px;
  margin: 0 auto;
  padding: 40px 32px 120px;
  display: grid;
  grid-template-columns: 236px minmax(0, 720px);
  gap: 64px;
  justify-content: center;
  align-items: start;
}

@media (max-width: 1023px) {
  .layout {
    grid-template-columns: minmax(0, 720px);
    padding: 16px 24px 72px;
  }
}
</style>
