<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { articleToc as toc } from '../article.js'

const activeId = ref('')

let ticking = false
function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    ticking = false
    let current = ''
    for (const h of toc) {
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
  <aside class="toc">
    <p class="toc-title">目录</p>
    <nav>
      <a
        v-for="h in toc"
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
/* a tree of branches: h2 items are ├─ limbs, h3 the └─ twigs */
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
  padding: 5px 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-soft);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s ease;
}

.toc-item::before {
  font-family: var(--font-mono);
  color: #c3cfff;
  margin-right: 8px;
  transition: color 0.15s ease;
}

.toc-item.toc-h2::before {
  content: '├─';
}

.toc-item.toc-h3 {
  padding-left: 18px;
  font-size: 12.5px;
}

.toc-item.toc-h3::before {
  content: '└─';
}

.toc-item:hover {
  color: var(--blue-deep);
}

.toc-item:hover::before {
  color: var(--blue);
}

.toc-item.active {
  color: var(--blue-deep);
  font-weight: 600;
}

.toc-item.active::before {
  color: var(--blue);
}

@media (max-width: 1023px) {
  .toc {
    display: none;
  }
}
</style>
