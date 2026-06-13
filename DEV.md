# 本地开发指南

## 安装依赖

```bash
pnpm install
pnpm build
```

## 本地全局安装（调试用）

```bash
npm link
```

创建符号链接指向本地目录，本地改动立即生效，无需重新安装。

## 本地全局安装（复制方式）

```bash
npm install -g .
```

复制文件到全局，本地改动后需要重新执行才会更新。

## 取消本地链接

```bash
npm unlink -g @hottaiger/specdrive
```

## 卸载

```bash
npm uninstall -g @hottaiger/specdrive
```

## 正式安装（未发布 npm 前）

```bash
npm install -g git+https://github.com/hottaiger/SpecDrive.git
```

指定 tag/分支：

```bash
npm install -g git+https://github.com/hottaiger/SpecDrive.git#v0.3.7
```

## GitNexus（代码智能索引）

```bash
npm install -g gitnexus         # 安装
gitnexus analyze                # 索引项目
npm uninstall -g gitnexus       # 卸载
```

## 常用开发命令

```bash
pnpm dev                        # TypeScript watch 模式
pnpm build                      # 编译
pnpm lint                       # ESLint 检查
pnpm format                     # Prettier 格式化
pnpm format:check               # 格式检查
pnpm test                       # 运行测试
pnpm test:coverage              # 测试 + 覆盖率
```

## 完整验证流程

```bash
pnpm build && pnpm lint && pnpm format:check && pnpm test
```
