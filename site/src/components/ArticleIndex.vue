<script setup>
import { articles } from '../articles.js'
import MotifGlyph from './MotifGlyph.vue'
</script>

<template>
  <div class="index">
    <header class="masthead">
      <span class="masthead-brand">dsh-explore</span>
      <a
        class="masthead-repo"
        href="https://github.com/antinomie-lab/dsh-explore"
        target="_blank"
        rel="noopener"
        aria-label="GitHub 仓库：antinomie-lab/dsh-explore"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
        </svg>
        dsh-explore
      </a>
    </header>

    <main class="list">
      <p class="kicker">PASSAGES</p>
      <a v-for="a in articles" :key="a.slug" class="entry" :href="`#/${a.slug}`">
        <MotifGlyph :motif="a.motif" class="entry-glyph" />
        <div class="entry-text">
          <h2 class="entry-title">
            {{ a.title }}
            <span class="entry-sub">{{ a.sub }}</span>
          </h2>
          <p class="entry-lede">{{ a.lede }}</p>
        </div>
      </a>
    </main>
  </div>
</template>

<style scoped>
.index {
  min-height: 100vh;
}

.masthead {
  max-width: 1080px;
  margin: 0 auto;
  padding: 22px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
}

.masthead-brand {
  color: var(--ink);
  font-weight: 600;
}

.masthead-repo {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--ink-soft);
  text-decoration: none;
  transition: color 0.15s ease;
}

.masthead-repo svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
}

.masthead-repo:hover {
  color: var(--blue-deep);
}

.list {
  max-width: 720px;
  margin: 0 auto;
  padding: 88px 32px 120px;
}

.kicker {
  margin: 0 0 32px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.22em;
  color: var(--faint);
}

.entry {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  padding: 28px 0;
  border-top: 1px solid var(--line);
  text-decoration: none;
  color: inherit;
}

.entry:last-child {
  border-bottom: 1px solid var(--line);
}

.entry-glyph {
  margin-top: 8px;
}

.entry-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.005em;
  transition: color 0.15s ease;
}

.entry:hover .entry-title {
  color: var(--blue-deep);
}

.entry-sub {
  display: block;
  margin-top: 4px;
  font-size: 15px;
  font-weight: 400;
  color: var(--ink-soft);
}

.entry-lede {
  margin: 12px 0 0;
  font-size: 14px;
  color: var(--ink-soft);
  max-width: 560px;
}

@media (max-width: 1023px) {
  .masthead {
    padding: 18px 24px;
  }

  .list {
    padding: 56px 24px 72px;
  }
}
</style>
