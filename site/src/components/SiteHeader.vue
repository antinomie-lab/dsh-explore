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
