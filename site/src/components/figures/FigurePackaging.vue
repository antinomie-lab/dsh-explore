<script setup>
/* figure-packaging — §1 的图：一个能力拆成三个包。
 * 契约 / 实现 / 消费方三列，箭头只指向契约（蓝色，全图的论点：
 * 双方只认识契约包和服务名）；实现与消费方之间是刻意的空白。 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 640 140" role="img" aria-label="一个能力拆成三个包：契约、实现、消费方">
      <defs>
        <marker
          id="pk-head"
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

      <!-- 上排：三段式分包 -->
      <text class="col-title" x="120" y="24" text-anchor="middle">实现包 · Provider</text>
      <text class="col-title" x="320" y="24" text-anchor="middle">契约包 · Definition</text>
      <text class="col-title" x="520" y="24" text-anchor="middle">消费方 · Consumer</text>

      <!-- provider -->
      <rect class="node" x="40" y="44" width="160" height="58" rx="10" />
      <text class="node-label" x="120" y="68" text-anchor="middle">dsh-bash-sandbox</text>
      <text class="node-sub" x="120" y="86" text-anchor="middle">SandboxBashExecutor</text>

      <!-- contract（论点：蓝色） -->
      <rect class="node node-key" x="240" y="44" width="160" height="58" rx="10" />
      <text class="node-label node-label-key" x="320" y="68" text-anchor="middle">dsh-shell</text>
      <text class="node-sub node-sub-key" x="320" y="86" text-anchor="middle">ShellExecutor 抽象类</text>

      <!-- consumer -->
      <rect class="node" x="440" y="44" width="160" height="58" rx="10" />
      <text class="node-label" x="520" y="68" text-anchor="middle">dsh-tool-bash</text>
      <text class="node-sub" x="520" y="86" text-anchor="middle">模型可见的 bash 工具</text>

      <!-- 两条都只指向契约 -->
      <path class="edge" d="M 200 73 H 232" marker-end="url(#pk-head)" />
      <path class="edge" d="M 440 73 H 408" marker-end="url(#pk-head)" />

      <text class="note" x="320" y="128" text-anchor="middle">
        实现包与消费方互不引用 —— 双方唯一的约定是服务名
        <tspan class="note-mono">'shell'</tspan>
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

.col-title {
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
  font-size: 10.5px;
  fill: var(--faint);
}

.node-sub-key {
  fill: rgba(255, 255, 255, 0.75);
}

.edge {
  fill: none;
  stroke: var(--blue);
  stroke-width: 1.5;
}

.note {
  font-family: var(--font-sans);
  font-size: 11px;
  fill: var(--ink-soft);
}

.note-mono {
  font-family: var(--font-mono);
  font-size: 10.5px;
}
</style>
