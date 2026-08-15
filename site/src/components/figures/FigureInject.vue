<script setup>
/* figure-inject — §4 的图：agent-spine 的依赖推导。
 * 上面五个提供方各自给出一个服务，边即 inject 声明的五项；
 * 蓝色的 AgentLoop 是最后点亮的那个 —— 书写顺序无关，依赖齐了才启动。 */
const providers = [
  { service: 'llm', by: 'LlmRuntime', x: 76 },
  { service: 'tools', by: 'ToolRuntime', x: 188 },
  { service: 'systemPrompt', by: 'SystemPrompt', x: 300 },
  { service: 'sessions', by: 'SessionStore', x: 412 },
  { service: 'agents', by: '（清单内插件）', x: 524 },
]

// 从每个提供方底部汇入 AgentLoop 顶部的曲线
function edgeTo(x) {
  const tx = 300 + (x - 300) * 0.36 // 收拢到 AgentLoop 顶面宽度内
  return `M ${x} 92 C ${x} 160, ${tx} 150, ${tx} 196`
}
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 640 290" role="img" aria-label="inject 依赖声明推导启动顺序">
      <defs>
        <marker
          id="ij-head"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#565d70" />
        </marker>
      </defs>

      <!-- 提供方：服务名为主，插件名为注 -->
      <g v-for="p in providers" :key="p.service">
        <rect class="node" :x="p.x - 52" y="40" width="104" height="52" rx="10" />
        <text class="node-label" :x="p.x" y="62" text-anchor="middle">{{ p.service }}</text>
        <text class="node-sub" :x="p.x" y="79" text-anchor="middle">{{ p.by }}</text>
        <path class="edge" :d="edgeTo(p.x)" marker-end="url(#ij-head)" />
      </g>

      <!-- 等待方（论点：蓝色，最后点亮） -->
      <rect class="node node-key" x="200" y="196" width="200" height="56" rx="10" />
      <text class="node-label node-label-key" x="300" y="220" text-anchor="middle">AgentLoop</text>
      <text class="node-sub node-sub-key" x="300" y="238" text-anchor="middle">
        static inject = 上面五个服务
      </text>

      <text class="note" x="300" y="278" text-anchor="middle">
        挂载立即完成； inject 声明的依赖全部就位，execute 才被调用
      </text>
    </svg>
  </figure>
</template>

<style scoped>
.fig {
  margin: 40px 0 36px;
  user-select: none;
}

.fig svg {
  display: block;
  width: 100%;
  max-width: 640px;
  height: auto;
  margin: 0 auto;
}

.node {
  fill: var(--surface);
  stroke: var(--line);
  stroke-width: 1.2;
}

.node-key {
  fill: var(--blue);
  stroke: var(--blue);
}

.node-label {
  font-family: var(--font-mono);
  font-size: 12px;
  fill: var(--ink);
}

.node-label-key {
  fill: #fff;
  font-weight: 600;
}

.node-sub {
  font-family: var(--font-sans);
  font-size: 10px;
  fill: var(--faint);
}

.node-sub-key {
  fill: rgba(255, 255, 255, 0.75);
}

.edge {
  fill: none;
  stroke: var(--ink-soft);
  stroke-width: 1.3;
}

.note {
  font-family: var(--font-sans);
  font-size: 11px;
  fill: var(--ink-soft);
}
</style>
