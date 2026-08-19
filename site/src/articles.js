import { makeArticle } from './article.js'
import cordisRaw from '../../passages/cordis-from-dsh.md?raw'
import versusRaw from '../../passages/deepseek-harness-vs-dimagent-vibe-coding.md?raw'

/*
 * 文章注册表。motif 决定正文的装饰语言：
 *   tree     —— 模块 × 树（编号节点、└─ 分支、方块 bullet、卡片式注释）
 *   dialogue —— 对话 × 评审（引文式 blockquote、破折号 bullet）
 * srcRefs 开启 file:line → GitHub 的引用链接化（只对有代码引用的文章）。
 * 插图注入位置在 ArticleBody.vue 里按 slug 配置。
 */
export const articles = [
  {
    slug: 'cordis-from-dsh',
    motif: 'tree',
    srcRefs: true,
    brand: 'Cordis × DeepSeek Harness',
    lede: '一个真实的 agent harness 里，Cordis 的几个特性各自被用成了什么：服务、inject、effect、Loader —— 机制如何撑起一棵可组合、可热重载的插件树。',
    footer: '引用代码对应 DeepSeek Harness master @ 47f943859b · Cordis @deepseek-ai/cordis@4.0.1',
    ...makeArticle(cordisRaw),
  },
  {
    slug: 'dsh-vs-dimagent',
    motif: 'dialogue',
    srcRefs: false,
    brand: 'Harness 同题实验',
    lede: '同一个模型、同一个任务，两个 harness 各自实现 obelisk 的 DSH 会话 provider：一个把决策做成可追问的选择题，一个把假设藏进打磨过的文本。',
    footer: '同题实验 · obelisk PR #72（DSH）/ PR #74（dimagent）· 模型 deepseek-v4-flash',
    ...makeArticle(versusRaw),
  },
]

export function findArticle(slug) {
  return articles.find((a) => a.slug === slug) || null
}
