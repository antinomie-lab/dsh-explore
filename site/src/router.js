import { ref } from 'vue'

// hash 路由：静态托管友好，#/slug 打开文章，空 hash 是文章列表
function parse() {
  return location.hash.replace(/^#\/?/, '')
}

export const route = ref(parse())

window.addEventListener('hashchange', () => {
  route.value = parse()
  window.scrollTo(0, 0)
})
