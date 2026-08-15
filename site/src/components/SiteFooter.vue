<template>
  <footer class="footer">
    <div class="footer-inner">
      <svg class="footer-mark" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="9" y="2" width="6" height="6" rx="1.5" />
        <rect x="2" y="16" width="6" height="6" rx="1.5" />
        <rect x="16" y="16" width="6" height="6" rx="1.5" />
        <path d="M12 8v4M12 12H5v4M12 12h7v4" fill="none" />
      </svg>
      <p>
        引用代码对应 DeepSeek Harness master @ <code>47f943859b</code> · Cordis
        <code>@deepseek-ai/cordis@4.0.1</code>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
}

.footer-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13px;
  color: var(--faint);
}

.footer-inner p {
  margin: 0;
}

.footer-inner code {
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--blue-soft);
  color: var(--inline-code);
  padding: 2px 6px;
  border-radius: 6px;
}

.footer-mark {
  width: 18px;
  height: 18px;
  flex: none;
}

.footer-mark rect {
  fill: var(--blue);
}

.footer-mark path {
  stroke: var(--blue);
  stroke-width: 1.6;
}
</style>
