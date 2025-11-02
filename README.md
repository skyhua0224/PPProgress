# ProjectPrinting Progress（公开看板）

面向外部访客的工程进度与周报展示站点。无需任何配置，直接访问线上地址即可浏览。

- 在线地址：<https://ppprogress.sky-hua.xyz>
- 数据更新：Dashboard 每日更新一次；周报每周一次

## 如何使用

打开在线地址后，你可以：

- 在顶部切换语言（中文 / English）
- 在“时间范围”选择近一周 / 近一月 / 近一年或按月查看
- 在“模块”筛选具体子模块的数据
- 在“周报列表”中选择中文或英文版本，点击查看详情
- 在周报详情右上角点击“原始文件”可在 GitHub 查看对应的 Markdown/JSON（位于本仓库的 `out/` 目录）

## 数据与新鲜度

- 数据来源：源自主仓库 ProjectPrinting 的提交与统计，汇总后产出到本仓库的 `out/` 目录
- 缓存策略：`out/*.json` 使用 `Cache-Control: no-store`，确保你总是看到最新数据
- 隐私：若某些仓库为私有或无法统计，页面会自动隐藏对应的 GitHub 统计卡片

## 目录速览

- `index.html`：看板页面（可直接在浏览器打开）
- `dashboard.js`：前端交互与图表逻辑
- `out/`：数据目录（index.json、weekly-*.json / weekly-*.md、account-stats.json、project-stats.json 等）

> 访客不需要关心数据如何产生，只需知道页面会从本仓库的 `out/` 目录读取数据文件。

## 本地离线浏览（可选）

如需在本地离线查看（例如网络受限场景），可以克隆本仓库后，用本地 HTTP 服务打开：

```bash
python3 -m http.server 8080
# 然后访问 http://localhost:8080
```

注意：直接双击 `index.html`（file://）时，浏览器会阻止脚本读取本地 JSON/Markdown，导致页面无数据显示。请使用上述 HTTP 服务方式打开。

## 反馈

欢迎通过 Issue 反馈问题或建议。
