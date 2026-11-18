# AI DAW 音频插件注册表

AI DAW「下载管理器 → 可下载」里那份 **VST3 / CLAP 插件目录**的静态快照，来自开源社区
[Open Audio Registry](https://open-audio-stack.github.io/open-audio-stack-registry/)（Open Audio Stack）。

应用默认从这里读：

```
https://heshengtao.github.io/ai-daw-plugin-registry/plugin-registry.json
```

> 这不是「应用扩展」商店（那个是 `ai-daw-plugins`），也不是音色库索引
> （`ai-daw-soundfont-registry`）。这里只有**音频插件**（VST3 / CLAP）的下载元数据：
> 每个条目的作者、许可、平台归档、大小与 sha256。

## 它是怎么来的

`sync.mjs` 从上游拉一次完整 JSON 并原样落盘；`.github/workflows/sync.yml` 每周自动跑一次，
也可以在 Actions 页面手动触发。应用侧还会把这份 JSON 随包打一份兜底快照，所以即使这里暂时
不可达，商店也不会空。

## 用在哪

AI DAW 的 [manager.rs](https://github.com/heshengtao/ai-daw/blob/main/crates/daemon/src/manager.rs)
用 `REGISTRY_URL` 读它（6 小时缓存 → 用户配置的镜像 → 上次落盘 → 随包快照）。安装只认带
sha256 的归档；`installer` 类型（dmg / pkg / exe / msi / deb / rpm / AppImage）**从不自动执行**，
只提供「打开下载页」。

## 许可

本仓库只镜像上游元数据；各插件自身的许可见条目里的 `license` 字段。索引文件以 MIT 发布。
