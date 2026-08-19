<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  toc: { type: Array, required: true },
  motif: { type: String, default: 'tree' },
})

const activeId = ref('')

let ticking = false
function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    ticking = false
    let current = ''
    for (const h of props.toc) {
      const el = document.getElementById(h.id)
      if (el && el.getBoundingClientRect().top <= 120) current = h.id
    }
    activeId.value = current
  })
}

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 88
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <aside class="toc" :class="`motif-${motif}`">
    <p class="toc-title">目录</p>
    <nav>
      <a
        v-for="h in props.toc"
        :key="h.id"
        class="toc-item"
        :class="[`toc-${h.level}`, { active: activeId === h.id }]"
        href="#"
        @click.prevent="scrollTo(h.id)"
      >
        {{ h.text }}
      </a>
    </nav>
  </aside>
</template>

<style scoped>
/* toc 的两种语言，随文章 motif 走：
 *   tree     —— ├─/└─ 树形分支（cordis 那篇，目录就是插件树的缩略）
 *   dialogue —— 竖直导轨 + 模块节点（当前节实心，扁平章节不假装是树） */
.toc {
  position: sticky;
  top: 40px;
  max-height: calc(100vh - 80px);
  overflow: auto;
}

.toc-title {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--faint);
}

.toc-item {
  display: block;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-soft);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.toc-item:hover,
.toc-item.active {
  color: var(--blue-deep);
}

.toc-item.active {
  font-weight: 600;
}

/* ---------- tree motif：├─/└─ 分支 ---------- */
.motif-tree .toc-item {
  padding: 5px 0;
}

.motif-tree .toc-item::before {
  font-family: var(--font-mono);
  color: #c3cfff;
  margin-right: 8px;
  transition: color 0.15s ease;
}

.motif-tree .toc-item.toc-h2::before {
  content: '├─';
}

.motif-tree .toc-item.toc-h3 {
  padding-left: 18px;
  font-size: 12.5px;
}

.motif-tree .toc-item.toc-h3::before {
  content: '└─';
}

.motif-tree .toc-item:hover::before,
.motif-tree .toc-item.active::before {
  color: var(--blue);
}

/* ---------- dialogue motif：导轨 + 模块节点 ---------- */
.motif-dialogue nav {
  position: relative;
}

.motif-dialogue nav::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 10px;
  bottom: 10px;
  width: 1px;
  background: var(--line);
}

.motif-dialogue .toc-item {
  position: relative;
  padding: 5px 0 5px 20px;
}

.motif-dialogue .toc-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 7px;
  height: 7px;
  border: 1.5px solid #c3cfff;
  border-radius: 2px;
  background: var(--paper);
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.motif-dialogue .toc-item.toc-h3 {
  padding-left: 34px;
  font-size: 12.5px;
}

.motif-dialogue .toc-item.toc-h3::before {
  width: 5px;
  height: 5px;
  left: 1.5px;
}

.motif-dialogue .toc-item:hover::before {
  border-color: var(--blue);
}

.motif-dialogue .toc-item.active::before {
  background: var(--blue);
  border-color: var(--blue);
}

@media (max-width: 1023px) {
  .toc {
    display: none;
  }
}
</style>
