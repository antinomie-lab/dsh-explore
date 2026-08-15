<template>
  <header class="hero">
    <div class="masthead">
      <span class="masthead-brand">
        <svg class="masthead-glyph" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="9" y="2" width="6" height="6" rx="1.5" />
          <rect x="2" y="16" width="6" height="6" rx="1.5" />
          <rect x="16" y="16" width="6" height="6" rx="1.5" />
          <path d="M12 8v4M12 12H5v4M12 12h7v4" fill="none" />
        </svg>
        Cordis × DeepSeek Harness
      </span>
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
    </div>
    <div class="hero-inner">
      <h1 class="title">
        Cordis 在做什么
        <span class="title-sub">从 DeepSeek Harness 看</span>
      </h1>
      <p class="lede">
        一个真实的 agent harness 里，Cordis 的几个特性各自被用成了什么：
        服务、inject、effect、Loader —— 机制如何撑起一棵可组合、可热重载的插件树。
      </p>
    </div>
  </header>
</template>

<style scoped>
.hero {
  border-bottom: 1px solid var(--line);
}

/* masthead: quiet hairline with the brand mark */
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ink);
  font-weight: 600;
}

.masthead-glyph {
  width: 15px;
  height: 15px;
}

.masthead-glyph rect {
  fill: var(--blue);
}

.masthead-glyph path {
  stroke: var(--blue);
  stroke-width: 1.6;
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

/* the title block aligns with the article column below (past the TOC rail) */
.hero-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 72px 32px 56px calc(32px + 300px);
}

.title {
  margin: 0;
  font-size: clamp(36px, 5vw, 54px);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.title-sub {
  display: block;
  margin-top: 12px;
  font-size: clamp(18px, 2.4vw, 24px);
  font-weight: 400;
  color: var(--ink-soft);
}

.lede {
  margin: 28px 0 0;
  max-width: 520px;
  color: var(--ink-soft);
  font-size: 15.5px;
}

@media (max-width: 1023px) {
  .masthead {
    padding: 18px 24px;
  }

  .hero-inner {
    padding: 64px 24px 72px;
  }
}
</style>
