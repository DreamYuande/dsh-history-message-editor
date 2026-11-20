# 历史消息编辑 1.1.1

在原会话里编辑历史用户消息，并从修改处重新生成。会话 ID、侧栏条目和工作目录继续沿用。

适配 Windows DSH Next **2.0.24-next**，内置 Harness **0.2.2-rc.5**。

![使用测试会话演示编辑区](https://raw.githubusercontent.com/DreamYuande/dsh-history-message-editor/v1.1.1/assets/editor-preview.png)

鼠标移到已发送的消息上，点击复制按钮旁的线条铅笔。修改正文后点击「发送」。本次操作将覆盖这条消息及之后的聊天记录，继续使用同一个会话、侧栏条目和工作目录。已执行过的工具操作仍可能影响工作区。取消编辑可点击「取消」或按 Esc。

## 安装与升级

在 DSH 插件管理器选择添加插件，输入 `dsh-history-message-editor@1.1.1`。也可以用 [GitHub Release 安装包](https://github.com/DreamYuande/dsh-history-message-editor/releases/download/v1.1.1/dsh-history-message-editor-1.1.1.tgz) 的链接安装，或下载后添加本地 `.tgz`。如果管理器提示已安装，可在插件详情里卸载旧版后更新。安装完成后按桌面提示重载。

```powershell
dsh plugin --profile desktop add dsh-history-message-editor@1.1.1
dsh plugin --profile web add dsh-history-message-editor@1.1.1
dsh plugin --profile desktop remove dsh-history-message-editor
```

## 历史与附件

- 原始事件作为底层日志留存。所覆盖的内容退出模型上下文，并在插件启用时退出主聊天视图。停用插件会移除聊天过滤，底层事件仍在，所覆盖的内容仍不进入新请求的模型上下文。
- DSH 已压缩、已经覆盖、正在生成或仍有排队输入的历史会暂缓或拒绝提交。编辑期间若有其它操作改变会话，请重新打开编辑器。传输中断后请先检查聊天内容。
- 图片和文件复用当时保存下来的附件引用。附件不可用或当前模型不支持图片时，提交会停止。
- 已有 1.0.0 生成的分支可以继续在 DSH 中打开。升级无需迁移会话。

## 开发

宿主注册 DSH Connection 的已认证所有者路由，在 Agent 的维护阶段调用 DSH 的历史替换和原生发送。客户端使用消息节点标记挂载编辑和聊天过滤。无运行时 npm 依赖。

```powershell
node .\build.mjs
node --test
pnpm pack
```

参考 [DSH Next 版本说明](https://github.com/anywhere-labs/dsh-desktop/releases/tag/v2.0.24-next)、[Harness Session](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.5/docs/subsystems/session.md) 和 [dsh-rewind 的原会话回退思路](https://github.com/SiriLee/dsh-rewind)。

## English

Edit a previous user message and regenerate its reply in the same DSH session. The editor reuses stored image and file references. Sending an edit replaces that message and later entries in the active model context and main chat view. The underlying event log keeps the original records. The workspace directory and existing tool side effects are retained.

Tested with DSH Next 2.0.24-next on Windows (Harness 0.2.2-rc.5). Install `dsh-history-message-editor@1.1.1` in the DSH plugin manager or use the prebuilt tarball from [GitHub Releases](https://github.com/DreamYuande/dsh-history-message-editor/releases/tag/v1.1.1).
