# Deepseek Harness Explore

<p align="center">
  <a href="README.en.md">English</a> ·
  <a href="README.md">简体中文</a>
</p>

This repository collects essays on **Cordis & DeepSeek Harness**, together with forthcoming practical explorations of DeepSeek Harness.

DeepSeek Harness represents a recent approach to harness design: it decouples the constituent parts of an agent harness through a plugin tree with spatiotemporal independence. We believe this may become an important direction for meta harnesses.

## Contents

| Document | Description |
| --- | --- |
| [passages/cordis-from-dsh.md](passages/cordis-from-dsh.md) | An examination of how DeepSeek Harness applies Cordis in production: the three-package capability convention, the plugin lifecycle, declarative composition via `cordis.yml` / patch layering / presets, and the meta-harness perspective. |

The essays are written in Chinese; section and code identifiers remain in their original English form.

## Reading Site

`site/` contains a Vite + Vue application that renders the essays with syntax highlighting. To run it:

```bash
cd site && npm install && npm run dev
```

## Source Materials

- **Paper**: *A Programming Paradigm for Spatiotemporal Composability* (Yifan Shi, Wei Zhang, Tianyi Cui; Peking University & DeepSeek-AI). The 88-page PDF is available at `.lody/attachments/00da1574-paper.pdf`; `paper.txt` is its plain-text conversion.
- **Cordis source**: `~/Code/cordis` @ `8cc9e33` (`cordis` 4.0.0-rc.8).
- **DeepSeek Harness source**: `~/Code/deepseek-harness` @ `47f943859b`, with Cordis vendored as `@deepseek-ai/cordis` 4.0.1 under `vendor/`.

## Conventions

All code citations in these documents use `file:line` references with verbatim excerpts, verified against the baselines above.
