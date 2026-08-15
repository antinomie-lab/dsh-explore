<script setup>
import ProgressBar from './components/ProgressBar.vue'
import SiteHeader from './components/SiteHeader.vue'
import TocNav from './components/TocNav.vue'
import ArticleBody from './components/ArticleBody.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
  <div class="page">
    <ProgressBar />
    <SiteHeader />
    <div class="layout">
      <TocNav />
      <ArticleBody />
    </div>
    <SiteFooter />
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
