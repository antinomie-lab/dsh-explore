/*
 * evidence links: the article's citations become clickable, pointing at the
 * pinned baseline commit on GitHub.
 * - prose inline code `packages/…/x.ts:85`, `vendor/…` etc. (repo-root) → blob view
 * - preset shorthand `code/agent.cordis.yml:51-57` → apps/cli/config/agent-presets/…
 * - globs like `agent-presets/* /agent.cordis.yml` → tree view of the directory
 * - backticked commit hashes → commit view
 * line refs may be `85`, `316-330` or comma lists `44-45,67-72,182`; the
 * anchor uses the first line or range.
 */
const REPO = 'https://github.com/deepseek-ai/deepseek-harness'
const BASELINE = '47f943859bef60e4160492346772ded9b24f765a'
const PRESET_DIR = 'apps/cli/config/agent-presets'

const LINES = String.raw`(?::(\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*))?`
const ROOT_REF = new RegExp(
  String.raw`^((?:packages|vendor|examples|apps|scripts)/[\w*./-]+?\.[a-z0-9]+)${LINES}$`,
)
const PRESET_REF = new RegExp(
  String.raw`^((?:minimal|standard|code|cordis)/agent\.cordis\.yml)${LINES}$`,
)
const COMMIT_HASH = /^[0-9a-f]{7,40}$/

function anchor(lines) {
  if (!lines) return ''
  const first = lines.split(',')[0]
  const [a, b] = first.split('-')
  return `#L${a}${b ? `-L${b}` : ''}`
}

function blobUrl(path, lines) {
  if (path.includes('*')) {
    const dir = path.slice(0, path.indexOf('*')).replace(/\/$/, '')
    return `${REPO}/tree/${BASELINE}/${dir}`
  }
  return `${REPO}/blob/${BASELINE}/${path}${anchor(lines)}`
}

function resolveRef(text) {
  let m = ROOT_REF.exec(text)
  if (m) return blobUrl(m[1], m[2])
  m = PRESET_REF.exec(text)
  if (m) return blobUrl(`${PRESET_DIR}/${m[1]}`, m[2])
  if (COMMIT_HASH.test(text)) return `${REPO}/commit/${text}`
  return null
}

export function linkifySourceRefs(root) {
  if (!root) return
  for (const code of root.querySelectorAll('code:not(pre code)')) {
    const href = resolveRef(code.textContent.trim())
    if (!href) continue
    const a = document.createElement('a')
    a.href = href
    a.target = '_blank'
    a.rel = 'noopener'
    a.className = 'src-ref'
    code.replaceWith(a)
    a.appendChild(code)
  }
}
