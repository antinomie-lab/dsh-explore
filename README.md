# Deepseek Harness Explore

<p align="center">
  <a href="README.en.md">English</a> ·
  <a href="README.md">简体中文</a>
</p>

本仓库汇集了关于 **Cordis & Deepseek Harness** 的解读文章，以及未来会更新的 **DeepSeek Harness** 的相关实践探索。

Deepseek Harness 代表了一种最新的 harness 思想，通过具有时空独立性的插件树来解耦 agent harness 中的各个部分，我们认为这可能会成为未来 meta harness 的一个重要方向。

## 目录

| 文档 | 说明 |
| --- | --- |
| [passages/cordis-from-dsh.md](passages/cordis-from-dsh.md) | 考察 DeepSeek Harness 如何在生产中使用 Cordis：三段式分包约定、插件生命周期、基于 `cordis.yml` / patch 层叠 / preset 的声明式组合，以及 meta harness 视角。 |

文章为中文；章节与代码标识符保留英文原貌。

## 阅读站点

`site/` 是一个基于 Vite + Vue 的阅读站点，提供语法高亮的文章渲染。启动方式：

```bash
cd site && npm install && npm run dev
```

## 原始材料

- **论文**：*A Programming Paradigm for Spatiotemporal Composability*（Yifan Shi, Wei Zhang, Tianyi Cui；北京大学 & DeepSeek-AI）。88 页 PDF 位于 `.lody/attachments/00da1574-paper.pdf`，`paper.txt` 为其纯文本转换。
- **Cordis 源码**：`~/Code/cordis` @ `8cc9e33`（`cordis` 4.0.0-rc.8）。
- **DeepSeek Harness 源码**：`~/Code/deepseek-harness` @ `47f943859b`，Cordis 以 `@deepseek-ai/cordis` 4.0.1 的形式固定在 `vendor/` 下。

## 约定

文中所有代码引用均采用 `文件:行号` 并附原文，且已对照上述版本基线逐条核对。
