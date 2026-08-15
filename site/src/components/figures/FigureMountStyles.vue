<script setup>
/* figure-mount-styles — §1 的图：实现挂到服务名上的两种方式。
 * 独占式一个萝卜一个坑（第二个 ✕），注册表式一张 Map 吸收高频变动。 */
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 640 160" role="img" aria-label="独占式与注册表式两种挂名方式">
      <!-- 左：独占式 -->
      <text class="col-title" x="170" y="24" text-anchor="middle">独占式</text>
      <rect class="slot" x="60" y="44" width="220" height="64" rx="10" />
      <text class="slot-label" x="74" y="66">ctx.shell</text>
      <rect class="mini" x="74" y="76" width="92" height="22" rx="6" />
      <text class="mini-label" x="120" y="91" text-anchor="middle">bash-sandbox</text>
      <rect class="mini mini-dashed" x="176" y="76" width="92" height="22" rx="6" />
      <text class="mini-label mini-label-dashed" x="222" y="91" text-anchor="middle">pwsh</text>
      <text class="cross" x="290" y="94">✕</text>
      <text class="note" x="170" y="138" text-anchor="middle">同一时刻一个实现，第二个在 provide 时报错</text>

      <!-- 右：注册表式 -->
      <text class="col-title" x="470" y="24" text-anchor="middle">注册表式</text>
      <rect class="slot" x="360" y="44" width="220" height="64" rx="10" />
      <text class="slot-label" x="374" y="66">ctx.web · Map</text>
      <rect class="mini" x="374" y="76" width="56" height="22" rx="6" />
      <text class="mini-label" x="402" y="91" text-anchor="middle">exa</text>
      <rect class="mini" x="440" y="76" width="56" height="22" rx="6" />
      <text class="mini-label" x="468" y="91" text-anchor="middle">tavily</text>
      <rect class="mini mini-dashed" x="506" y="76" width="56" height="22" rx="6" />
      <text class="mini-label mini-label-dashed" x="534" y="91" text-anchor="middle">+1</text>
      <text class="note" x="470" y="138" text-anchor="middle">换一个实现只是表里撤一条、增一条</text>
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

.slot {
  fill: var(--paper);
  stroke: var(--line);
  stroke-width: 1.2;
}

.slot-label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  fill: var(--faint);
}

.mini {
  fill: var(--surface);
  stroke: var(--ink-soft);
  stroke-width: 1.1;
}

.mini-dashed {
  stroke-dasharray: 4 3;
  stroke: var(--faint);
}

.mini-label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  fill: var(--ink-soft);
}

.mini-label-dashed {
  fill: var(--faint);
}

.cross {
  font-family: var(--font-sans);
  font-size: 13px;
  fill: var(--faint);
}

.note {
  font-family: var(--font-sans);
  font-size: 11px;
  fill: var(--ink-soft);
}
</style>
