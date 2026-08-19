<script setup>
import { computed, onMounted, ref } from 'vue'
import { linkifySourceRefs } from '../src-refs.js'
import FigurePackaging from './figures/FigurePackaging.vue'
import FigureMountStyles from './figures/FigureMountStyles.vue'
import FigureTwoPaths from './figures/FigureTwoPaths.vue'
import FigureInject from './figures/FigureInject.vue'
import FigureEffect from './figures/FigureEffect.vue'
import FigureUsage from './figures/FigureUsage.vue'

const props = defineProps({ article: { type: Object, required: true } })

const bodyRef = ref(null)

// 插图注入位（按文章 slug）：after 给出锚点文本，图插到包含该文本的
// 块级元素之后；没有 after 则插到该节末尾。同一节可以有多张图、各自带锚点
const figureSets = {
  'cordis-from-dsh': [
    { sec: 1, after: '不受惊动', is: FigureMountStyles },
    { sec: 1, after: '一行也不用动', is: FigurePackaging },
    { sec: 2, is: FigureTwoPaths },
    { sec: 4, is: FigureInject },
    { sec: 5, is: FigureEffect },
  ],
  'dsh-vs-dimagent': [{ sec: 2, is: FigureUsage }],
}

const CLOSERS = ['</ul>', '</ol>', '</p>', '</pre>', '</blockquote>']

function splitAfter(html, marker) {
  const idx = html.indexOf(marker)
  if (idx === -1) return [html, '']
  let end = -1
  for (const tag of CLOSERS) {
    const t = html.indexOf(tag, idx)
    if (t !== -1 && (end === -1 || t < end)) end = t + tag.length
  }
  return end === -1 ? [html, ''] : [html.slice(0, end), html.slice(end)]
}

// 展开成线性渲染序列：html 段与插图交替
const blocks = computed(() => {
  const out = []
  const figs = figureSets[props.article.slug] ?? []
  props.article.sections.forEach((html, i) => {
    const endFigs = []
    let rest = html
    for (const f of figs.filter((f) => f.sec === i)) {
      if (!f.after) {
        endFigs.push(f)
        continue
      }
      const [before, after] = splitAfter(rest, f.after)
      if (!after) {
        endFigs.push(f)
        continue
      }
      out.push({ html: before }, { figure: f.is })
      rest = after
    }
    out.push({ html: rest })
    for (const f of endFigs) out.push({ figure: f.is })
  })
  return out
})

onMounted(() => {
  if (props.article.srcRefs) linkifySourceRefs(bodyRef.value)
})
</script>

<template>
  <main ref="bodyRef" class="content" :class="`motif-${article.motif}`">
    <template v-for="(b, i) in blocks" :key="i">
      <component :is="b.figure" v-if="b.figure" />
      <section v-else v-html="b.html"></section>
    </template>
  </main>
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

/* ---------- dialogue motif: 对话 × 评审的文章语言 ----------
 * blockquote 是引文（agent 的原话）而不是注解卡片：大引号 + 左边线；
 * bullet 从模块方块换成编辑式的破折号；h3 的分支符换成对话标记 » */

.content.motif-dialogue :deep(blockquote) {
  margin: 28px 0;
  padding: 22px 24px 22px 56px;
  border: none;
  border-radius: 14px;
  background: var(--code-surface);
  box-shadow: none;
  font-size: 15px;
}

.content.motif-dialogue :deep(blockquote)::before {
  content: '“';
  left: 18px;
  top: 14px;
  width: auto;
  height: auto;
  border: none;
  border-radius: 0;
  background: none;
  font-family: Georgia, 'Songti SC', serif;
  font-size: 38px;
  line-height: 1;
  color: var(--blue);
}

.content.motif-dialogue :deep(blockquote)::after {
  content: none;
}

.content.motif-dialogue :deep(blockquote p) {
  color: var(--ink);
}

.content.motif-dialogue :deep(blockquote p + p) {
  margin-top: 10px;
}

.content.motif-dialogue :deep(ul li)::before {
  content: '—';
  left: -24px;
  top: 0;
  width: auto;
  height: auto;
  border: none;
  border-radius: 0;
  background: none;
  transform: none;
  color: var(--faint);
}

.content.motif-dialogue :deep(h3)::before {
  content: '»';
  font-size: 15px;
}
</style>
