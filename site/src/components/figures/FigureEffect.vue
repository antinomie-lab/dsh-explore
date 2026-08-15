<script setup>
/* figure-effect — §5 的图：生成器「边做边交」的价值在中途失败时显现。
 * 上泳道正常走完；下泳道第二步抛错，蓝色的回滚箭头（全图论点）用
 * 已 yield 的撤销把第一步精确回滚 —— 旁边虚影是「最后 return」形式
 * 在同一场景下交不出任何东西、泄漏一条脏条目。 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 640 300" role="img" aria-label="effect 边做边交：中途失败时精确回滚">
      <defs>
        <marker
          id="ef-head"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#565d70" />
        </marker>
        <marker
          id="ef-head-blue"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#4d6bfe" />
        </marker>
      </defs>

      <!-- 泳道 A：正常 -->
      <text class="lane" x="36" y="56">正常</text>
      <rect class="node" x="110" y="30" width="132" height="44" rx="9" />
      <text class="node-label" x="176" y="49" text-anchor="middle">enter(session)</text>
      <text class="node-sub" x="176" y="65" text-anchor="middle">入库 · yield 撤销</text>

      <path class="edge" d="M 242 52 H 286" marker-end="url(#ef-head)" />

      <rect class="node" x="294" y="30" width="140" height="44" rx="9" />
      <text class="node-label" x="364" y="49" text-anchor="middle">announce(session)</text>
      <text class="node-sub" x="364" y="65" text-anchor="middle">广播 session/created</text>

      <path class="edge" d="M 434 52 H 472" marker-end="url(#ef-head)" />
      <rect class="node node-done" x="480" y="30" width="96" height="44" rx="9" />
      <path class="mark" d="M 502 53 L 509 60 L 524 43" />
      <text class="node-label" x="546" y="57" text-anchor="middle">完成</text>

      <!-- 泳道 B：第二步抛错 -->
      <text class="lane" x="36" y="176">抛错</text>
      <rect class="node" x="110" y="150" width="132" height="44" rx="9" />
      <text class="node-label" x="176" y="169" text-anchor="middle">enter(session)</text>
      <text class="node-sub" x="176" y="185" text-anchor="middle">撤销已交出并被收集</text>

      <path class="edge" d="M 242 172 H 286" marker-end="url(#ef-head)" />

      <rect class="node" x="294" y="150" width="140" height="44" rx="9" />
      <text class="node-label" x="352" y="169" text-anchor="middle">announce</text>
      <path class="mark" d="M 386 160 L 398 172 M 398 160 L 386 172" />
      <text class="node-sub" x="364" y="185" text-anchor="middle">监听器抛错</text>

      <!-- 回滚（论点：蓝色） -->
      <path
        class="edge-blue"
        d="M 364 194 C 364 238, 176 244, 176 200"
        marker-end="url(#ef-head-blue)"
      />
      <text class="note-blue" x="270" y="252" text-anchor="middle">执行第 1 步的撤销 · 回滚入库，不留脏条目</text>

      <!-- 对照虚影：只在最后 return 撤销的形式 -->
      <rect class="node node-ghost" x="462" y="150" width="152" height="44" rx="9" />
      <text class="node-label node-label-ghost" x="538" y="169" text-anchor="middle">若只在最后 return</text>
      <text class="node-sub" x="538" y="185" text-anchor="middle">中途失败时交不出撤销 → 泄漏</text>
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

.lane {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  fill: var(--faint);
}

.node {
  fill: var(--surface);
  stroke: var(--line);
  stroke-width: 1.2;
}

.node-ghost {
  stroke-dasharray: 4 3;
  fill: none;
}

/* terminal node: quiet filled card, closes the lane's rhythm */
.node-done {
  fill: var(--code-surface);
  stroke: var(--line);
}

.node-label {
  font-family: var(--font-mono);
  font-size: 11px;
  fill: var(--ink);
}

.node-label-ghost {
  fill: var(--faint);
}

.node-sub {
  font-family: var(--font-sans);
  font-size: 10px;
  fill: var(--faint);
}

.edge {
  fill: none;
  stroke: var(--ink-soft);
  stroke-width: 1.3;
}

.edge-blue {
  fill: none;
  stroke: var(--blue);
  stroke-width: 1.6;
}

/* hand-drawn ✓ / ✕ — same stroke weight as the figure's lines */
.mark {
  fill: none;
  stroke: var(--ink);
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.note-blue {
  font-family: var(--font-sans);
  font-size: 11px;
  fill: var(--blue-deep);
}
</style>
