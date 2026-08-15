<script setup>
import { onMounted, ref } from 'vue'
import { articleHtml } from '../article.js'
import { linkifySourceRefs } from '../src-refs.js'

const bodyRef = ref(null)

onMounted(() => linkifySourceRefs(bodyRef.value))
</script>

<template>
  <main ref="bodyRef" class="content" v-html="articleHtml"></main>
</template>

<style scoped>
.content {
  min-width: 0;
  counter-reset: h2;
}

.content :deep(h1) {
  display: none;
}

.content :deep(.md-heading) {
  scroll-margin-top: 88px;
}

/*
 * headings as a growing tree, told in our own register:
 *   h2 — a numbered node: mono index + a short blue tick that grows on hover
 *   h3 — a branch off its section: └─ prefix, quiet until hovered
 */
.content :deep(h2) {
  position: relative;
  margin: 96px 0 24px;
  padding-bottom: 18px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.35;
  counter-increment: h2;
  border-bottom: 1px solid var(--line);
}

.content :deep(h2):first-of-type {
  margin-top: 48px;
}

/* the index sits above the title like a node label */
.content :deep(h2)::before {
  content: counter(h2, decimal-leading-zero);
  display: block;
  margin-bottom: 10px;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.3em;
  color: var(--blue);
}

/* the tick on the baseline rule — grows toward the title on hover */
.content :deep(h2)::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1.5px;
  width: 44px;
  height: 3px;
  border-radius: 2px;
  background: var(--blue);
  transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.content :deep(h2):hover::after {
  width: 96px;
}

.content :deep(h3) {
  margin: 64px 0 16px;
  font-size: 18px;
  font-weight: 650;
  line-height: 1.4;
  color: var(--ink);
}

.content :deep(h3)::before {
  content: '└─';
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 400;
  color: #b9c6ff;
  margin-right: 8px;
  transition: color 0.2s ease;
}

.content :deep(h3):hover::before {
  color: var(--blue);
}

.content :deep(p) {
  margin: 16px 0;
  color: var(--body-text);
}

.content :deep(a) {
  color: var(--blue-deep);
  text-decoration: none;
  border-bottom: 1px solid var(--line);
}

.content :deep(a:hover) {
  border-bottom-color: var(--blue);
}

/* evidence links — citations that lead to the source on GitHub */
.content :deep(a.src-ref) {
  border-bottom: none;
}

.content :deep(a.src-ref > code) {
  text-decoration: underline dotted;
  text-decoration-color: var(--blue);
  text-underline-offset: 3px;
  transition: color 0.15s ease;
}

.content :deep(a.src-ref:hover > code) {
  color: var(--blue-deep);
}

.content :deep(strong) {
  font-weight: 700;
  color: var(--ink);
}

/* blockquote: a lifted note card, module square as its marker */
.content :deep(blockquote) {
  position: relative;
  margin: 32px 0;
  padding: 24px 26px 24px 60px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--surface);
  box-shadow: 0 16px 44px -30px var(--shadow);
  font-size: 14.5px;
}

.content :deep(blockquote)::before {
  content: '';
  position: absolute;
  left: 24px;
  top: 27px;
  width: 14px;
  height: 14px;
  border: 1.5px solid var(--blue);
  border-radius: 4px;
}

.content :deep(blockquote)::after {
  content: '';
  position: absolute;
  left: 28.5px;
  top: 31.5px;
  width: 5px;
  height: 5px;
  border-radius: 1.5px;
  background: var(--blue);
}

.content :deep(blockquote p) {
  margin: 0;
  color: var(--ink-soft);
}

.content :deep(blockquote strong) {
  color: var(--ink);
}

/* list items as outlined module squares */
.content :deep(ul) {
  list-style: none;
  margin: 16px 0;
  padding-left: 24px;
}

.content :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.content :deep(ol li::marker) {
  color: var(--blue);
}

.content :deep(li) {
  position: relative;
  margin: 8px 0;
  color: var(--body-text);
}

.content :deep(ul li)::before {
  content: '';
  position: absolute;
  left: -22px;
  top: 0.78em;
  width: 6px;
  height: 6px;
  border: 1.5px solid var(--blue);
  border-radius: 1.5px;
  transform: translateY(-50%);
}

.content :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: var(--blue-soft);
  color: var(--inline-code);
  padding: 0.12em 0.4em;
  border-radius: 5px;
  word-break: break-word;
}

/* code blocks: light cards, part of the page — not dark slabs */
.content :deep(.code-block) {
  position: relative;
  margin: 24px 0;
  padding: 20px 22px;
  background: var(--code-surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.7;
}

.content :deep(.code-block code) {
  background: none;
  color: var(--code-text);
  padding: 0;
  border-radius: 0;
  font-size: inherit;
}

/* highlight.js palette (minimal, on light card) */
.content :deep(.hljs-comment),
.content :deep(.hljs-quote) {
  color: var(--syntax-comment);
  font-style: italic;
}

.content :deep(.hljs-keyword),
.content :deep(.hljs-selector-tag),
.content :deep(.hljs-literal) {
  color: var(--syntax-keyword);
}

.content :deep(.hljs-string),
.content :deep(.hljs-regexp) {
  color: var(--syntax-string);
}

.content :deep(.hljs-number),
.content :deep(.hljs-symbol) {
  color: var(--syntax-number);
}

.content :deep(.hljs-title),
.content :deep(.hljs-title.function_) {
  color: var(--syntax-title);
}

.content :deep(.hljs-title.class_),
.content :deep(.hljs-type),
.content :deep(.hljs-built_in) {
  color: var(--syntax-type);
}

.content :deep(.hljs-attr),
.content :deep(.hljs-attribute),
.content :deep(.hljs-variable),
.content :deep(.hljs-template-variable),
.content :deep(.hljs-params) {
  color: var(--syntax-variable);
}

.content :deep(hr) {
  border: none;
  height: 1px;
  background: var(--line);
  margin: 48px 0;
}

/*
 * tables: booktabs, not grids — horizontal rules only, quiet header,
 * no zebra, no card
 */
.content :deep(table) {
  display: block;
  overflow-x: auto;
  width: 100%;
  margin: 32px 0 28px;
  border-collapse: collapse;
  font-size: 14.5px;
  line-height: 1.6;
}

.content :deep(th) {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--faint);
  text-align: left;
  padding: 0 24px 8px 0;
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}

.content :deep(td) {
  padding: 11px 24px 11px 0;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
  color: var(--body-text);
}

.content :deep(td:first-child) {
  white-space: nowrap;
}

.content :deep(tbody tr:last-child td) {
  border-bottom: none;
}
</style>
