<script setup>
/* figure-usage — 同题实验的 token 消耗与成本对比（粗略量级）。
 * dimagent：usage_run_stats 实付（aihubmix USD 目录，¥ 按 7.2 折算）；
 * DSH：session 日志只记 token，金额按官方定价核算（实际花费 ¥4.8）。
 * 蓝色给 dimagent，灰色给 DSH；成本行是论点：token 用得更多，
 * 花得反而更少。 */

const rows = [
  {
    label: '总 tokens',
    unit: 'M',
    dim: { v: 98.4, text: '98.4M' },
    dsh: { v: 69.7, text: '69.7M' },
  },
  {
    label: '输出 tokens',
    unit: 'K',
    dim: { v: 309, text: '309K' },
    dsh: { v: 210, text: '210K' },
  },
  {
    label: '缓存命中率',
    unit: '%',
    dim: { v: 98.9, text: '98.9%' },
    dsh: { v: 99.5, text: '99.5%' },
  },
  {
    label: '总成本（¥）',
    unit: '¥',
    dim: { v: 4.02, text: '¥4.02' },
    dsh: { v: 4.8, text: '¥4.8' },
    // 反事实：dimagent 的用量按 DSH 同等的官方闲时价计费
    extra: { v: 7.84, text: '¥7.84' },
  },
]

const X0 = 170 // 柱子起点
const MAX_W = 300
const ROW_H = 74

const groups = rows.map((r, i) => {
  const max = Math.max(r.dim.v, r.dsh.v, r.extra?.v ?? 0)
  const y = 74 + i * ROW_H
  return {
    ...r,
    y,
    dimW: Math.max(3, (r.dim.v / max) * MAX_W),
    dshW: Math.max(3, (r.dsh.v / max) * MAX_W),
    extraW: r.extra ? Math.max(3, (r.extra.v / max) * MAX_W) : 0,
  }
})
</script>

<template>
  <figure class="fig">
    <svg viewBox="0 0 640 448" role="img" aria-label="dimagent 与 DSH 的 token 消耗与成本对比">
      <!-- 图例 -->
      <rect class="sw-dim" x="430" y="18" width="10" height="10" rx="2" />
      <text class="legend" x="445" y="27">dimagent</text>
      <rect class="sw-dsh" x="530" y="18" width="10" height="10" rx="2" />
      <text class="legend" x="545" y="27">DSH</text>

      <g v-for="g in groups" :key="g.label">
        <text class="metric" :x="46" :y="g.y + 22">{{ g.label }}</text>

        <rect class="bar-dim" :x="X0" :y="g.y" :width="g.dimW" height="16" rx="4" />
        <text class="val val-dim" :x="X0 + g.dimW + 8" :y="g.y + 12">{{ g.dim.text }}</text>

        <rect class="bar-dsh" :x="X0" :y="g.y + 22" :width="g.dshW" height="16" rx="4" />
        <text class="val" :x="X0 + g.dshW + 8" :y="g.y + 34">{{ g.dsh.text }}</text>

        <template v-if="g.extra">
          <rect
            class="bar-extra"
            :x="X0"
            :y="g.y + 44"
            :width="g.extraW"
            height="16"
            rx="4"
          />
          <text class="val val-dim" :x="X0 + g.extraW + 8" :y="g.y + 56">{{ g.extra.text }}</text>
        </template>
      </g>

      <line class="divider" x1="46" y1="392" x2="600" y2="392" />
      <text class="note" x="46" y="416">
        成本口径不同，只比量级：dimagent 为实付（aihubmix 目录折算），DSH 按官方定价核算。
      </text>
      <text class="note" x="46" y="434">
        虚线条：dimagent 的用量若按 DSH 同等的官方闲时价计费 ≈ ¥7.84。
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

.legend {
  font-family: var(--font-mono);
  font-size: 10px;
  fill: var(--ink-soft);
}

.sw-dim {
  fill: var(--blue);
}

.sw-dsh {
  fill: #c9cede;
}

.metric {
  font-family: var(--font-sans);
  font-size: 11.5px;
  font-weight: 600;
  fill: var(--ink);
}

.bar-dim {
  fill: var(--blue);
}

.bar-dsh {
  fill: #c9cede;
}

/* 反事实条：虚线描边，对照组语言 */
.bar-extra {
  fill: none;
  stroke: var(--blue);
  stroke-width: 1.3;
  stroke-dasharray: 4 3;
}

.val {
  font-family: var(--font-mono);
  font-size: 10.5px;
  fill: var(--ink-soft);
}

.val-dim {
  fill: var(--blue-deep);
  font-weight: 600;
}

.divider {
  stroke: var(--line);
  stroke-width: 1;
}

.note {
  font-family: var(--font-sans);
  font-size: 10.5px;
  fill: var(--faint);
}
</style>
