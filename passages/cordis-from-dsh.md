# Cordis 在做什么：从 DeepSeek Harness 看

> **版本声明**：本文引用的 DeepSeek Harness（下称 DSH）代码对应 deepseek-harness 的 master @ `47f943859b`；Cordis 为 `vendor/` 下的源码固定副本 `@deepseek-ai/cordis@4.0.1`（vendor/cordis/package.json）。
>
> Cordis 本身的理论背景见论文《A Programming Paradigm for Spatiotemporal Composability》（引用格式「论文 §x.y」），本文不展开理论，只用机制描述回答一个问题：**Cordis 提供的几个特性，在 deepseek harness 中是如何被使用的**。
>
> 文中所有代码引用均给出 `文件:行号` 并附原文，可以点击跳转至 github 仓库源代码。

## 一、前提：everything is a plugin

DSH 是一个 agent harness。

它的第一原则是：**模型适配器、工具注册表、会话日志、agent 循环本身，全都是 Cordis 插件，没有特权核心**。所以「DSH 怎么用 Cordis」和「DSH 是怎么构成的」是同一个问题。

第二原则关乎包怎么分：**一个能力被拆成三个包**。契约包（Definition）定义服务本身，实现包（Provider）提供实现，消费方包（Consumer）使用这个能力。实现包怎么把实现「挂」到服务名上，有两种方式：

- **独占式**：实现包直接占住服务名，同一时刻只有一个实现——shell 就是这种，`bash-sandbox` 占住 `ctx.shell`（第三节）。第二个实现挂上来会在 `provide` 时直接报错（第五节的重复检查），所以「当前跑的是哪个实现」不是运行时竞争出来的，是配置静态决定的——`dsh --profile web --dump-config` 可以看到层叠后实际生效的树。
- **注册表式**：同一能力下多个实现并存。契约包持有一张注册表——它不是框架设施，就是服务里的一个 `Map`，比如 `WebRuntime` 的 `private searchProviders = new Map<string, WebSearchProvider>()`（`packages/web/web/src/index.ts:85`）；「登记进注册表」就是实现包调注册方法、最终落进这个 Map（第五节的 `store.set`）。注册表吸收高频的实现变动：换一个实现只是表里撤销一个条目、新增一个条目，依赖这条服务的插件不受惊动。

拿后面会反复出现的 shell 能力举个例子：

- **契约包**（Definition）是 `@deepseek-ai/dsh-shell`（`ShellExecutor` 抽象类加类型补丁，第三节展开）；
- **实现包**（Provider）是 `@deepseek-ai/dsh-bash-sandbox`（第六节的主角 `SandboxBashExecutor`，外加 bash-local、pwsh 系列兄弟实现）；
- **消费方包**（Consumer）是 `@deepseek-ai/dsh-tool-bash`——它声明 `inject = ['tools', 'shell', 'systemPrompt', 'shellEnv']`（`packages/shell/tool-bash/src/index.ts:31`），把 shell 能力包装成模型可见的 bash 工具，执行时调 `ctx.shell.run(...)`（同文件 380 行）。

注意实现包和消费方包互相完全不引用：两边都只认识契约包和服务名，所以换实现时消费方一行也不用动。

不得不承认，由于 deepseek harness 需要做到时空独立性的 plugin 树，它框架代码的理解成本是偏高的。作为开发者，我们只需了解其中机制原理即可。并且，读完这篇文章，你会发现，构建一个这样复杂的系统，大部分复杂度全都被 deepseek harness 自身吃掉了，新增一个插件其实并没有额外的复杂度。

## 二、一次启动：五行代码引出全部概念

跑 `dsh --profile headless "修一下这个 bug"`，最终落到 `boot()`（`packages/boot/app-boot/src/index.ts:757-784`，省略错误处理）：

```ts
export async function boot(
  binName: string,
  absoluteConfigPath: string,
  // ...
): Promise<Context> {
  const ctx = new Context()
  // ...
  ctx.provide('dshHomePath', dshHomePath)
  await ctx.plugin(Loader)
  // ...
  await mountRootInclude(ctx, absoluteConfigPath, patches, bareModuleBaseUrl)
  await ctx.get('loader')?.await()
  if (ctx.get('loader') === undefined) return ctx
  await assertEntriesActivated(ctx, binName)
  return ctx
}
```

五行对应 Cordis 的五个机制：

- `new Context()` —— 创建插件树的根。Context 既是服务仓库（后面所有 `ctx.xxx` 都注册在它上面），也是树节点：每个插件挂载后拥有自己的子 context，父卸载时子树跟着卸载。
- `ctx.provide('dshHomePath', ...)` —— 第一个服务注册：把一个值挂到 ctx 上，全局可读。
- `ctx.plugin(Loader)` —— 程序化挂载第一个插件：Loader，负责读 YAML 配置。
- `mountRootInclude(...)` —— 把 `cordis.yml`（加上 patch 层，第七节讲）交给 Loader，声明式展开成整棵插件树。
- `await ctx.get('loader')?.await()` + `assertEntriesActivated(...)` —— 等整棵树就位，然后做一次审计：哪个条目最终没激活（比如它声明的依赖永远不存在），在这里报错并点名缺什么，不会带着加载了一半的插件树跑起来。

后面三节展开这棵树上最重要的三个机制：服务、依赖声明、可逆注册；第六节整体来看一下插件，第七节讲配置层。

### 插件：被加载的代码单位

**插件是被加载的代码单位**：一份 `inject` 声明，加一段「依赖就绪后执行」的代码。这段代码有两种写法：

- 函数插件导出 `apply(ctx, config)`；
- 类插件（`extends Service`）没有 `apply`，**它的构造函数就是那段代码**。

两种写法收到同样的 `(ctx, config)`。插件有生命周期——挂载时实例化、卸载时回收它登记的一切。

### 服务：通过名字共享的对象

**服务是一个插件通过名字共享给全系统的对象**：提供方用 `provide` 把对象和一个服务名（`'web'`、`'shell'`、`'llm'` 这样的字符串）关联起来，消费方用同一个名字 `ctx.web` 读出这个对象。

对象可以是任何形式——`dshHomePath` 只是个字符串，`loader` 是个带方法的实例。Loader 被 `ctx.plugin` 挂载后，就在自己的构造函数里把自己关联到了 `loader` 这个服务名（`vendor/loader/src/index.ts:90`；类插件的构造函数即启动代码，见第三节）：

```ts
ctx.reflect.provide('loader', this, this[Service.check])
```

双方唯一的约定是服务名：`web-search-exa` 声明需要 `web`，不知道也不关心对象由哪个插件提供。

提供方还没加载时，从服务名读不到任何东西；提供方被卸载，关联随之解除，所以「需要某个服务」不等于「现在能读到它」。我们需要`inject` 来声明一个插件启动需要哪些服务，然后**等到这些服务都就位了才启动**，这正是第四节会讲到的内容。

而且「等到就位」不是一次性的：运行中服务本身被换掉——比如把 `shell` 的实现插件从 bash-local 换成 pwsh——Cordis 会重载所有声明需要 `shell` 的插件，让它们在新插件树上重新执行 `apply`；若服务失去提供方，则先停用它们。依赖因此始终指向当前生效的提供方，而不是启动那一刻的那个。

你可能会好奇为什么是重载，而不是把新对象悄悄递给正在运行的插件？因为插件的 `apply` 已经执行过了：旧实现可能已被捕获进事件监听、定时器的闭包里，只换对象的话，插件手里握着的还是旧引用。撤销它的全部 effect、在新实现上重跑 `apply`，是让插件整体落到新实现上的唯一一致的方式。

那么重载为什么能随时做呢，靠的正是 effect 全部可逆，不存在一半成功一半失败的中间态，这也是我们第五节会讲到的内容。

注意区分两层变动。上例换的是**服务的提供方**，触发重载；而 web-search-exa 那种往 `web` 的注册表里登记的 provider（第四、五节）被换掉时**不重载任何插件**——只是注册表里撤销一个条目、新增一个条目，消费方下次调 `ctx.web.search()` 时按选择规则自然落到新 provider。这正是第一节三段式分包的目的：高频的 provider 变动停在注册表层，不惊动依赖这条服务的插件。

### 插件树：谁挂载谁

插件树由「谁挂载谁」的树边形成，有两种方式来声明这种挂载关系。我们先来看程序式。

> **程序化**：`ctx.plugin(X)` 把 X 挂为调用处那个 ctx 的子节点，X 的 `apply` 收到的就是这个新子 ctx；X 若在自己的 `apply` 里再调 `ctx.plugin(Y)`，Y 就是 X 的孩子——第四节的 agent-spine 连用二十来个 `ctx.plugin`，生成的就是一层二十几个孩子的子树。

但是请注意，挂载和启动两个动作是分离的。

这是什么意思呢，直接看代码。以下是 `ctx.plugin(X)` 做的全部工作（`vendor/cordis/src/registry.ts:316-330`，`RegistryService.plugin`，省略返回值包装）：

```ts
plugin(plugin: Plugin, config?: any, getOuterStack = buildOuterStack()) {
  const callback = this.resolve(plugin)   // 函数 / 类 / { apply } 对象统一成一个回调
  if (!callback) throw new Error('invalid plugin, ...')
  this.ctx.fiber.assertActive()

  let runtime = this._internal.get(callback)   // 同一插件的登记处，注意 fibers 是列表
  if (!runtime) {
    // ...
    runtime = { name, callback, fibers: new DisposableList(), Config: plugin.Config }
    this._internal.set(callback, runtime)
  }

  const fiber = new Fiber(this.ctx, config, Inject.resolve(plugin.inject), runtime, getOuterStack)
```

注意最后一行的参数：config 和 inject 声明在这一刻就进了 fiber。

需要简单解释一下什么是 **fiber**：插件的一次挂载在运行时产生的对象，装着这次挂载的 config、inject 声明、子 ctx 和生命周期的状态机。它的状态机细节本文不展开，只需要记住它的两个面：它持有一张处置列表，用于撤销 effect（第五节），它等 inject 依赖齐了才启动（第四节）。

再看 Fiber 的构造函数（`vendor/cordis/src/fiber.ts:222-253,265`，省略 intercept 簿记）：

```ts
constructor(
  public parent: Context,
  config: any,
  public inject: Dict<any>,
  public runtime: Plugin.Runtime | null,
  // ...
) {
  this._config = config
  // ...
  this.ctx = this.context = parent.extend({ fiber: this })   // 派生子 ctx

  this._runner = {
    epoch: INACTIVE,
    execute: function () {
      if (isConstructor(runtime.callback)) {
        const instance = new runtime.callback(this.ctx, this.config)   // ← 实现类对象在启动时才 new
        // ...
      } else {
        return runtime.callback(this.ctx, this.config)
      }
    },
    collect,
  }

  this.dispose = parent.fiber.effect(() => {   // 把自己登记为父 fiber 的 effect → 级联卸载
    const remove = runtime.fibers.push(this)
    // ...
  })
```

`execute` 闭包只是备好，构造函数并不调用它——实现类的对象要等 fiber 启动（inject 依赖齐，`execute` 才被调）才 `new` 出来。

这就是两个动作的分离：

- **挂载** = 建 fiber 并挂到树上，同步、立即、不执行插件代码；
- **启动** = 跑 `execute`，时机由依赖决定（第四节）。agent-spine 能按任意顺序写 `ctx.plugin(...)`，正因为挂载全是立即完成的，谁先启动由依赖关系决定，不由书写顺序决定。

讲完了程序式，其实我们还有一种声明挂载关系的方式：声明式。

> **声明式**：cordis.yml 里 `group: true` 的 entry，它的 `config` 是子 entry 列表（第七节 minimal preset 里 `pty` 就嵌在 `persistent-shell` 的 `config` 下），Loader 把 entry 的层级实例化成同样层级的树。「父卸载时子树跟着卸载」的机制只有一句：子实例把自己登记为父实例的一个 effect（`vendor/cordis/src/fiber.ts:265`），而 effect 在所属实例卸载时自动回收（第五节），卸载父节点于是级联回收整棵子树。

为什么需要两条方式？因为它们面向不同的人。

**声明式面向编排者**：他管理整个系统，需要的是一份可以按行修改的数据——禁用一行、替换一行的 config、改完热重载。agent-spine 对编排者就是 cordis.yml 里的一行；它内部由多少子插件组成，编排者不用知道。

**程序式面向组件作者**：组件内部要「根据自己的 config 决定挂哪些子插件、各配什么」，entry 的字面量字段表达不了这个，只能写代码。

两条方式生成的是同一棵树：YAML group 的孩子和 bundle 挂的孩子，走完全相同的 inject 等待与 effect 回收。

## 三、服务：`ctx.shell` 是怎么来的

DSH 里 `ctx.shell`、`ctx.llm`、`ctx.web` 这些属性不是 Cordis 内置的，是各个包自己注册的。注册动作发生在 `Service` 基类的构造函数里（`vendor/cordis/src/service.ts:42,57`）：

```ts
constructor(protected ctx: Context, name: string) {
  // ...
  self.ctx.reflect.provide(name, self, this[symbols.check])
  return self
}
```

子类 `super(ctx, 'shell')`，就把自己注册成了 `ctx.shell`。以 shell 能力为例（`packages/shell/shell/src/index.ts:40,65`）：

```ts
declare module '@deepseek-ai/cordis' {
  interface Context {
    shell: ShellExecutor
  }
}

export abstract class ShellExecutor extends Service {
  constructor(ctx: Context) {
    super(ctx, 'shell')
  }

  abstract resolve(request: ShellExecRequest): ShellExecSpec
  abstract run(spec: ShellExecSpec): Promise<ShellRunResult>
  abstract start(spec: ShellExecSpec): ShellProcess
}
```

这段里有两个机制：

- **`declare module '@deepseek-ai/cordis'`**（TypeScript 的模块增广）：给 Cordis 的 `Context` 接口补充成员，之后全仓库的 `ctx.shell` 都是类型化的。这不是 Cordis 的特性，但 Cordis 的服务模型依赖它来获得类型检查；DSH 里所有服务、所有事件类型都靠它声明。
- **抽象类即契约**：`ShellExecutor` 是抽象的，`bash-local`、`pwsh` 这些实现包子类化它、作为插件加载，占住 `ctx.shell` 这个名字。占名是排他的——挂第二个实现会直接抛 duplicate-service 错误。配置里选哪行，运行时就是哪个实现。

`ShellExecutor` 只是契约，作为插件被加载的代码在实现包里，比如 `bash-local`（`packages/shell/bash-local/src/index.ts:95-112,122-123`）：

```ts
/**
 * Local bash executor over `ctx.subprocess`. ... a
 * still-running background process stays managed (killed and joined at
 * composition teardown) even across an executor reload.
 */
export class LocalBashExecutor extends ShellExecutor {
  static inject = ['subprocess']

  static Config: z<Config> = z.object({
    cwd: z.string(),
    timeoutMs: z.number().default(120_000),
    maxTimeoutMs: z.number().default(600_000),
    maxOutputBytes: z.number().default(64_000),
    // ...
  })
  // ...
  constructor(ctx: Context, config: Config) {
    super(ctx)
```

插件的全部义务就是这几行：继承契约（构造函数链最终走到 `super(ctx, 'shell')`，占住名字）、声明自己的依赖（它还需要更底层的 `subprocess` 服务）、接收 config。

这里没有 `apply`——类插件被启动时，Cordis 执行的就是 `new LocalBashExecutor(ctx, config)`，构造函数承担了启动逻辑。`config` 来自挂载时给的配置：YAML entry 的 `config:` 字段，或 `ctx.plugin(X, config)` 的 `config` 参数；上面那个 `static Config` 负责校验并填默认值（`timeoutMs` 缺省 120 秒那行就在里面）。

`resolve` / `run` / `start` 三个方法怎么实现，Cordis 完全不管——它只管 `shell` 这个名字当前绑定在哪个插件实例上（空着、被 `bash-sandbox` 占着、还是换成了 `pwsh-sandbox`），以及每个插件声明的依赖什么时候齐。引文顶部的文档注释也值得停一眼：仍在运行的后台进程在组合卸载时会被 kill 并 join，「even across an executor reload」——实现作者是带着「我随时可能被重载」的假设在写代码的。

## 四、inject：声明依赖，加载顺序自动推导

插件的第二个机制是 `inject`：声明「我需要哪些服务」，Cordis 让这个插件等到依赖出现再启动。一个函数式插件的完整样子（`packages/web/web-search-exa/src/index.ts:32,35,60`）：

```ts
export const name = 'web-search-exa'

/** The web seam this provider registers into. */
export const inject = ['web']

/** Register the Exa search provider with `ctx.web`. */
export function apply(ctx: Context, config: Config): void {
  ctx.web.registerSearchProvider(new ExaSearchProvider({
    apiKey: config.apiKey ?? launchEnvironmentOf(ctx).get('EXA_API_KEY')?.value ?? '',
    // ...
  }))
}
```

`inject = ['web']` 的效果：这个插件保持等待，直到某个插件把 `web` 服务提供出来，然后才执行 `apply`。类插件的等价写法是静态属性（`packages/core/agent-loop/src/index.ts:296-297`）：

```ts
/** Concrete agent factory and driver service. */
export class AgentLoop extends Service implements AgentFactory {
  static inject = ['agents', 'sessions', 'llm', 'tools', 'systemPrompt']
```

「声明依赖、等到依赖出现才启动」的直接收益：**组合插件时不用关心书写顺序**。DSH 里最完整的例子是 agent-spine，一个 bundle 插件，一口气挂载二十来个子插件（`packages/examples/agent-spine-demo/src/index.ts:212-261`）：

```ts
export function apply(ctx: Context, config: Config): void {
  // ...
  ctx.plugin(Timer)
  ctx.plugin(LlmRuntime)
  ctx.plugin(SessionStore)
  ctx.plugin(SystemPrompt, { /* ... */ })
  ctx.plugin(ToolRuntime, config.tools ?? {})
  // ...
  ctx.plugin(AgentLoop, { agents: config.agents ?? [], /* ... */ })
}
```

文件头注释把语义写明了（同文件 206-207 行）："Load order is irrelevant (cordis pends each fiber on its `inject` until the services it needs exist)"。清单最后一行的 `AgentLoop` 就是上面那个 `static inject = ['agents', 'sessions', 'llm', 'tools', 'systemPrompt']` 的类——它声明的 `llm`、`tools`、`systemPrompt` 等，由清单里前面的插件（`LlmRuntime`、`ToolRuntime`、`SystemPrompt`……）提供。把它挪到第一行，它也只会等到依赖就位；写在最后纯粹为了可读性。

## 五、注册即 effect：卸载从哪来

### 一次注册的内部：`ctx.effect` 藏在哪

第四节那个 provider 插件的 `apply`，实质动作只有一句：

```ts
ctx.web.registerSearchProvider(new ExaSearchProvider({ /* ... */ }))
```

这句调用进入 `WebRuntime.registerSearchProvider`，它直接转给同文件的 `registerProvider`——`ctx.effect` 就藏在这里（`packages/web/web/src/index.ts:98-105,118-125`）：

```ts
/**
 * ...
 * if its id is already registered for search. Returns a disposer; disposed
 * with the calling fiber.
 */
registerSearchProvider(provider: WebSearchProvider): () => void {
  return this.registerProvider(this.searchProviders, provider)
}

private registerProvider<P extends { readonly id: string }>(store: Map<string, P>, provider: P): () => void {
  if (store.has(provider.id)) {
    throw new WebError(`a web provider with id "${provider.id}" is already registered`, 'WEB_DUPLICATE_PROVIDER')
  }
  const dispose = this.ctx.effect(function* () {
    store.set(provider.id, provider)
    yield () => store.delete(provider.id)
  }, 'web.registerProvider()')
  // ...
}
```

`ctx.effect` 接收一个「做」的回调，回调返回（或 yield）一个「撤销」函数：生成器体的 `store.set(...)` 把 provider 加进注册表，yield 出来的 `store.delete(...)` 是撤销。引文里还有两个细节值得点名：第二个参数 `'web.registerProvider()'` 是这条 effect 的诊断标签，用在 `getEffects()` 的诊断输出里（比如排查某个实例挂着哪些 effect、哪条撤销出了错），缺省 `'anonymous'`，不影响行为；`ctx.effect` 的返回值 `dispose` 被包装后 return 给调用方——插件卸载时的自动执行是兜底，调用方也可以拿这个把手提前撤销这一次注册（web-search-exa 没接它，走的就是纯自动兜底）。

### 生成器：ctx.effect 立刻执行它

`ctx.effect` 拿到回调后立即自己驱动它（`vendor/cordis/src/fiber.ts:366,375-382`，`_execute` 内，省略其他返回值形态的分支）：

```ts
const effect: Effect = runner.execute.call(this)   // 调生成器函数，拿到迭代器
// ...（略：回调直接返回函数 / Promise / async 迭代器的分支）
} else if (Symbol.iterator in effect) {
  const iter = effect[Symbol.iterator]()
  while (true) {
    const result = iter.next()       // 当场驱动到底
    safeCollect(result.value)        // 每 yield 一条撤销，当场收走
    if (result.done) return
  }
}
```

所以 `store.set` 在 `ctx.effect` 被调用那一刻就执行了，撤销函数同时已被收集；返回的 `dispose` 是 Cordis 包的壳，调它等于执行已收集的全部撤销，且只执行一次。

### 撤销：谁登记，谁撤销

关键点在 `this.ctx` 指向谁。把第四节那段 `apply` 再看一遍——这次注意它的参数和那次属性访问发生在谁身上（`packages/web/web-search-exa/src/index.ts:60-61`，省略 provider 的构造参数）：

```ts
export function apply(ctx: Context, config: Config): void {
  ctx.web.registerSearchProvider(new ExaSearchProvider({ /* ... */ }))
}
```

`apply` 收到的 `ctx` 是 web-search-exa 自己的插件 ctx（第二节说的子 ctx），`ctx.web` 这次属性访问就发生在它上面：返回的 `WebRuntime` 不是裸对象，而是被 Cordis 包过的版本，包装在那一刻记住「是哪个 ctx 在读」。之后经包装调用的方法，方法内的 `this.ctx` 都追溯到它——所以 `registerProvider` 里那条撤销函数登记在 web-search-exa 自己的插件实例上，而不是 `WebRuntime` 的实例上。

对照一下：如果 `WebRuntime` 内部调 `this.registerProvider(...)`（比如它初始化时给自己登记一个内置 provider），`this.ctx` 是它自己的 ctx，撤销归它的实例——那样想移除掉这个条目，就得动 `WebRuntime` 本身。

实际链路里则是撤销归注册方：条目留在 `WebRuntime` 的表里，但「怎么移除掉它」的函数由 web-search-exa 的实例保管。两边各管各的——`WebRuntime` 只持有表，不用知道 `Provider` 里的条目是谁放的，也不用替别人清理；web-search-exa 被卸载时，它自己登记的撤销 `store.delete` 被自动执行，` Provider` 条目从注册表里消失。注册表持有方和注册方的生命周期互不耦合。

注册方从头到尾也不需要写任何清理代码。卸载本身由编排动作触发——把那行 entry 从 cordis.yml 删掉、加上 `disabled: true`、或用 patch 替换，Loader 会处置对应的插件实例，执行它登记的全部撤销。

「登记在实例上」也有具体所指：每个插件实例身上有一个处置列表，`ctx.effect` 把撤销函数 push 进去（`vendor/cordis/src/fiber.ts:203,520`，`Fiber` 类）：

```ts
public readonly _disposables = new DisposableList<Disposable>()   // 每个实例的处置列表

// Fiber.effect 内：
removeWrapper = this._disposables.push(wrapper)                    // 「登记」= push 进列表
```

卸载时清空并逐条执行（同文件 675-676，`_unload` 内）：

```ts
await Promise.all(this._disposables.clear().map(async (dispose) => {
```

Loader 和这张列表的关系是「触发」与「执行」的分工：每个 entry 握着对应实例的引用（`entry.fiber`），配置变化命中禁用/删除/替换时，Loader 调一次 `await fiber.dispose()`（`vendor/loader/src/config/entry.ts:130-135` 的 `Entry._dispose`），对列表里有什么一无所知；`fiber.dispose()` 触发实例自己的卸载流程，由上面的 `_unload` 清空并执行列表。Loader 决定何时处置哪个实例，实例决定处置时做什么——两边只隔着 `fiber.dispose()` 这一个方法，「配置驱动卸载」和「插件作者不写清理代码」就是这样拼起来的。

### 为什么是生成器：边做边交

普通函数只能在结束时 `return` 一个撤销函数，生成器可以**边做边交**：每完成一步就 `yield` 这一步的撤销。区别在中途出事时才显现——一个多步的 setup 跑到一半失败了（或依赖在这期间变化、启动被中止），已 yield 的撤销已被 Cordis 逐步收走，已完成的步骤能被精确回滚；「最后 return」的形式在中途失败时什么都交不出来，已做的改动就泄漏了。生成器还可以是 async generator：步骤之间允许 `await`（异步 setup），撤销照样逐步收集。本例只有一步 setup，两种写法等价，生成器是 DSH 的统一习惯。

一个真实的多步例子：`SessionStore` 创建会话分两步——入库，然后广播 `session/created` 事件（`packages/core/session/src/index.ts:833-839`，注释是代码里原有的）：

```ts
// announcing so a throwing `session/created` listener rolls the attach back
// (the generator effect disposes already-yielded disposers on a throw)
// instead of leaking the store entry and its publication hooks.
this.ctx.effect(function* (this: SessionStore) {
  yield this.enter(session)   // 第一步：入库，立刻交出「移除它」的撤销
  this.announce(session)      // 第二步：广播——监听器可能抛错
}.bind(this), 'sessions.create()')
```

注意顺序：撤销在广播**之前**交出。注释把理由写明了——如果监听器抛错，已 yield 的撤销会把入库回滚，而不是在存储里留下一条带钩子的脏条目。这就是「边做边交」的实战形态：不是失败后的补救，而是写代码时就按「下一步可能炸」排顺序。

异步与组合的形态也有真实例子：`settings-file` 的 `[Service.init]` 是个 async generator（`packages/settings/settings-file/src/index.ts:232-269`），步骤之间有 `await`（等待路径解析后起文件监听器），并用 `yield* super[Service.init]()` 把基类交出的撤销一并收集——基类「加载并发布设置」的撤销和子类「关闭监听器」的撤销由此进同一条回收链。

### 约定：「一切注册走 `ctx.effect`」

像 `store.set` 这样「把一个对象加进一张由别的组件持有的表、让系统其他部分能找到它」的动作——注册 provider、注册事件监听、注册工具、注册服务——DSH 统称为注册，并立了一条硬约定：**一切注册都走 `ctx.effect()`**。这条约定在框架层是字面成立的，看 `provide` 的完整实现（`vendor/cordis/src/reflect.ts:277-305`，省略属性声明的簿记）：

```ts
provide(name: string, value?: any, check?: () => boolean) {
  return this.ctx.fiber.effect(() => {
    // ...（略：把 name 声明为 service 的簿记）
    this.ctx.root[symbols.isolate][name] ??= Symbol(name)
    const key = this.ctx[symbols.isolate][name]
    const impl: Impl = { name, value, fiber: this.ctx.fiber, check }
    if (this.store[key]) {
      throw new Error(`service "${name}" has been registered at <${this.store[key].fiber.name}>`)
    }
    this.store[key] = impl
    this.ctx.fiber.store![name] = impl
    if (this.ctx.fiber.state === FiberState.ACTIVE) {
      this.notify([name])
    }
    return async () => {
      delete this.store[key]
      const fibers = this.notify([name])
      await Promise.allSettled(fibers.map(fiber => fiber.await()))
      // ensure self access before dependencies cleanup
      delete this.ctx.fiber.store![name]
    }
  }, `ctx.provide(${JSON.stringify(name)})`)
}
```

「做」的部分：把 `{ name, value, fiber }` 写进 store，名字已被占用就直接抛错——这就是第三节说的占名排他；如果自己已经激活，`notify` 唤醒等待这个服务的插件。「撤销」的部分值得逐行读：先摘掉名字，`notify` 依赖方，然后 **`await` 它们全部停妥**，最后才清自己实例上的记录——「消费方先停、提供方后撤」的顺序就写在这里。所以第二节 boot 里的 `ctx.provide('dshHomePath', ...)`、第三节 `Service` 构造函数里的 `provide`，走的都是同一条「登记—回收」通道：提供方插件被卸载，它提供的服务名自动消失，声明依赖它的插件随之停用。这个约定是 DSH 两个高级能力的地基：

- **配置热重载**：改一下 patch 文件，Loader 卸载旧子树、挂上新子树，effect 机制保证旧子树注册过的服务、工具、监听器全部回收，不留中间态。
- **插件作用域隔离**：一个 preset（第七节）挂载的子树被卸载时，它注册过的工具、prompt 段、事件监听全部自动消失，不用手工对账。

事件监听也不例外：`ctx.on` 内部同样是 `ctx.effect`（`vendor/cordis/src/events.ts:254-259`），监听器的生命周期跟着注册它的插件走——插件卸载，监听自动摘除。至于 DSH 在事件之上搭建的 `waterfall` 式扩展点（`llm/stream`、`agent/pre-step` 等），那是 DSH 的用法而非 Cordis 的新机制，本文不展开。

## 六、如何写一个插件：Cordis 把复杂度藏了起来

前五节把机制拆开讲了，这一节来看看写一个插件到底都需要什么，一个插件的生命周期又是怎么样的。

下面是一个服务插件要写的全部 Cordis 相关代码。`SandboxBashExecutor` 是 bash-sandbox 包的主类，即在 base bundle 里占住 `ctx.shell` 的那个实现（`packages/shell/bash-sandbox/src/index.ts:44-45,67-72,182`，省略沙箱业务逻辑）：

```ts
import { Context } from '@deepseek-ai/cordis'
import { LocalBashExecutor } from '@deepseek-ai/dsh-bash-local'

export class SandboxBashExecutor extends LocalBashExecutor {
  static override inject = ['subprocess', 'sandbox', 'sandboxPolicy']

  constructor(ctx: Context, config: Config) {
    super(ctx, config)
    this.mode = ctx.sandboxPolicy.defaultMode   // inject 声明过的服务，直接用
  }

  override resolve(request: ShellExecRequest): ShellExecSpec { /* ... */ }
  override async run(spec: ShellExecSpec): Promise<ShellRunResult> { /* ... */ }
  override start(spec: ShellExecSpec): ShellProcess { /* ... */ }
  // ...（沙箱业务逻辑，Cordis 不关心）
}

export default SandboxBashExecutor
```

数一数 Cordis 要求的东西：**继承契约**（`extends LocalBashExecutor`，链条上到 `ShellExecutor`）、**声明依赖**（`static inject`，比父类多要 `sandbox` 和 `sandboxPolicy` 两个服务）、**构造函数收 `(ctx, config)`**——里面直接用了 `ctx.sandboxPolicy`，因为 inject 声明保证了它在。就这些：没有注册调用，没有卸载代码，没有生命周期钩子；`resolve` / `run` / `start` 是纯业务逻辑。末尾的 `export default` 是让 Loader 能找到这个类。

剩下的问题只剩一个：这个类被挂载之后，运行时会拿它做什么。这就是下面的时间线。

**第 0 步：契约先行。** `@deepseek-ai/dsh-shell` 定义抽象类 `ShellExecutor`（第三节）：声明 `ctx.shell` 的类型和三个抽象方法，自己不提供任何实现。

**第 1 步：挂载。** 编排层的配置里有一行 entry（`packages/bundle/base/cordis.patch.yml:178-182`）：

```yaml
- id: bash-sandbox
  name: '@deepseek-ai/dsh-bash-sandbox'
  disabled: !!js process.platform === 'win32'
  config:
    timeoutMs: 60000
```

Loader 读到它：`import` 这个包、创建插件实例（`vendor/loader/src/config/entry.ts:277-285`，`Entry._init`：先 `this.parent.tree.import(this.options.name, ...)`，再 `_start(plugin)` 建实例）。挂载动作由配置驱动——启动时 Loader 展开到这行就挂，之后配置变化（热重载、patch、preset）也会触发；插件自己从不发起挂载。注意 `disabled` 表达式——Windows 上这行根本不挂载，由它的孪生 `pwsh-sandbox`（同文件 184-186 行，条件相反）顶上。

**第 2 步：等待。** 实现类声明了 `static inject = ['subprocess', 'sandbox', 'sandboxPolicy']`（上面骨架的第二行）。这三个服务没全部就位时，实例停在等待状态，构造函数不会执行。

**第 3 步：启动。** 三个依赖就位，Cordis 执行 `new`（类即启动回调，第二、三节）：`static Config` 先校验 config——`timeoutMs: 60000` 就是在这里过 schema 的；构造函数链走到 `super(ctx, 'shell')`，`provide` 占住名字（第五节末展开的那段实现）；实例激活，`notify` 唤醒所有声明需要 `shell` 的插件。

**第 4 步：服务期。** 消费方（比如 tool-bash 插件）经 `ctx.shell.run(...)` 调它。每次调用经过包装层，方法内的 `this.ctx` 归属调用方——消费方经它做的注册，挂在消费方自己的实例上（第五节）。

**第 5 步：卸载。** 配置把这行禁用、删掉，或热重载触发重建：Loader 调 `fiber.dispose()`，处置列表按 LIFO 执行——仍在运行的后台进程被回收（第三节末文档注释承诺的 killed and joined），`provide` 的撤销摘掉 `shell` 这个名字、`notify` 依赖方并等它们先停妥。

**第 6 步：替换（如果发生）。** 把 entry 的 `name` 换成另一个实现包：旧实例走第 5 步，名字空出；新实例走第 2–3 步占名；声明需要 `shell` 的插件被重载到新实现上（第二节的「持续重判定」）。

可以发现，组合的复杂度被一次性收进了框架——Cordis 负责登记、依赖判定、回收，DSH 负责「一个能力拆成三个包（Definition / Provider / Consumer）」的组织纪律和配置的静态检查——留给模块作者的只有领域代码。所以「新增一个模块」分两档：给现有能力加一种实现（比如再加一个搜索后端），是几十行代码加一行 YAML；

真正还留有成本的是新开一个能力，必须要同时备齐定义服务契约的包、提供实现的包、面向模型或用户的消费方包。这其实是设计决策，而不只是写领域代码那么简单。这三个包在第一节已经提过：`dsh-shell`（契约）、`dsh-bash-sandbox`（实现）、`dsh-tool-bash`（消费方）。

## 七、组合即配置：cordis.yml、patch 层叠与 preset

Loader 把整个系统描述成数据。一份 `cordis.yml` 就是一个 entry 列表，每个 entry 常用四个字段：`id`（行标识）、`name`（包名）、`config`（传给插件的配置）、`disabled`（开关）。真实例子（`examples/headless-agent/cordis.yml:9,23,44`）：

```yaml
- id: settings
  name: '@deepseek-ai/dsh-settings-file'

- id: llm-deepseek
  name: '@deepseek-ai/dsh-llm-deepseek'
  config:
    thinking: enabled
    reasoningEffort: max
    models:
      - id: deepseek-v4-pro
        contextWindow: 128000

- id: agent-spine
  name: '@deepseek-ai/dsh-agent-spine-demo'
```

文件里唯一的「编程能力」是 `!!js` 表达式，且只允许出现在两个字段里：`config`（在该插件的依赖激活后求值，所以能引用环境状态）和 `disabled`（每次挂载决策时求值，所以能按平台开关整行）。其余字段一律字面量，有静态检查（`scripts/verify-cordis-config.ts`）在提交时强制。

实际跑起来的树不是单份文件。一份 patch 不是完整的树，而是一份**按 `id` 寻址的修改清单**：每个条目定位到已有的一行，整份替换该行的 `config`（不做深合并）。最终生效的树由五层 patch 依次叠出：每个 bundle 的 `cordis.patch.yml`（按声明顺序）→ profile 自己的 patch → 机器级的 `$DSH_HOME/cordis.patch.yml`（对所有 profile 生效，所以压过 per-profile 层）→ 命令行 `--patch` → telemetry 开关；同一行被多层写到时，后写的层胜。

一个真实例子。base bundle 挂载 HMR 插件（`packages/bundle/base/cordis.patch.yml:19-22`）：

```yaml
- id: hmr
  name: '@deepseek-ai/cordis-plugin-hmr'
  config:
    root: ['.']
```

headless bundle 写同一个 `id: hmr`，只写 `disabled: true`（`packages/bundle/headless/cordis.patch.yml:12-15`，注释是文件里原有的）：

```yaml
# The shared module-reload HMR row stays off; the launcher's watch-only
# fallback still keeps the user patch layers live until the run exits.
- id: hmr
  disabled: true
```

profile 声明 bundle 的顺序里 headless 排在 base 后面，patch 按这个顺序依次应用，于是 headless 运行时 HMR 被关掉，base 那行一个字不动。想看实际跑的是哪棵树：`dsh --profile web --dump-config`。

到这里，组合都是进程级的：cordis.yml 打底（第一层），patch 层叠修改它（第二层），整个进程一棵树。**第三层是 preset，session 级**（`apps/cli/config/agent-presets/*/agent.cordis.yml`）。preset 和 cordis.yml 一样是 entry 列表，区别在生效范围：cordis.yml 的树整个进程共享，里面的服务是所有 session 共用的单例；preset 挂在一个 session 上，同一进程里不同 session 可以挂不同的 preset——一个跑「极简」、一个跑「创造」互不干扰。

由此有一条硬约束：preset 里的 service 行必须放进带 `isolate` 的 `cordis:group`，否则两个 session 会撞同一个进程级单例（下面极简模式的 `persistent-shell` 就是这个写法）。CLI 的「标准 / PTC / 极简 / 创造」四个模式**不是 mode 字段、也不是 if/else 分支，就是四个 shipped preset 目录**，每个目录只有一份组合 YAML 和一份展示元数据。四个模式的全部差异就是 YAML 行的差异：

- **极简模式**（`minimal/agent.cordis.yml:8,18`）：persona 用 `complete: true` 独占整个系统提示词，只挂少量工具；per-session 的服务放进带 `isolate` 的 `cordis:group`，避免两个 session 撞同一个进程级单例：

```yaml
- id: persona
  name: '@deepseek-ai/dsh-persona'
  config:
    text: You are a helpful software engineer assistant.
    complete: true

- id: persistent-shell
  name: cordis:group
  group: true
  isolate:
    terminals: true
  config:
    - id: pty
      name: '@deepseek-ai/dsh-terminal'
```

`isolate: { terminals: true }` 的意思是：给 `terminals` 这个服务名开一个这个 group 私有的解析空间。里面的 pty 插件会提供 `terminals` 服务（PTY 注册表）；

同一 preset 被两个 session 各挂一次时，没有这个隔离，第二次挂载就会在 `provide` 时撞独占名的重复错误（第五节）。有了它，组内的 provide 和读取都落进私有空间，组外和别的 session 的同款 group 都看不见——每个 session 拿到自己的 PTY 注册表。（这里的 `true` 属性表示这个 entry 私有；loader 还支持写字符串让多个 entry 共享一个隔离空间，DSH 自带的配置没有用到这种形式。）

- **标准模式**（`standard`）：完整编码 agent，其中 shell 工具按平台二选一（`code/agent.cordis.yml:51-57`，standard 中相同）：

```yaml
- id: tool-bash
  name: '@deepseek-ai/dsh-tool-bash'
  disabled: !!js process.platform === 'win32'

- id: tool-pwsh
  name: '@deepseek-ai/dsh-tool-pwsh'
  disabled: !!js process.platform !== 'win32'
```

- **PTC 模式**（`code`）：standard 的完整副本加一行（`code/agent.cordis.yml:259-262`），把工具呈现形式换成「一个 `run_code` 工具加生成的 TypeScript SDK」，模型写程序组合多步操作：

```yaml
- id: tool-presentation
  name: '@deepseek-ai/dsh-agent-tool-presentation'
  config:
    mode: code
```

- **创造模式**（`cordis`）：standard 的副本，加的是自我修改能力（`cordis/agent.cordis.yml:245,255`）——读写、挂载、卸载运行时插件的工具集，外加一个教组合编写的 skill：

```yaml
- id: tool-cordis
  name: '@deepseek-ai/dsh-tool-cordis'

- id: skill-filesystem
  name: '@deepseek-ai/dsh-skill-filesystem'
```

最后这个 preset 的文件头有一条信任边界声明（同文件 9-12 行）：`cordis_mount` 在运行时里执行模型写的 JavaScript，跑在创造模式下的 session 要按 shell 权限对待。

机制上的结果：**加第五个模式不需要改任何 TypeScript**——拷一个 preset 目录，改 YAML。这就是「组合即配置」的字面意思。

## 八、对照：每个用法吃到了 Cordis 的什么特性

把前七节按 Cordis 特性重新归拢一次：

| Cordis 特性 | DSH 里的用法 |
| --- | --- |
| Context 树 + 服务注册（`provide`） | everything is a plugin；`ctx.shell` / `ctx.llm` / `ctx.web` 全部由各包自行注册（第三节） |
| `inject` 依赖声明 + 按可用性调度启动 | 组合插件不关心顺序；agent-spine 一次挂二十来个子插件（第四节） |
| `ctx.effect` 可逆注册 | provider 注册、事件监听随插件卸载自动回收；配置热重载不留中间态（第五节） |
| Loader 声明式组合 | cordis.yml + patch 层叠（进程级）、preset（session 级）；四个模式是四份 YAML（第七节） |
| `isolate` 隔离 | preset 里 per-session 服务放进 isolate group，同进程多 session 互不干扰（第七节） |

论文 §1.2.2 把「自进化 agent harness」列为这个框架的头号动机场景：harness 在持续服务的同时生成、替换自己的组件。DSH 的创造模式是这个场景的一个产品化切片——模型通过 `cordis_mount` 等工具直接修改自己运行时的插件树，而它能安全这么做，靠的正是上面每一行机制：依赖声明决定启动时机、effect 决定卸载干净、Loader 把「想要的系统形态」变成一份可读可写的数据。

## 九、开发者视角：DSH 为什么是 meta harness

第八节末尾说，创造模式让模型能直接修改运行时的插件树。接下来谈谈，这个能力为什么成立、成立之后又意味着什么。

回顾一下，harness 的工作本质是**组装模型的上下文**——系统提示词、工具列表、环境信息。在前面的章节里，这些片段每一个都有明确的负责方：persona 管提示词文本（第七节的极简模式用它独占整个系统提示词），systemPrompt 管提示词分段，tools 管工具注册表。这些片段全是第五节的「effect 注册」——可撤销、可替换、可热重载。

于是改 harness 的行为变成一件局部的事，而且文章里已经有一个现成的例子：shell 的实现从 bash-local 换成 bash-sandbox（第六节的主角），执行的约束策略就从不设防变成沙箱隔离——消费方 tool-bash 一行不动（第一节的互不引用），改完热重载生效，不重启（第五节）。想换文件访问的权限逻辑、想换搜索后端、想换提示词组织方式，都是同一个动作：写一个实现包，改一行 YAML。不需要在胶水代码里找分散的处理点。

这个工作流对人和对 agent 是同构的。每个插件的输入输出是可验证的：config 进去，注册出来，行为可测——所以「调试某处上下文怎么工作」可以整个交给 agent 自己：改插件、热插拔、验证，循环闭合。创造模式把这个循环产品化了，并且附了明确的信任边界声明。

到这里可以说清 meta harness 的含义了：DSH 不规定 agent 长什么样，因为 agent 循环自己也只是 agent-spine 清单的二十来行之一（第四节）。它提供的是组合机制，harness 的形态由配置决定：先定的是**上下文结构**——系统提示词分哪些段、有哪些工具、环境信息怎么进——代码（插件）填进这个结构里；而不是先写代码、让上下文结构从代码里涌现出来。扩展点也不再是散落在代码里的 hook 回调，everything is a plugin。

对我来说，这真的增添了很多想象空间。或许，大家可以期待一下我们之后会在 deepseek harness 上做的一些东西吧。（怎么还有广告环节）
