# Higress Console 前端 AI 网关管理与消费者管理模块设计文档

## 1. 文档目标

本文档面向 `frontend` 子项目，基于当前 React + Ice.js + Ant Design 实现，系统梳理以下三个模块的页面设计、交互行为、数据结构、跨页关联和优化方向：

1. `AI 服务提供者管理`，路径 `/ai/provider`
2. `AI 路由管理`，路径 `/ai/route`
3. `消费者管理`，路径 `/consumer`

文档目标不是重新发明一套新方案，而是把现状实现完整整理出来，并在现状基础上给出面向后续迭代的优化建议。

## 2. 文档范围与基线

### 2.1 范围

本文档覆盖以下页面和直接衍生交互：

1. `frontend/src/pages/ai/provider.tsx`
2. `frontend/src/pages/ai/components/ProviderForm/index.tsx`
3. `frontend/src/pages/ai/route.tsx`
4. `frontend/src/pages/ai/components/RouteForm/index.tsx`
5. `frontend/src/pages/ai/components/RouteForm/Components.tsx`
6. `frontend/src/pages/ai/route/config.tsx`
7. `frontend/src/pages/consumer/index.tsx`
8. `frontend/src/pages/consumer/components/ConsumerForm/index.tsx`

### 2.2 不在本次展开范围内的相邻模块

以下模块会在文中作为依赖被提及，但不展开详细设计：

1. `/ai/dashboard`
2. `/mcp/*`
3. `/route`
4. `/domain`
5. `/plugin`
6. `/service-source`

### 2.3 相关基础文件

本文档梳理中直接参考的类型、服务和文案来源包括：

1. `frontend/src/interfaces/llm-provider.ts`
2. `frontend/src/interfaces/ai-route.ts`
3. `frontend/src/interfaces/consumer.ts`
4. `frontend/src/interfaces/route.ts`
5. `frontend/src/interfaces/domain.ts`
6. `frontend/src/services/llm-provider.ts`
7. `frontend/src/services/ai-route.ts`
8. `frontend/src/services/consumer.ts`
9. `frontend/src/pages/_defaultProps.tsx`
10. `frontend/src/locales/zh-CN/translation.json`

## 3. 信息架构

### 3.1 菜单层级

现有菜单中，这三块模块的入口关系如下：

| 一级分组 | 二级页面 | 路径 | 职责 |
| --- | --- | --- | --- |
| AI 服务管理 | AI 服务提供者管理 | `/ai/provider` | 管理大模型上游定义 |
| AI 服务管理 | AI 路由管理 | `/ai/route` | 管理 AI 请求入口、匹配、上游与认证 |
| 独立一级菜单 | 消费者管理 | `/consumer` | 管理请求调用方身份与凭证 |

这里的菜单布局传达出一个非常明确的产品认知：

1. `Provider` 是 AI 服务域内的资源对象
2. `AiRoute` 是 AI 服务域内的编排对象
3. `Consumer` 是网关全局认证主体，因此被放在独立一级菜单，而不是 AI 子菜单内部

### 3.2 核心实体

#### Provider

`Provider` 对应接口 `LlmProvider`，当前页面关心的核心字段包括：

1. `name`
2. `type`
3. `protocol`
4. `tokens`
5. `proxyName`
6. `tokenFailoverConfig`
7. `rawConfigs`

它描述的是“网关如何连到某个 AI 服务供应商”。

#### AiRoute

`AiRoute` 对应接口 `AiRoute`，当前页面关心的核心字段包括：

1. `name`
2. `domains`
3. `pathPredicate`
4. `headerPredicates`
5. `urlParamPredicates`
6. `modelPredicates`
7. `upstreams`
8. `authConfig`
9. `fallbackConfig`
10. `customConfigs`

它描述的是“什么请求走哪条 AI 路由，由谁访问，命中后怎么转发到哪个 Provider”。

#### Consumer

`Consumer` 对应接口 `Consumer`，当前页面关心的核心字段包括：

1. `name`
2. `credentials[]`

它描述的是“谁可以调用网关，以及该调用方用什么方式携带认证信息”。

### 3.3 实体关系

| 源实体 | 目标实体 | 关系字段 | 关系说明 |
| --- | --- | --- | --- |
| Provider | AiRoute | `AiRoute.upstreams[].provider` | 路由主上游直接引用 Provider 名称 |
| Provider | AiRoute | `AiRoute.fallbackConfig.upstreams[].provider` | 路由降级上游直接引用 Provider 名称 |
| Consumer | AiRoute | `AiRoute.authConfig.allowedConsumers[]` | 路由授权名单直接引用 Consumer 名称 |
| Domain | AiRoute | `AiRoute.domains[]` | 路由可绑定多个域名 |
| AiRoute | 插件配置 | `ai-route-${name}.internal` | 路由扩展策略列表读取内部资源名 |

由此可见，`AiRoute` 是 Provider、Consumer、Domain 三类对象的汇合点。

## 4. 全局交互模式

这三块页面虽然属于不同业务对象，但使用了高度一致的交互骨架。

### 4.1 页面容器模式

都采用 `PageContainer` 作为外层容器，主内容区遵循如下模式：

1. 顶部白底操作区或筛选区
2. 下方主表格
3. 右侧抽屉承载新建和编辑
4. 删除确认弹窗承载危险操作

### 4.2 创建态与编辑态

三个页面的抽屉表单都同时承担创建和编辑。

当前实现中，三个对象的主键在编辑态都会被锁定：

1. Provider 编辑时 `type` 与 `name` 不可改
2. AiRoute 编辑时 `name` 不可改
3. Consumer 编辑时 `name` 不可改

这意味着前端把 `name` 视为稳定资源标识，而不是可随时修改的显示名。

### 4.3 数据加载模式

列表页均通过 `useRequest` 加载数据，并在成功后执行以下整理：

1. 将 `name` 回写到 `key`
2. 按名称排序
3. 将结果写入本地状态再渲染

因此，当前页面的排序策略是前端固定排序，而不是依赖后端顺序。

### 4.4 成功与失败反馈模式

反馈设计当前并不统一：

1. Consumer 删除成功会明确弹出成功提示
2. Provider 和 AiRoute 的创建、编辑、删除大多只做刷新，不做成功提示
3. 多数失败场景仅捕获异常后关闭状态、刷新列表或打印日志，用户可见反馈较少

这是三页共有的体验不一致点。

## 5. AI 服务提供者管理

### 5.1 页面定位

`/ai/provider` 是 AI 网关的上游定义中心。它不处理访问入口，也不处理授权主体，只负责维护“一个可被 AI 路由消费的 AI 供应商配置”。

### 5.2 页面结构

页面由 4 个层级构成：

1. 顶部操作条
2. 主表格
3. 新建/编辑抽屉
4. 删除确认弹窗

### 5.3 顶部操作条

顶部区域只有两个动作：

1. 左侧主按钮 `创建AI服务提供者`
2. 右侧刷新按钮

当前页没有：

1. 搜索框
2. 筛选器
3. 分页控制
4. 批量操作
5. 详情入口

因此页面更像“资源维护台”，而不是“运营管理台”。

### 5.4 列表表格设计

当前表格固定列为：

| 列名 | 数据来源 | 展示逻辑 | 交互 |
| --- | --- | --- | --- |
| 类型 | `type` | 通过 i18n 和 provider 配置映射为中文显示名 | 无 |
| 名称 | `name` | 直接展示，支持省略 | 无 |
| 服务端点 | `type + rawConfigs` | 动态推导 endpoint 列表，多值换行展示 | 无 |
| 凭证 | `tokens` 或自定义凭证展示 | 默认脱敏，逐条支持明文切换 | 点击眼睛图标切换隐藏/显示 |
| 代理 | `proxyName` | 为空显示 `-` | 无 |
| 操作 | 当前行对象 | 展示 `编辑 / 删除` | 打开抽屉或确认弹窗 |

#### 5.4.1 服务端点列

该列不是直接回显后端字段，而是前端按 `type` 解释数据：

1. `openai` 官方模式回退到默认 `https://api.openai.com/v1`
2. `openai` 自定义 URL 模式展示一个或多个 URL
3. `openai` 自定义 Service 模式会根据服务对象拼出内部访问地址
4. `qwen` 根据兼容模式与自定义域名拼出访问地址
5. `azure` 展示完整 `azureServiceUrl`
6. `claude` 固定回显 `https://api.anthropic.com`
7. `zhipuai` 会按自定义域名或默认域名回显

因此这列的产品含义是“当前 Provider 的实际请求入口”，而不是原始配置字段快照。

#### 5.4.2 凭证列

凭证列的交互重点是保护敏感信息的同时保留人工核对能力：

1. 默认脱敏
2. 单条逐项显示
3. 支持单独切换显隐

当前列中没有以下能力：

1. 一键复制
2. 最后更新时间
3. 引用 Secret 标记
4. 凭证有效性状态

### 5.5 新建/编辑抽屉

抽屉宽度约 `660px`，标题根据模式在“创建 AI 服务提供者”和“编辑 AI 服务提供者”之间切换。

#### 5.5.1 公共字段

所有 Provider 都共享以下基础字段：

| 字段 | 必填 | 编辑态 | 说明 |
| --- | --- | --- | --- |
| 大模型供应商 `type` | 是 | 禁止修改 | 决定动态字段分支 |
| 服务名称 `name` | 是 | 禁止修改 | 资源标识，不能包含 `/` |
| 协议 `protocol` | 是 | 可修改 | 当前支持 `openai/v1` 和 `original` |
| 凭证列表 `tokens[]` | 视类型而定 | 可修改 | 默认动态数组形式 |
| 代理 `proxyName` | 否 | 可修改 | 来自代理服务列表 |
| 令牌降级 `failoverEnabled` | 否 | 可修改 | 决定是否展开 failover 配置 |

#### 5.5.2 凭证录入方式

默认 Provider 采用 `Form.List` 管理 `tokens[]`：

1. 支持新增 token
2. 支持删除 token
3. 支持多个 token 同时配置
4. token 可为空时会在提交前被过滤

如果某个 provider 配置声明 `useCustomCredentials`，则会改为使用 provider 自己的凭证字段与展示逻辑。

#### 5.5.3 Secret 引用说明弹窗

表单在凭证录入区下方提供一个入口“我想引用保存在 Secret 中的凭证信息”。点击后打开说明弹窗，解释两种占位写法：

1. 同命名空间 Secret：`${secret.secret-name.field-name}`
2. 跨命名空间 Secret：`${secret.ns-name/secret-name.field-name}`

该弹窗只承担说明职责，不负责选择 Secret，也不校验引用是否真实存在。

#### 5.5.4 令牌降级配置

开启 `令牌降级` 后，表单会展开如下字段：

1. 最小连续失败次数 `failureThreshold`
2. 最小连续健康检测成功次数 `successThreshold`
3. 健康检测间隔 `healthCheckInterval`
4. 健康检测超时 `healthCheckTimeout`
5. 健康检测模型 `healthCheckModel`

这套配置不是 Provider 间切换，而是同一 Provider 内多个 token 的熔断与恢复控制。

### 5.6 Provider 类型驱动的动态字段

当前 Provider 抽屉不是静态表单，而是根据 `type` 切换字段块。

#### 5.6.1 OpenAI

OpenAI 分为两层选择：

1. `OpenAI 官方服务`
2. `自定义服务`

当选择自定义服务时，再分为：

1. `输入 URL`
2. `选择服务`

##### 输入 URL 模式

支持配置一个或多个自定义 URL，前端校验规则包括：

1. 每项必须是合法 HTTP/HTTPS URL
2. 多个地址同时存在时，必须全部是 IP 形式主机名
3. 多个地址的协议必须一致
4. 多个地址的路径必须一致

这是在为多实例轮询和 failover 做前提约束。

##### 选择服务模式

允许从网关服务列表中选择目标服务，并补充：

1. 服务路径
2. 可选的自定义 Host

提交时前端会把服务对象重新拼装成 `openaiCustomUrl`、`openaiCustomServiceName` 和 `openaiCustomServicePort` 等原始字段。

#### 5.6.2 Qwen

Qwen 表单支持：

1. 开启联网搜索
2. 开启兼容模式
3. 维护文件 ID 列表
4. 在官方服务和自定义域名之间切换

其中自定义域名要求符合域名格式；兼容模式会影响 endpoint 的拼装方式。

#### 5.6.3 Azure

Azure 只暴露一个核心字段 `azureServiceUrl`，但对该字段做了较严格的格式语义校验：

1. 必须是合法 URL
2. 必须带有 `/chat/completions` 语义路径
3. 必须包含非空 `api-version` 查询参数

#### 5.6.4 其他主要类型

当前页面还对以下 provider 类型提供专属字段块：

| 类型 | 主要字段 |
| --- | --- |
| `zhipuai` | 自定义域名、Code Plan 模式 |
| `claude` | API 版本、Claude Code 模式 |
| `ollama` | Host、Port |
| `bedrock` | Region、Access Key、Secret Key |
| `vertex` | Region、Project ID、服务账号 JSON、安全设置列表 |
| `vllm` | 一个或多个自定义 URL |

其中 `vertex` 的服务账号密钥采用 JSON 字符串输入，并在前端校验必须包含：

1. `client_email`
2. `private_key_id`
3. `private_key`
4. `token_uri`

### 5.7 提交逻辑

Provider 表单提交后的数据归一化规则如下：

1. 过滤空 token
2. 将 `failoverEnabled` 和附属字段合并成 `tokenFailoverConfig`
3. 将代理选择写入 `proxyName`
4. 将 provider 类型动态字段收口到 `rawConfigs`
5. 保留 UI 未暴露但原对象中存在的 `rawConfigs` 附加字段，避免编辑覆盖时误丢失

其中第 5 点很重要。当前实现明确做了“原始配置黑名单保护”，防止用户打开编辑抽屉保存后，把后端先前写入但 UI 未展示的字段覆盖掉。

### 5.8 删除交互

点击删除后弹出二次确认框，确认内容仅包含 Provider 名称。当前删除前不会展示：

1. 被哪些 AI 路由引用
2. 是否仍有依赖关系
3. 删除的影响范围

这意味着删除风险完全依赖用户自己的上下文判断。

### 5.9 当前问题与优化建议

#### 现状问题

1. 列表页缺少搜索和筛选
2. 删除前无引用检查
3. 编辑态没有只读详情模式
4. 凭证列没有复制能力
5. 成功反馈和失败反馈不统一

#### 优化建议

1. 增加按名称、类型、协议、是否使用代理的筛选
2. 增加“被多少条 AI 路由引用”的只读列
3. 删除前展示引用路由清单并阻止危险删除
4. 将凭证显示区升级为“脱敏 + 复制 + Secret 引用标记”
5. 为 Provider 提供详情态抽屉，区分查看与编辑

## 6. AI 路由管理

### 6.1 页面定位

`/ai/route` 是 AI 网关配置的中枢页面。它把请求入口、路由匹配、模型匹配、目标 Provider、降级策略、授权消费者、附加注解和策略配置入口汇总到一个对象上。

### 6.2 页面结构

页面包含 6 个交互层：

1. 顶部查询与操作区
2. 路由主表格
3. 表格行展开区，用于展示策略配置
4. 新建/编辑抽屉
5. 用法弹窗
6. 删除确认弹窗

### 6.3 顶部查询与操作区

顶部白底区域包含：

1. 一个搜索框
2. 一个“创建 AI 路由”按钮
3. 一个刷新按钮

搜索框支持按以下字段模糊搜索：

1. 路由名称
2. 域名
3. 路径匹配值
4. 上游 Provider 名称

当前不支持独立筛选：

1. 是否开启认证
2. 是否启用降级
3. 是否命中某消费者
4. 是否包含某插件策略

### 6.4 列表表格设计

当前表格列为：

| 列名 | 数据来源 | 展示逻辑 | 交互 |
| --- | --- | --- | --- |
| 名称 | `name` | 直接展示 | 无 |
| 域名 | `domains[]` | 多值换行 | 无 |
| 路径匹配规则 | `pathPredicate` | 显示 `匹配方式 ｜ 匹配值` | 无 |
| 模型匹配规则 | `modelPredicates[]` | 多值换行 | 无 |
| 服务 | `upstreams[] + fallbackConfig` | 单上游显示名称，多上游显示权重，存在降级时追加箭头和降级 Provider | 无 |
| 请求授权 | `authConfig.allowedConsumers[]` | 未开启认证、未授权任何人、Tag 列表三种状态 | Popover 查看完整消费者列表 |
| 操作 | 当前行对象 | `使用方法 / 策略 / 编辑 / 删除` | 多动作入口 |

#### 6.4.1 服务列

该列承担了“主上游 + 降级上游”的汇总表达：

1. 只有一个主上游时，仅显示 Provider 名称
2. 多个主上游时，显示 `provider: weight%`
3. 若开启 fallback 且存在降级上游，则额外显示箭头图标与降级 Provider 列表

因此此列本质是在列表视图中压缩呈现完整转发策略。

#### 6.4.2 请求授权列

授权列的状态分层比较清晰：

1. `authConfig` 不存在或 `enabled=false` 时显示 `未开启认证`
2. 已开启但 `allowedConsumers` 为空时显示 `未授权任何人访问`
3. 已开启且有消费者时显示最多 3 个 Tag，多余数量显示 `+N`

完整名单被收纳到 `Popover` 中。

这里要特别指出一个现状：前端允许“认证已开启但消费者列表为空”的配置存在，这是一种可保存但不完整的配置状态。

### 6.5 行展开区：策略配置清单

表格行支持展开。展开时会触发两层策略数据合并：

1. 通过内部资源名 `ai-route-${record.name}.internal` 拉取该路由挂载的插件实例
2. 根据当前语言加载 Wasm 插件元信息，再把 `title`、`description` 合并进来
3. 再额外合并从路由内建配置推导出的内置插件条目

最终只展示 `enabled=true` 的策略项，嵌套表格列为：

1. 策略配置
2. 策略描述

如果拉取失败，会用 `message.error` 提示并自动把当前展开项收起。

### 6.6 操作区设计

#### 6.6.1 使用方法

点击 `使用方法` 后会打开一个弹窗，弹窗内部展示一段 curl 示例：

1. 请求地址固定为 `http://<higress-gateway-ip>/v1/chat/completions`
2. 如果路由绑定了域名，则自动附带第一个域名作为 `Host` 请求头
3. 请求体内预留 `model` 和 `messages`

这说明当前“使用方法”弹窗只承担最低限度的调用示例，不自动填入：

1. 认证头
2. 请求令牌
3. 真实模型名
4. HTTPS 入口

#### 6.6.2 策略

点击 `策略` 会跳转到 `/ai/route/config?type=aiRoute&name=${routeName}`。当前 `config.tsx` 本身只是一个薄包装，实际渲染的是通用插件管理页 `PluginList`。

这意味着 AI 路由的策略配置页不是独立实现，而是复用了网关插件体系。

#### 6.6.3 编辑与删除

编辑打开右侧抽屉，删除打开确认框。删除确认弹窗只展示路由名，不展示 Provider、Consumer 或策略影响范围。

### 6.7 RouteForm 结构

RouteForm 是当前前端 AI 路由配置的核心编辑器。

#### 6.7.1 基础标识区

| 字段 | 必填 | 编辑态 | 说明 |
| --- | --- | --- | --- |
| 名称 | 是 | 禁止修改 | 仅允许小写字母、数字、`.`、`-`，且首尾不能是特殊字符 |
| 域名 | 否 | 可修改 | 支持多选，数据来自域名列表 |

域名选择器会显式过滤掉默认域名 `higress-default-domain`，因此用户只能为 AI 路由选择显式创建过的域名。

#### 6.7.2 路径匹配区

路径匹配区由三部分组成：

1. 匹配方式选择器
2. 匹配值输入框
3. 大小写忽略复选框

虽然底层类型 `MatchType` 支持 `EQUAL / PRE / REGULAR`，但当前 AI 路由路径匹配 UI 只提供 `PRE`，即前缀匹配。

提交前会把 `ignoreCase` 这种 UI 形态归一化为 `caseSensitive=false`。

#### 6.7.3 Header 与 Query 匹配区

这两块都复用了通用组件 `FactorGroup`。每一行都包含：

1. `key`
2. `matchType`
3. `matchValue`
4. 删除按钮

支持的匹配方式包括：

1. `PRE`
2. `EQUAL`
3. `REGULAR`

因此 AI 路由在 Header 和 Query 层面支持更灵活的条件表达，而路径匹配当前反而更受限。

#### 6.7.4 模型匹配规则区

模型匹配规则列表用于在命中 AI 路由之后继续按模型名做细分匹配。每条规则包含：

1. 固定键 `model`
2. 匹配方式，当前支持 `EQUAL` 和 `PRE`
3. 匹配值

这部分最终写入 `modelPredicates[]`。

#### 6.7.5 目标 AI 服务区

这是 RouteForm 的核心部分，对应 `upstreams[]`。

每个上游条目包含：

1. Provider 名称
2. 权重
3. 目标模型映射

##### Provider 选择

Provider 下拉来源于 `getLlmProviders()`，并做了“同一路由内不可重复选同一 Provider”的前端限制。

##### 权重

每个上游必须填写权重，且所有上游权重之和必须等于 100。

当前这块不是自动平分模式，而是手填模式。表单提交时会先做两层校验：

1. 至少存在一个上游
2. 所有上游权重总和必须为 100

##### 模型映射

模型映射输入区由 `ModelMappingEditor` 负责，提供两种编辑方式：

1. 直接输入字符串
2. 打开 Popover 做规则化编辑

映射规则支持：

1. 默认映射 `*`
2. 精确映射
3. 前缀映射

字符串格式采用 `key=value;key2=value2`，单独输入一个不带 `=` 的值时会被解释为默认映射。

#### 6.7.6 降级配置区

降级配置使用一个开关控制。开启后展示：

1. 需要降级的响应码列表，当前默认候选为 `4xx` 和 `5xx`
2. 降级服务，只允许选择单个 Provider
3. 降级目标模型映射

当前 UI 没有暴露“降级策略”选择，但提交时会把策略固定写死为 `SEQ`。

此外，底层接口 `fallbackConfig.upstreams` 是数组，但当前 UI 只允许配置一个降级 Provider。这说明接口结构比当前界面能力更宽。

#### 6.7.7 请求认证区

认证配置也由开关控制，但当前设计有两个明显约束：

1. 认证类型固定为 `key-auth`
2. `authType` 下拉存在但被禁用，文案明确说明当前只支持 Key Auth

认证开启后，用户可从消费者列表多选允许访问的消费者。

当前这块还有两个关键细节：

1. 允许用户开启认证但不选任何消费者
2. 消费者选择器旁边有刷新按钮，可重新拉取消费者列表

第 1 点导致“启用认证但实际上无人可访问”的半配置状态可以存在。

#### 6.7.8 附加注解区

附加注解通过 `KeyValueGroup` 以键值对表格形式维护，最终会收敛成 `customConfigs` 对象。

这一块的产品定位是“高级扩展配置”，并带有一个外部文档问号链接用于解释 Annotation 用法。

### 6.8 RouteForm 的依赖关系

RouteForm 依赖 3 个外部对象池：

| 依赖对象 | 来源接口 | 用途 | 刷新能力 |
| --- | --- | --- | --- |
| Domain | `getGatewayDomains` | 域名多选 | 有单独刷新按钮 |
| Provider | `getLlmProviders` | 主上游和降级上游 | 无表单内刷新按钮 |
| Consumer | `getConsumers` | 授权消费者多选 | 有单独刷新按钮 |

这意味着当前表单在“域名”和“消费者”上可自刷新，但“Provider”列表只能依赖首次加载结果。如果用户在另一个标签页新建 Provider，当前已打开的 RouteForm 无法无刷新感知它。

### 6.9 提交逻辑

Route 提交时，前端会进行以下归一化：

1. 路径、Header、Query 的大小写选项转换为 `caseSensitive`
2. `upstreams[].modelMapping` 字符串转换为对象
3. `modelPredicates` 只保留 `matchType` 和 `matchValue`
4. `authConfig_allowedConsumers` 强制转成数组
5. fallback 开启时构造 `fallbackConfig.upstreams[0]`
6. `customConfigs` 从键值数组转为对象

### 6.10 当前问题与优化建议

#### 现状问题

1. 路径匹配 UI 只支持前缀匹配，能力与类型定义不一致
2. 认证开启时不强制要求选择消费者
3. fallback 结构支持数组，但 UI 只支持一个降级 Provider
4. Provider 依赖列表缺少刷新入口
5. 删除前无影响面提示
6. 使用方法弹窗不包含认证与真实入口信息

#### 优化建议

1. 为路径匹配补充 `EQUAL / REGULAR`
2. 开启认证时至少要求选择一个消费者，或明确标注“启用后默认全拒绝”
3. 补充 Provider 列表刷新按钮
4. 将 fallback 策略显式暴露，避免固定写死为 `SEQ`
5. 提供引用追踪，明确显示路由依赖的 Provider 和 Consumer 是否仍然有效
6. 使用方法弹窗增加认证示例、域名解释和 HTTPS 示例

## 7. 消费者管理

### 7.1 页面定位

`/consumer` 是网关调用方主体管理页。它的核心任务是维护一个可被路由授权引用的调用方身份，并为该调用方配置可被网关识别的认证方式。

### 7.2 页面结构

页面由 4 个层级组成：

1. 顶部筛选与操作区
2. 主表格
3. 新建/编辑抽屉
4. 删除确认弹窗

与 Provider、AiRoute 页相比，Consumer 页多了一层更明确的筛选表单和分页区。

### 7.3 顶部筛选区

顶部是白底 inline 表单，包含：

1. 按消费者名称筛选
2. 按密钥关键字筛选
3. 重置按钮
4. 新建消费者按钮
5. 刷新按钮

其中 `密钥关键字` 的筛选逻辑不是只看某一个字段，而是把每条 credential 做 `JSON.stringify` 后执行全文包含匹配，因此它更像一个宽松全文检索。

### 7.4 列表表格设计

当前表格列为：

| 列名 | 数据来源 | 展示逻辑 | 交互 |
| --- | --- | --- | --- |
| 消费者名称 | `name` | 直接展示 | 无 |
| 认证方式 | `credentials[]` | 去重后按 credential 类型渲染 Tag | 无 |
| 操作 | 当前行对象 | `编辑 / 删除` | 打开抽屉或确认框 |

#### 7.4.1 认证方式列

认证方式列不会逐条展示 credential，而是先抽取所有唯一 credential `type`，再映射成 Tag。

当前启用中的 credential 类型只有：

1. `key-auth`

虽然 `OAuth2` 和 `JWT` 在类型定义里存在，但都被标记为 `enabled=false`，因此不会被当作正式可用认证能力。

### 7.5 分页模式

Consumer 列表与另外两个页面不同，开启了分页，并支持：

1. 切换页大小
2. 显示总数

这说明当前设计认为 Consumer 列表更可能规模化，而 Provider 和 AI Route 则仍被视为较小规模资源集合。

### 7.6 ConsumerForm 设计

抽屉宽度约 `660px`，用于创建与编辑 Consumer。

#### 7.6.1 基础字段

| 字段 | 必填 | 编辑态 | 说明 |
| --- | --- | --- | --- |
| 消费者名称 `name` | 是 | 禁止修改 | 最大长度 63 |

#### 7.6.2 认证方式 Tab 设计

表单使用 Tabs 管理认证方式，当前包含：

1. `Key Auth`
2. `OAuth2`
3. `JWT`

但当前只有 `Key Auth` 有真实表单内容，另外两个标签页仅显示占位文本，没有实际可配置字段。

这意味着当前 UI 的信息架构已经为多认证方式预留扩展位，但产品能力实际只落地了一种。

#### 7.6.3 Key Auth 配置区

Key Auth 采用一个 credential 对象加一个动态 `values[]` 数组的设计。

Key Auth 的交互包含：

1. 认证令牌列表，支持新增、删除
2. 单条随机生成 UUID
3. 令牌来源选择
4. 根据来源条件化展示 `Header 名称` 或 `参数名称`

##### 认证令牌列表

每个列表项都包含：

1. 一个输入框
2. 一个随机生成按钮
3. 一个删除按钮

这使得一个 Consumer 可一次性维护多个 token 值。

##### 令牌来源

当前支持 3 种来源：

1. `BEARER`，即 `Authorization: Bearer ${value}`
2. `HEADER`，即自定义 HTTP Header
3. `QUERY`，即查询参数

##### 条件字段

当来源为 `HEADER` 时，必须填写 Header 名称；当来源为 `QUERY` 时，必须填写参数名称；当来源为 `BEARER` 时，不展示额外 key 字段。

### 7.7 提交逻辑

ConsumerForm 的提交过程不是直接回传 Tabs 结构，而是做一次 credential 归一化：

1. 遍历所有 credential 类型定义
2. 只保留开启状态的 credential 类型
3. 将每个 credential 对象补上 `type`
4. 最终把 `credentials` 从字典结构转换为数组结构

这里有一个重要现状：

当前 `interfaces/consumer.ts` 中 `KeyAuthCredential` 定义更接近单值结构，但 UI 实际提交的是多值数组结构，说明类型定义和实际表单形态并不完全一致。

### 7.8 删除交互

Consumer 删除时会打开确认弹窗。与另外两个页面不同的是，该页面在删除成功后会明确提示 `删除成功`。

但当前删除前也不会提示：

1. 该 Consumer 被哪些 AI 路由授权引用
2. 删除后哪些路由会变成“无人授权”状态

### 7.9 当前问题与优化建议

#### 现状问题

1. UI 暴露了 OAuth2 和 JWT 标签，但实际上不可用
2. 类型定义与表单的多 token 结构存在偏差
3. 删除时没有引用关系提示
4. 列表页只显示认证方式，不显示来源或 token 数量
5. 密钥搜索使用全文 JSON 匹配，精度较粗

#### 优化建议

1. 若短期不支持 OAuth2 和 JWT，应隐藏对应 Tab，避免错误预期
2. 统一 `Consumer` 类型定义与真实提交结构
3. 列表页增加 token 数量和来源摘要
4. 删除前显示被哪些 AI 路由引用
5. 将关键字搜索拆成名称、来源、Header/Query 名称等结构化筛选

## 8. 跨页面人机交互与数据链路

### 8.1 用户操作主链路

当前模块形成的典型业务操作链路如下：

1. 先在 `AI 服务提供者管理` 中创建至少一个 Provider
2. 再在 `消费者管理` 中创建一个或多个 Consumer
3. 进入 `AI 路由管理` 创建新路由
4. 在 RouteForm 中绑定 Domain、配置 Path/Header/Query/Model 匹配
5. 选择一个或多个 Provider 作为主上游
6. 可选地配置 fallback Provider
7. 可选地开启认证并选择允许访问的 Consumer
8. 保存后，在列表页通过 `使用方法` 生成 curl 示例
9. 如需插件能力，再通过 `策略` 进入策略配置页

### 8.2 数据依赖顺序

从依赖角度看，页面之间的真实顺序是：

1. Domain 先于 AiRoute
2. Provider 先于 AiRoute
3. Consumer 先于开启认证的 AiRoute

如果缺少这些前置资源，AiRoute 虽然仍可能部分可建，但会处于残缺配置状态。

### 8.3 路由页与 Consumer 页的耦合点

AiRoute 和 Consumer 之间的耦合只通过 `allowedConsumers[]` 名称列表发生，没有更强的对象引用或反查能力。

这带来的结果是：

1. Consumer 被删除后，路由侧是否失效依赖后端处理
2. 前端列表页无法自然展示“某 Consumer 被几条路由使用”
3. 路由和消费者之间没有反向导航

### 8.4 路由页与 Provider 页的耦合点

AiRoute 的 `upstreams` 和 `fallbackConfig.upstreams` 都直接保存 Provider 名称。

这意味着：

1. Provider 名称实际上承担外键职责
2. Provider 被删除会直接影响路由转发能力
3. Provider 列表页若不显示引用关系，用户很难评估删除风险

## 9. 接口与数据模型梳理

### 9.1 Provider 接口

| 操作 | 方法 | 路径 |
| --- | --- | --- |
| 查询列表 | GET | `/v1/ai/providers` |
| 创建 | POST | `/v1/ai/providers` |
| 更新 | PUT | `/v1/ai/providers/{name}` |
| 删除 | DELETE | `/v1/ai/providers/{name}` |

### 9.2 AiRoute 接口

| 操作 | 方法 | 路径 |
| --- | --- | --- |
| 查询列表 | GET | `/v1/ai/routes` |
| 查询详情 | GET | `/v1/ai/routes/{name}` |
| 创建 | POST | `/v1/ai/routes` |
| 更新 | PUT | `/v1/ai/routes/{name}` |
| 删除 | DELETE | `/v1/ai/routes/{name}` |

### 9.3 Consumer 接口

| 操作 | 方法 | 路径 |
| --- | --- | --- |
| 查询列表 | GET | `/v1/consumers` |
| 创建 | POST | `/v1/consumers` |
| 更新 | PUT | `/v1/consumers/{name}` |
| 删除 | DELETE | `/v1/consumers/{name}` |

### 9.4 策略扩展接口

| 操作 | 方法 | 路径 | 用途 |
| --- | --- | --- | --- |
| 获取路由插件实例 | GET | `/v1/routes/{name}/plugin-instances` | 拉取某资源下的插件实例清单 |

AI 路由列表页在拉取策略时会把 `AiRoute.name` 转换为内部资源名 `ai-route-${name}.internal` 后再请求该接口。

## 10. 状态、异常与边界条件

### 10.1 空状态

三个页面都主要依赖 Ant Design Table 默认空态，没有针对业务域自定义的空态说明。当前缺少：

1. 首次引导
2. 前置资源缺失提示
3. “去创建 Provider / Consumer / Domain”的流程引导

### 10.2 加载状态

三页都能展示 `useRequest` 的 loading 态，但加载粒度较粗，主要是整表 loading 或刷新按钮动作，没有字段级 loading。

### 10.3 校验失败状态

当前前端已实现的关键校验包括：

1. Provider 名称格式
2. Provider 动态字段合法性
3. Route 至少一个上游
4. Route 上游权重总和必须为 100
5. Route fallback 开启后的响应码、降级 Provider、模型映射必填
6. Consumer 名称、token 来源与 token 值必填

### 10.4 允许存在但存在风险的状态

当前设计允许以下“技术上可保存、业务上有风险”的状态存在：

1. AI 路由开启认证但未授权任何消费者
2. Provider 被其他路由引用时仍可直接触发删除
3. Consumer 被路由引用时仍可直接触发删除
4. fallback 接口结构支持多个上游，但 UI 只允许一个，前后端能力不对齐
5. Consumer 表单暴露了尚未真正支持的 OAuth2 / JWT 标签页

### 10.5 错误反馈缺口

当前不少请求失败只做以下处理之一：

1. `console.log`
2. 关闭弹窗
3. 重置 loading
4. 刷新列表

缺少更结构化的错误反馈，例如：

1. 明确错误原因
2. 哪个字段导致失败
3. 是否为依赖关系阻塞
4. 是否建议用户跳转去补全前置资源

## 11. 现状总结

从当前实现看，前端已经具备一套可工作的 AI 网关基础管理面：

1. Provider 页面负责上游服务定义
2. AiRoute 页面负责路由编排、降级与授权
3. Consumer 页面负责认证主体维护

这三者已经形成闭环，且能够支撑一个基础可用的 AI 网关配置链路。

但当前实现更偏“工程配置台”，还不是一套成熟的“运维管理台”。主要原因在于：

1. 引用关系不可见
2. 成功与失败反馈不统一
3. 一些高风险状态可被保存
4. 若干 UI 能力与底层数据结构不完全对齐

## 12. 优化建议优先级

### 12.1 P0：一致性与数据安全

1. Provider、Consumer 删除前增加 AI 路由引用检查
2. AiRoute 开启认证时要求至少选择一个 Consumer，或明确表现为“默认拒绝全部”
3. 对 Provider、AiRoute、Consumer 的成功与失败反馈进行统一
4. 统一 Consumer 类型定义与表单提交结构

### 12.2 P1：可观测性与可理解性

1. 在 Provider 列表中显示被多少条 AI 路由引用
2. 在 Consumer 列表中显示被多少条 AI 路由授权引用
3. 在 AiRoute 列表中显示更明确的状态摘要，例如是否开启认证、是否配置 fallback、是否存在策略
4. 使用方法弹窗加入认证示例与 HTTPS 示例

### 12.3 P2：交互完备性

1. 补齐 Route 路径匹配的 `EQUAL / REGULAR`
2. 为 RouteForm 中的 Provider 列表增加刷新按钮
3. 隐藏尚未支持的 OAuth2 / JWT Tab，或真正实现其编辑能力
4. 将 fallback 策略与多 fallback upstream 能力显式化

## 13. 同文件内的实施落点建议

基于本文档的优化方向，推荐后续实现顺序如下：

1. 先做引用可见性和危险操作防护
2. 再做 AiRoute 表单校验与依赖刷新的一致性修复
3. 再做 Provider 和 Consumer 列表的信息补充
4. 最后再扩展多认证方式、fallback 能力和更完整的调用示例

推荐拆成 4 个实现批次：

| 批次 | 目标 | 涉及页面 |
| --- | --- | --- |
| Batch 1 | 删除前引用检查、引用数量展示 | Provider、Consumer、AiRoute |
| Batch 2 | 路由认证约束、Provider 刷新、反馈统一 | AiRoute、Provider、Consumer |
| Batch 3 | Provider/Consumer 列表增强与详情态 | Provider、Consumer |
| Batch 4 | 扩展能力补齐 | AiRoute、Consumer |

如果后续要进入编码阶段，建议优先以 `Batch 1 + Batch 2` 作为第一轮实施范围，因为这两部分最直接影响配置安全性和日常可用性。
