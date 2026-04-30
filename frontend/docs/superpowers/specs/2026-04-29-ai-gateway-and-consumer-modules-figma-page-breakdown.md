# Higress Console AI 网关管理与消费者管理模块 Figma 页面拆解表

## 1. 文档用途

本文档用于把已确认的 3 个模块 UI 交互设计需求，拆解成可直接在 Figma 中建页、建 Frame、出状态稿的执行清单。

适用对象：

1. UI 设计师
2. 交互设计师
3. 负责搭建 Figma 文件结构的设计同学

## 2. 推荐 Figma 文件结构

建议将 Figma 文件按以下层级组织：

| Figma Page | 用途 | 说明 |
| --- | --- | --- |
| 00. Cover & Guide | 封面与设计说明 | 放置文档索引、页面关系图、基础说明 |
| 01. AI Provider | AI 服务提供者管理 | 放置列表页、抽屉、弹窗及动态表单分支 |
| 02. AI Route | AI 路由管理 | 放置列表页、展开区、抽屉、弹窗 |
| 03. Consumer | 消费者管理 | 放置列表页、分页、抽屉、标签页与弹窗 |
| 04. Global States | 通用状态 | 放置空状态、加载态、失败反馈态、删除确认态 |

如果团队习惯按业务模块拆 Figma 文件，也可以将 01、02、03 三页拆成三个独立文件，但页面命名建议保持一致。

## 3. 命名建议

### 3.1 Figma Page 命名

建议采用“序号 + 模块名”的方式，便于排序：

1. 01. AI Provider
2. 02. AI Route
3. 03. Consumer
4. 04. Global States

### 3.2 Frame 命名

建议采用“页面 - 场景 - 状态”的方式，例如：

1. Provider List - Default
2. Provider Drawer - Create - OpenAI Official
3. AI Route Drawer - Edit - Auth Enabled
4. Consumer Drawer - Create - KeyAuth Header

## 4. 页面拆解总览

| 模块 | 建议 Figma Page | 需要覆盖的页面类型 | 重点 |
| --- | --- | --- | --- |
| AI 服务提供者管理 | 01. AI Provider | 列表页、抽屉、说明弹窗、删除弹窗 | 动态表单分支较多 |
| AI 路由管理 | 02. AI Route | 列表页、展开区、抽屉、使用方法弹窗、删除弹窗 | 信息密度最高，状态最多 |
| 消费者管理 | 03. Consumer | 列表页、分页、抽屉、标签页、删除弹窗 | 认证方式与凭证来源切换 |
| 通用状态 | 04. Global States | 空态、加载态、失败反馈态、删除确认态 | 统一视觉语言 |

## 5. 01. AI Provider 页面拆解表

### 5.1 页面级 Frame 清单

| Frame 名称 | 页面类型 | 使用场景 | 必出内容 |
| --- | --- | --- | --- |
| Provider List - Default | 列表页 | 默认浏览 | 顶部操作条、表格、操作列 |
| Provider List - Empty | 列表页 | 无数据时 | 空状态、创建入口 |
| Provider List - Credential Hidden | 列表页 | 凭证默认显示方式 | 凭证隐藏样式 |
| Provider List - Credential Visible | 列表页 | 展示明文凭证时 | 单条显示后的样式 |
| Provider Drawer - Create - Default | 抽屉 | 创建入口默认态 | 基础信息、凭证区、连接配置、高级配置 |
| Provider Drawer - Edit - Default | 抽屉 | 编辑已有提供者 | 只读字段、已填充值 |
| Provider Drawer - OpenAI Official | 抽屉分支 | OpenAI 官方服务 | 官方服务相关字段组合 |
| Provider Drawer - OpenAI Custom URL | 抽屉分支 | OpenAI 自定义地址 | 地址输入型布局 |
| Provider Drawer - OpenAI Service Select | 抽屉分支 | OpenAI 选择服务 | 服务选择型布局 |
| Provider Drawer - Qwen | 抽屉分支 | Qwen 配置 | 开关、文件 ID、域名切换 |
| Provider Drawer - Azure | 抽屉分支 | Azure 配置 | 单核心字段布局 |
| Provider Drawer - Advanced Collapsed | 抽屉分支 | 高级配置关闭 | 令牌降级关闭状态 |
| Provider Drawer - Advanced Expanded | 抽屉分支 | 高级配置开启 | 完整高级参数区 |
| Provider Modal - Secret Help | 弹窗 | 查看 Secret 说明 | 说明文案、示例格式 |
| Provider Modal - Delete Confirm | 弹窗 | 删除确认 | 名称确认、危险提示、操作按钮 |

### 5.2 抽屉内部区块拆解

| 区块名称 | 是否独立成局部组件稿 | 设计重点 |
| --- | --- | --- |
| 基础信息区 | 是 | 标题、字段布局、编辑态只读样式 |
| 凭证配置区 | 是 | 动态增删、多条并列、说明入口 |
| 连接配置区 | 是 | 按供应商类型切换字段布局 |
| 高级配置区 | 是 | 开关控制展开、连续参数编组 |

### 5.3 需要重点覆盖的状态

| 状态 | 说明 |
| --- | --- |
| 创建态 | 默认空白表单 |
| 编辑态 | 部分字段锁定 |
| 凭证多条态 | 多条凭证同时展示 |
| 表单校验态 | 字段错误提示占位 |
| 长内容态 | 服务端点多值换行 |

## 6. 02. AI Route 页面拆解表

### 6.1 页面级 Frame 清单

| Frame 名称 | 页面类型 | 使用场景 | 必出内容 |
| --- | --- | --- | --- |
| AI Route List - Default | 列表页 | 默认浏览 | 搜索框、创建按钮、刷新按钮、主表格 |
| AI Route List - Search Result | 列表页 | 搜索结果 | 关键字命中后的列表表现 |
| AI Route List - Expanded | 列表页 | 展开查看策略 | 主表格 + 行展开区 |
| AI Route List - Auth Off | 列表页状态 | 未开启认证 | 授权列默认状态 |
| AI Route List - Auth On Empty | 列表页状态 | 开启认证但未选择消费者 | 特殊状态摘要 |
| AI Route List - Auth On Filled | 列表页状态 | 已授权消费者 | Tag 摘要 + 悬浮查看入口 |
| AI Route Modal - Usage | 弹窗 | 查看调用方式 | 请求入口、域名提示、调用示例 |
| AI Route Drawer - Create - Default | 抽屉 | 新建路由默认态 | 完整分段表单 |
| AI Route Drawer - Edit - Default | 抽屉 | 编辑已有路由 | 已填内容、名称只读 |
| AI Route Drawer - Upstream Single | 抽屉分支 | 单个目标服务 | 单条服务配置布局 |
| AI Route Drawer - Upstream Multiple | 抽屉分支 | 多个目标服务 | 多条服务并列布局 |
| AI Route Drawer - Fallback Off | 抽屉分支 | 降级关闭 | 仅显示开关 |
| AI Route Drawer - Fallback On | 抽屉分支 | 降级开启 | 响应码、降级服务、模型映射 |
| AI Route Drawer - Auth Off | 抽屉分支 | 认证关闭 | 仅显示开关 |
| AI Route Drawer - Auth On | 抽屉分支 | 认证开启 | 认证类型、消费者选择区 |
| AI Route Drawer - Annotation Editing | 抽屉分支 | 编辑附加注解 | 键值对列表布局 |
| AI Route Modal - Delete Confirm | 弹窗 | 删除确认 | 名称确认、危险提示、操作按钮 |

### 6.2 抽屉内部区块拆解

| 区块名称 | 是否独立成局部组件稿 | 设计重点 |
| --- | --- | --- |
| 基础标识区 | 是 | 名称与域名选择布局 |
| 路径匹配区 | 是 | 匹配方式、匹配值、大小写开关 |
| Header 匹配区 | 是 | 动态规则列表 |
| Query 匹配区 | 是 | 动态规则列表 |
| 模型匹配区 | 是 | 简洁规则列表 |
| 目标 AI 服务区 | 是 | 多条服务配置、权重、映射入口 |
| 降级配置区 | 是 | 开关控制展开区 |
| 请求认证区 | 是 | 开关、认证类型、消费者选择 |
| 附加注解区 | 是 | 键值对布局、帮助入口 |

### 6.3 需要重点覆盖的状态

| 状态 | 说明 |
| --- | --- |
| 搜索态 | 命中结果列表 |
| 展开态 | 行展开后的策略信息 |
| 单上游态 | 服务列为单值表达 |
| 多上游态 | 服务列需要展示名称与权重 |
| 降级开启态 | 主服务与降级服务同时出现 |
| 认证关闭态 | 授权列为未开启认证 |
| 认证开启空名单态 | 授权列显示无人访问 |
| 认证开启已选态 | 授权列显示消费者摘要 |
| 长表单滚动态 | 抽屉信息很多，需要考虑分段和滚动体验 |

## 7. 03. Consumer 页面拆解表

### 7.1 页面级 Frame 清单

| Frame 名称 | 页面类型 | 使用场景 | 必出内容 |
| --- | --- | --- | --- |
| Consumer List - Default | 列表页 | 默认浏览 | 筛选区、表格、分页 |
| Consumer List - Filtered | 列表页 | 筛选结果 | 已筛选状态表现 |
| Consumer List - Empty | 列表页 | 无数据时 | 空状态、新建入口 |
| Consumer List - Pagination | 列表页状态 | 多页数据 | 页码、每页条数、总数 |
| Consumer Drawer - Create - Default | 抽屉 | 新建消费者 | 名称、认证方式标签页 |
| Consumer Drawer - Edit - Default | 抽屉 | 编辑已有消费者 | 名称只读、已有配置 |
| Consumer Drawer - KeyAuth Bearer | 抽屉分支 | Key Auth + Bearer | 凭证列表、来源选择 |
| Consumer Drawer - KeyAuth Header | 抽屉分支 | Key Auth + Header | Header 名称字段出现 |
| Consumer Drawer - KeyAuth Query | 抽屉分支 | Key Auth + Query | 参数名称字段出现 |
| Consumer Drawer - OAuth2 Placeholder | 抽屉分支 | OAuth2 标签页 | 占位内容 |
| Consumer Drawer - JWT Placeholder | 抽屉分支 | JWT 标签页 | 占位内容 |
| Consumer Modal - Delete Confirm | 弹窗 | 删除确认 | 名称确认、危险提示、操作按钮 |

### 7.2 抽屉内部区块拆解

| 区块名称 | 是否独立成局部组件稿 | 设计重点 |
| --- | --- | --- |
| 基础信息区 | 是 | 名称输入、编辑态只读 |
| 认证方式标签区 | 是 | 标签切换、激活态、占位态 |
| Key Auth 配置区 | 是 | 动态凭证列表、来源切换、附加字段变化 |

### 7.3 需要重点覆盖的状态

| 状态 | 说明 |
| --- | --- |
| 筛选默认态 | 未筛选时的标准布局 |
| 筛选结果态 | 条件生效后的列表状态 |
| 分页态 | 多页数据浏览 |
| Bearer 态 | 无附加名称字段 |
| Header 态 | 展示 Header 名称字段 |
| Query 态 | 展示参数名称字段 |
| 多凭证态 | 多条 token 同时展示 |
| 标签页占位态 | OAuth2 与 JWT 的占位样式 |

## 8. 04. Global States 页面拆解表

### 8.1 建议统一输出的通用状态

| Frame 名称 | 使用范围 | 必出内容 |
| --- | --- | --- |
| Global - Table Loading | 三个模块列表页 | 表格加载中 |
| Global - Table Empty | 三个模块列表页 | 空状态说明与主行动作 |
| Global - Form Validation | 三个模块抽屉 | 错误提示、字段错误态 |
| Global - Request Failed | 三个模块 | 失败反馈样式 |
| Global - Delete Confirm | 三个模块 | 危险操作弹窗统一样式 |

### 8.2 推荐作为共享组件统一设计的内容

| 组件 | 使用位置 |
| --- | --- |
| 页面顶部操作条 | 三个模块列表页 |
| 行内操作区 | 三个模块表格 |
| 右侧抽屉头部 | 三个模块抽屉 |
| 删除确认弹窗 | 三个模块 |
| 标签集合样式 | AI 路由授权摘要、消费者认证方式 |
| 键值对编辑样式 | AI 路由附加注解 |
| 动态列表编辑样式 | 提供者凭证、路由匹配规则、消费者 token |

## 9. 建稿顺序建议

为了让设计推进更顺，建议按以下顺序建稿：

1. 先完成 3 个模块列表页基础版式
2. 再完成 3 个模块抽屉的统一骨架
3. 再补 AI 服务提供者的动态表单分支
4. 再补 AI 路由的复杂表单分段与展开态
5. 最后补消费者的标签页分支与通用状态页

## 10. 交付检查清单

设计交付前可按以下清单核对：

1. 3 个模块是否都包含列表页、抽屉、删除确认弹窗
2. AI 服务提供者是否覆盖 OpenAI、Qwen、Azure 及高级配置展开态
3. AI 路由是否覆盖搜索态、展开态、单上游、多上游、降级开启、认证开启等关键状态
4. 消费者是否覆盖 Bearer、Header、Query 三种凭证来源状态
5. 是否单独输出了空态、加载态、失败反馈态等通用状态
6. Frame 命名是否能让研发和产品直接看懂场景

本文档可直接作为 Figma 建页与状态稿拆解依据使用。