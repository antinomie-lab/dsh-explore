<script setup>
/* figure-two-paths — §2 的图：程序化和声明式两条挂载路径，
 * 汇入同一棵插件树（蓝色的 ctx 根是全图论点：两条路径生成的是同一棵树，
 * 走完全相同的 inject 等待与 effect 回收）。 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 640 300" role="img" aria-label="两条挂载路径生成同一棵插件树">
      <defs>
        <marker
          id="tp-head"
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

      <!-- 左：程序化 -->
      <rect class="node" x="40" y="36" width="180" height="58" rx="10" />
      <text class="node-label" x="130" y="60" text-anchor="middle">ctx.plugin(X)</text>
      <text class="node-sub" x="130" y="78" text-anchor="middle">程序化 · 面向组件作者</text>

      <!-- 右：声明式 -->
      <rect class="node" x="420" y="36" width="180" height="58" rx="10" />
      <text class="node-label" x="510" y="60" text-anchor="middle">cordis.yml · group</text>
      <text class="node-sub" x="510" y="78" text-anchor="middle">声明式 · 面向编排者</text>

      <!-- 汇入 -->
      <path class="edge" d="M 130 94 C 130 150, 260 130, 300 158" marker-end="url(#tp-head)" />
      <path class="edge" d="M 510 94 C 510 150, 380 130, 340 158" marker-end="url(#tp-head)" />

      <!-- 同一棵树：ctx 根（论点，蓝色） -->
      <rect class="node node-key" x="288" y="160" width="64" height="30" rx="8" />
      <text class="node-label node-label-key" x="320" y="180" text-anchor="middle">ctx</text>

      <path class="tree-edge" d="M 306 190 C 290 205, 268 208, 254 216" />
      <path class="tree-edge" d="M 320 190 V 216" />
      <path class="tree-edge" d="M 334 190 C 350 205, 372 208, 386 216" />

      <rect class="node" x="224" y="216" width="60" height="26" rx="7" />
      <text class="leaf-label" x="254" y="233" text-anchor="middle">X</text>
      <rect class="node" x="290" y="216" width="60" height="26" rx="7" />
      <text class="leaf-label" x="320" y="233" text-anchor="middle">Y</text>
      <rect class="node" x="356" y="216" width="60" height="26" rx="7" />
      <text class="leaf-label" x="386" y="233" text-anchor="middle">Z</text>

      <text class="note" x="320" y="278" text-anchor="middle">
        YAML group 的孩子和 bundle 挂的孩子，走完全相同的 inject 等待与 effect 回收
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
  font-size: 10.5px;
  fill: var(--faint);
}

.leaf-label {
  font-family: var(--font-mono);
  font-size: 11px;
  fill: var(--ink-soft);
}

.edge {
  fill: none;
  stroke: var(--ink-soft);
  stroke-width: 1.4;
}

.tree-edge {
  fill: none;
  stroke: var(--faint);
  stroke-width: 1.2;
}

.note {
  font-family: var(--font-sans);
  font-size: 11px;
  fill: var(--ink-soft);
}
</style>
