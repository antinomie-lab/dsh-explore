import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

// 解析一篇文章：渲染 HTML、按 h2 切段、收集目录、从 h1 提取标题
export function makeArticle(raw) {
  const toc = []
  let h1 = ''

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

  // h2 自带的中文序号（一、二、…）交给 CSS counter 的 01/02 呈现，正文里摘掉
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
    if (token.tag === 'h1') {
      h1 = text
      return '<h1>'
    }
    const id = `sec-${toc.length}`
    if (token.tag === 'h2' || token.tag === 'h3') {
      toc.push({ level: token.tag, text, id })
    }
    return `<${token.tag} id="${id}" class="md-heading">`
  }

  // 外部链接新标签页打开
  const defaultLinkOpen =
    md.renderer.rules.link_open ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    if (tokens[idx].attrGet('href')?.startsWith('http')) {
      tokens[idx].attrSet('target', '_blank')
      tokens[idx].attrSet('rel', 'noopener')
    }
    return defaultLinkOpen(tokens, idx, options, env, self)
  }

  const html = md.render(raw)
  // h1 按全角冒号拆主副标题：「同题竞技：谁更适合……」→ 标题 + 副题
  const [title, ...rest] = h1.split('：')
  return {
    toc,
    sections: html.split(/(?=<h2 id=)/),
    title: title.trim(),
    sub: rest.join('：').trim(),
  }
}
