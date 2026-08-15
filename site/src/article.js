import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import articleMd from '../../passages/cordis-from-dsh.md?raw'

const toc = []

const md = new MarkdownIt({
  html: false,
  linkify: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="code-block"><code class="hljs">${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch {
        /* fall through */
      }
    }
    return `<pre class="code-block"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

// h2 的中文序号（一、二、…）交给 CSS counter 的 01/02 呈现，正文里摘掉
md.core.ruler.push('strip-h2-numerals', (state) => {
  state.tokens.forEach((token, i) => {
    if (token.type !== 'heading_open' || token.tag !== 'h2') return
    const inline = state.tokens[i + 1]
    const first = inline?.children?.[0]
    if (first?.type === 'text') {
      first.content = first.content.replace(/^[一二三四五六七八九十]+、\s*/, '')
      inline.content = inline.children.map((c) => c.content).join('')
    }
  })
})

md.renderer.rules.heading_open = (tokens, idx) => {
  const token = tokens[idx]
  const text = tokens[idx + 1]?.content ?? ''
  const id = `sec-${toc.length}`
  if (token.tag === 'h2' || token.tag === 'h3') {
    toc.push({ level: token.tag, text, id })
  }
  return `<${token.tag} id="${id}" class="md-heading">`
}

export const articleHtml = md.render(articleMd)
export const articleToc = toc
