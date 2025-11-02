// ProjectPrinting Weekly Dashboard
// 现代化、交互式的周报数据可视化系统
// ========================================

// 全局状态
let currentLang = 'zh' // 默认中文
let allReports = []
let githubData = null
const LIVE = { account: null, project: null }

const STATE = {
  reports: [],
  filters: {
    lang: 'all',
    search: '',
  },
  currentReport: null,
  charts: {},
  view: {
    range: '1m', // 1w | 1m | 1y | month
    month: null, // 'YYYY-MM'
    module: 'all', // 'all' or module name
    commitsShown: 20,
    reportsShown: 6, // 默认显示6个周报
  },
}

// 仓库信息
// - REPO_*：主工程仓库（用于 GitHub API 获取提交等真实统计，不变）
// - PROGRESS_*：进度看板仓库（本仓库），用于构造“原始文件”链接到 out/ 下的周报文件
const REPO_OWNER = 'skyhua0224'
const REPO_NAME = 'ProjectPrinting'
const REPO_PATH_PREFIX = 'analysis/reports'
const PROGRESS_REPO_OWNER = 'skyhua0224'
const PROGRESS_REPO_NAME = 'PPProgress'
const PROGRESS_REPO_BRANCH = 'main'

// ==================== 国际化配置 ====================
const i18n = {
  zh: {
    allReports: '全部周报',
    searchPlaceholder: '搜索周报...',
    loading: '加载中...',
    noReports: '暂无周报数据',
    reportCount: '共 {count} 份周报',
    rawFile: '原始文件',
    close: '关闭',
    // 指标相关
    keyMetrics: '关键指标',
    controllers: '控制器',
    endpoints: '端点注解',
    scheduledJobs: '定时任务',
    domainEnums: '领域枚举',
    orderStatus: '订单状态',
    fulfillmentType: '履约类型',
    printJobStatus: '打印任务状态',
    thresholds: '运行阈值',
    qrTimeout: '二维码取件超时',
    pinTimeout: 'PIN码取件超时',
    queueTimeout: '排队取件超时',
    buildCaps: '构建/运行能力',
    mysqlVersion: 'MySQL 版本',
    redis: 'Redis/Redisson',
    liquibase: 'Liquibase',
    actuator: 'Actuator',
    yes: '是',
    no: '否',
    minutes: '分钟',
    hours: '小时',
    // 进展相关
    devProgress: '开发进展',
    commits: '提交',
    files: '文件',
    added: '新增',
    removed: '删除',
    commitTimeline: '提交时间线',
    directoryHeat: '目录热力',
    // 图表
    moduleComparison: '模块对比',
    codeChanges: '代码变更',
    dataVisualization: '数据可视化',
  },
  en: {
    allReports: 'All Reports',
    searchPlaceholder: 'Search reports...',
    loading: 'Loading...',
    noReports: 'No reports available',
    reportCount: '{count} reports',
    rawFile: 'Raw File',
    close: 'Close',
    // Metrics
    keyMetrics: 'Key Metrics',
    controllers: 'Controllers',
    endpoints: 'Endpoints',
    scheduledJobs: 'Scheduled Jobs',
    domainEnums: 'Domain Enums',
    orderStatus: 'OrderStatus',
    fulfillmentType: 'FulfillmentType',
    printJobStatus: 'PrintJobStatus',
    thresholds: 'Operational Thresholds',
    qrTimeout: 'QR Pickup Timeout',
    pinTimeout: 'PIN Pickup Timeout',
    queueTimeout: 'Queue Pickup Timeout',
    buildCaps: 'Build/Runtime Capabilities',
    mysqlVersion: 'MySQL Version',
    redis: 'Redis/Redisson',
    liquibase: 'Liquibase',
    actuator: 'Actuator',
    yes: 'Yes',
    no: 'No',
    minutes: 'min',
    hours: 'h',
    // Progress
    devProgress: 'Development Progress',
    commits: 'Commits',
    files: 'Files',
    added: 'Added',
    removed: 'Removed',
    commitTimeline: 'Commit Timeline',
    directoryHeat: 'Directory Heat',
    // Charts
    moduleComparison: 'Module Comparison',
    codeChanges: 'Code Changes',
    dataVisualization: 'Data Visualization',
  },
}

const t = (key) => i18n[currentLang][key] || key

// ==================== 工具函数 ====================
const escapeHtml = (str) => {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

const formatDate = (isoString) => {
  if (isoString === undefined || isoString === null) return ''
  const date = parseDateSafe(isoString)
  if (!date) return ''
  return currentLang === 'zh'
    ? date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
}

const formatRelativeTime = (isoString) => {
  if (isoString === undefined || isoString === null) return ''
  const date = parseDateSafe(isoString)
  if (!date) return ''
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (currentLang === 'zh') {
    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return `${seconds}秒前`
  } else {
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return `${seconds}s ago`
  }
}

// 兼容 Safari 的安全日期解析（支持数值时间戳、RFC3339、"YYYY-MM-DD HH:mm:ss +0800" 等）
function parseDateSafe(value) {
  try {
    if (typeof value === 'number') {
      const d = new Date(value)
      return isNaN(d.getTime()) ? null : d
    }
    let s = String(value)
    // 先尝试直接解析
    let d = new Date(s)
    if (!isNaN(d.getTime())) return d
    // 将空格替换为 T，并将 +0800 -> +08:00（RFC3339）
    s = s.replace(' ', 'T').replace(/([+-]\d{2})(\d{2})$/, '$1:$2')
    d = new Date(s)
    if (!isNaN(d.getTime())) return d
    // 去掉时区部分，按本地时间解析日期部分
    const noTZ = s.replace(/\s*[+-]\d{2}:?\d{2}$/, '')
    d = new Date(noTZ)
    return isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
  // 如果通过 file:// 协议直接打开，浏览器会阻止 fetch 读取本地 JSON/MD，给出显式提示
  if (location.protocol === 'file:') {
    showFileProtocolWarning()
  }

  initializeEventListeners()
  // 同步默认视图到下拉
  const rangeSel = document.getElementById('rangeSelect')
  if (rangeSel) rangeSel.value = STATE.view.range
  loadReportsIndex().then(() => {
    tryOpenReportFromQuery()
  })
  fetchGitHubData()
  // 额外尝试加载本地预计算的真实数据（与 fetch 并行）
  loadLiveStats()
})

function showFileProtocolWarning() {
  try {
    const main = document.querySelector('main') || document.body
    const div = document.createElement('div')
    div.innerHTML = `
      <div class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
        <div class="flex items-start gap-2">
          <i class="ri-alert-line text-xl mt-0.5"></i>
          <div class="text-sm leading-6">
            <div class="font-medium">当前通过文件协议打开（file://）</div>
            <div>浏览器将阻止脚本读取本地 JSON/Markdown，导致周报与图表无法显示。请使用本地 HTTP 服务打开本页：</div>
            <pre class="bg-white border border-yellow-200 rounded p-2 mt-2 overflow-x-auto"><code>python3 -m http.server 8080
# 然后在浏览器访问：http://localhost:8080/</code></pre>
          </div>
        </div>
      </div>
    `
    main.insertAdjacentElement('afterbegin', div.firstElementChild)
  } catch (_) {
    // 忽略非关键错误
  }
}

function initializeEventListeners() {
  document.getElementById('langFilter').addEventListener('change', (e) => {
    const newLang = e.target.value
    // 只更新UI语言,不改变筛选逻辑
    if (newLang === 'zh' || newLang === 'en') {
      currentLang = newLang
      applyLanguageUI()
      // 重绘图表以更新标签语言
      updateDashboardByView()
    }
    // 不再重新渲染列表,列表始终显示所有语言版本
  })
  const rangeSel = document.getElementById('rangeSelect')
  if (rangeSel) {
    rangeSel.addEventListener('change', (e) => {
      STATE.view.range = e.target.value
      if (STATE.view.range !== 'month') STATE.view.month = null
      // 控制月份选择器显示
      const monthWrapper = document.getElementById('monthPickerWrapper')
      if (monthWrapper) {
        monthWrapper.style.display =
          STATE.view.range === 'month' ? 'flex' : 'none'
      }
      updateDashboardByView()
    })
  }
  const monthPicker = document.getElementById('monthPicker')
  if (monthPicker) {
    monthPicker.addEventListener('change', (e) => {
      STATE.view.month = e.target.value
      if (e.target.value) {
        STATE.view.range = 'month'
        rangeSel.value = 'month'
      }
      updateDashboardByView()
    })
  }
  const modSel = document.getElementById('moduleSelect')
  if (modSel) {
    modSel.addEventListener('change', (e) => {
      STATE.view.module = e.target.value
      updateDashboardByView()
    })
  }
  document.getElementById('search').addEventListener('input', (e) => {
    STATE.filters.search = e.target.value.toLowerCase()
    renderReportsList()
  })
  document.getElementById('closeBtn').addEventListener('click', closeModal)
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal()
  })
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'Escape' &&
      !document.getElementById('modal').classList.contains('hidden')
    ) {
      closeModal()
    }
  })
}

// ==================== GitHub 数据集成 ====================
async function fetchGitHubData() {
  // 获取项目真实统计数据
  await fetchProjectStats()
}

// ==================== 获取项目真实统计数据 ====================
async function fetchProjectStats() {
  try {
    // 优先尝试加载 LIVE 数据（即使 loadLiveStats 还未完成）
    await ensureLiveLoaded()

    if (LIVE.account || LIVE.project) {
      // 账号级：年提交/周提交、热力图
      if (LIVE.account) {
        document.getElementById('yearCommits').textContent = formatNumber(
          LIVE.account.yearCommits || 0,
        )
        document.getElementById('weekCommits').textContent = formatNumber(
          LIVE.account.weekCommits || 0,
        )
        if (LIVE.account.heatmap)
          renderContributionHeatmapFromMap(LIVE.account.heatmap)
      }
      // 项目级：行数（按所选范围的新增行数）、提交趋势、模块分布、最近提交
      if (LIVE.project) {
        const modSel = document.getElementById('moduleSelect')
        if (modSel && Array.isArray(LIVE.project.modulesAllowed)) {
          modSel.innerHTML =
            '<option value="all">全部</option>' +
            LIVE.project.modulesAllowed
              .map((n) => `<option value="${n}">${n}</option>`)
              .join('')
        }
        ensureMonthOptions(LIVE.project)
        updateDashboardByView()
        return
      }
      // 如果只有账号数据没有项目数据，仍可显示热力图与提交概览
      return
    }

    // 若无 LIVE，回退到最新周报 JSON（若不存在则仅隐藏数据区，不影响周报列表区）
    // 标准化为只从 out/ 读取
    const indexResponse = await fetch('./out/index.json', { cache: 'no-cache' })
    if (!indexResponse.ok) {
      hideAllDataSections()
      return
    }
    const indexData = await indexResponse.json()
    const reports = indexData.items || []
    if (reports.length === 0) {
      hideAllDataSections()
      return
    }
    const latestReport = reports.find((r) => r.lang === 'zh') || reports[0]
    const jsonFile = latestReport.file.replace('.md', '.json')
    const reportResponse = await fetch(`./out/${encodeURI(jsonFile)}`, {
      cache: 'no-cache',
    })
    if (!reportResponse.ok) {
      hideAllDataSections()
      return
    }
    const reportData = await reportResponse.json()
    const progress = reportData.progress || {}
    const totals = progress.totals || {}
    const modules = progress.modules || []
    const weekCommits = totals.commits || 0
    const totalLines = totals.added || 0
    const activeModules = modules.length
    const yearCommits = weekCommits * 10
    document.getElementById('yearCommits').textContent =
      formatNumber(yearCommits)
    document.getElementById('weekCommits').textContent =
      formatNumber(weekCommits)
    document.getElementById('totalLines').textContent = formatNumber(totalLines)
    document.getElementById('activeModules').textContent = activeModules
    renderContributionHeatmap(modules)
    renderCommitTrendChart(modules)
    renderModuleLinesDistFromModules(modules)
    renderRecentCommits(modules)
  } catch (error) {
    console.error('Failed to fetch project stats:', error)
    hideAllDataSections()
  }
}

// 明确加载 LIVE JSON（account-stats.json / project-stats.json）
async function ensureLiveLoaded() {
  if (!LIVE.account) {
    try {
      const acc = await fetch('./out/account-stats.json', { cache: 'no-cache' })
      if (acc.ok) LIVE.account = await acc.json()
    } catch {}
  }
  if (!LIVE.project) {
    try {
      const proj = await fetch('./out/project-stats.json', {
        cache: 'no-cache',
      })
      if (proj.ok) LIVE.project = await proj.json()
    } catch {}
  }
}

function pickTotalsByView(project) {
  const view = STATE.view
  if (!project) return { added: 0, byModule: {}, activeModules: 0 }
  if (view.range === '1w') return project.weekTotals || {}
  if (view.range === '1m')
    return project.monthTotals || project.weekTotals || {}
  if (view.range === '1y')
    return project.yearTotals || project.monthTotals || {}
  if (view.range === 'month' && view.month && Array.isArray(project.months)) {
    const m = project.months.find((x) => x.month === view.month)
    if (m) return { ...m.totals, byModule: m.byModule }
  }
  return project.monthTotals || {}
}

function filterByModule(byModule, moduleName) {
  if (!byModule) return {}
  if (!moduleName || moduleName === 'all') return byModule
  const rec = byModule[moduleName] || { added: 0, removed: 0, commits: 0 }
  return { [moduleName]: rec }
}

function updateDashboardByView() {
  if (!LIVE.project) return
  // 语言切换或范围切换后，尽量补齐一年期的提交（分页拉取）
  ensureRecentCommitsAugmented().catch((e) =>
    console.warn('[augment] fetch skipped:', e),
  )
  const totals = pickTotalsByView(LIVE.project)
  const byModule = filterByModule(totals.byModule || {}, STATE.view.module)

  console.log('[DEBUG] updateDashboardByView:', {
    range: STATE.view.range,
    module: STATE.view.module,
    totals,
    byModule,
    modulesAllowed: LIVE.project.modulesAllowed,
  })

  // 确保模块下拉包含所有出现过的模块（allowed ∪ byModule.keys ∪ months.byModule.keys）
  try {
    const allNames = computeAllModuleNames(LIVE.project)
    ensureModuleSelectOptions(allNames)
  } catch {}

  // 顶部：本期代码变更数（遵循模块筛选）
  let added = totals.added || 0
  if (STATE.view.module && STATE.view.module !== 'all') {
    const rec = (totals.byModule || {})[STATE.view.module]
    added = rec ? Number(rec.added || 0) : 0
  }
  document.getElementById('totalLines').textContent = formatNumber(added)
  // 顶部：活跃模块（允许列表长度）
  const activeModules = Array.isArray(LIVE.project.modulesAllowed)
    ? LIVE.project.modulesAllowed.filter((n) => n !== 'root').length
    : totals.activeModules || 0
  document.getElementById('activeModules').textContent = activeModules

  // 顶部：本期提交数 随时间范围和模块组合筛选
  try {
    const mod = STATE.view.module
    const range = STATE.view.range

    // 顶部“本周提交”：只随模块切换而变，不随时间范围切换
    let periodCommits = 0
    const weekTotals = LIVE.project?.weekTotals || {}
    if (mod && mod !== 'all') {
      periodCommits = weekTotals.byModule?.[mod]?.commits || 0
    } else {
      periodCommits = weekTotals.commits || 0
    }

    // 计算年度提交数：优先使用项目 yearTotals（本地 git 统计更全面），再回退到账号年提交
    let yearCommits = 0
    if (mod && mod !== 'all') {
      yearCommits = LIVE.project?.yearTotals?.byModule?.[mod]?.commits || 0
    } else {
      yearCommits =
        (LIVE.project &&
          LIVE.project.yearTotals &&
          LIVE.project.yearTotals.commits) ||
        (LIVE.account ? LIVE.account.yearCommits || 0 : 0)
    }

    // 更新显示
    document.getElementById('weekCommits').textContent =
      formatNumber(periodCommits)
    document.getElementById('yearCommits').textContent =
      formatNumber(yearCommits)

    // 更新标签
    const wkLabel = document.querySelector('[data-label="weekCommits"]')
    const yrLabel = document.querySelector('[data-label="yearCommits"]')
    if (wkLabel) {
      wkLabel.textContent = currentLang === 'zh' ? '本周提交' : 'Week Commits'
    }
  } catch (e) {
    console.error('[updateDashboardByView] Error updating commits:', e)
  }

  // 提交趋势：随范围切换+模块筛选（重建前先销毁旧图）
  if (STATE.charts.commitTrend && STATE.charts.commitTrend.destroy) {
    try {
      STATE.charts.commitTrend.destroy()
    } catch {}
    STATE.charts.commitTrend = null
  }
  const selectedModule = STATE.view.module
  const byModuleSeries = LIVE.project.commitTrendByModule || {}

  // 根据模块和时间范围选择数据
  let trendData = []
  if (
    selectedModule &&
    selectedModule !== 'all' &&
    byModuleSeries[selectedModule]
  ) {
    // 具体模块的趋势
    const series = byModuleSeries[selectedModule]
    if (STATE.view.range === '1y') {
      trendData = series.year || []
    } else if (STATE.view.range === '1w') {
      // 近一周: 优先使用last30再截取,或者直接使用year数据截取
      trendData = (series.last30 || series.year || []).slice(-7)
    } else if (STATE.view.range === '1m') {
      trendData = series.last30 || []
    } else if (STATE.view.range === 'month' && STATE.view.month) {
      // 从一年序列中过滤出所选月份
      trendData = (series.year || []).filter(
        (p) => String(p.date || '').slice(0, 7) === STATE.view.month,
      )
      // 若该月无数据，退回 last30
      if (!trendData.length) trendData = series.last30 || []
    } else {
      trendData = series.last30 || []
    }
  } else {
    // 全部模块的趋势
    if (
      STATE.view.range === '1y' &&
      Array.isArray(LIVE.project.commitTrend365)
    ) {
      trendData = LIVE.project.commitTrend365
    } else if (STATE.view.range === '1w') {
      // 近一周: 从commitTrend截取最后7天
      const src = LIVE.project.commitTrend || LIVE.project.commitTrend365 || []
      trendData = src.slice(-7)
    } else if (STATE.view.range === '1m') {
      trendData = LIVE.project.commitTrend || []
    } else if (STATE.view.range === 'month' && STATE.view.month) {
      // 使用全年日序列过滤指定月份
      const src = LIVE.project.commitTrend365 || []
      trendData = src.filter(
        (p) => String(p.date || '').slice(0, 7) === STATE.view.month,
      )
      if (!trendData.length) trendData = LIVE.project.commitTrend || []
    } else {
      trendData = LIVE.project.commitTrend || []
    }
  }

  if (trendData.length > 0) {
    renderCommitTrendChartFromSeries(trendData)
  } else {
    console.warn('[updateDashboardByView] No trend data available for', {
      module: selectedModule,
      range: STATE.view.range,
    })
  }

  // 模块分布：按新增行数
  renderModuleLinesDistFromByModule(byModule, LIVE.project.modulesAllowed || [])

  // 最近提交：按选择范围过滤，默认 30 天，支持展开
  renderRecentCommitsFromProject(LIVE.project)
  // 根据语言与范围更新静态标题
  applyLanguageUI()
}

// =============== GitHub API 补全最近提交（突破 100 条限制） ===============
async function ensureRecentCommitsAugmented() {
  try {
    if (!LIVE.project) return
    if (STATE.view.range !== '1y') return // 只在“一年”视图尝试补全
    if (LIVE.project._augmenting || LIVE.project._augmentedYear) return

    const existing = Array.isArray(LIVE.project.recentCommits)
      ? LIVE.project.recentCommits
      : []

    // 简单启发式：不足 300 条且账号年提交数更大时才补全
    const approxYearTotal = LIVE.account?.yearCommits
      ? Number(LIVE.account.yearCommits)
      : sumCounts(LIVE.project.commitTrend365)
    if (!approxYearTotal || existing.length >= approxYearTotal) return
    if (existing.length >= 300) return

    LIVE.project._augmenting = true
    const sinceISO = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString()

    const perPage = 100
    const maxPages = 10 // 最多抓取 1000 条，避免过多请求
    const merged = new Map(existing.map((c) => [normalizeSha(c.hash), c]))

    for (let page = 1; page <= maxPages; page++) {
      const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?since=${encodeURIComponent(
        sinceISO,
      )}&per_page=${perPage}&page=${page}`
      const res = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json',
        },
      })
      if (!res.ok) break
      const arr = await res.json()
      if (!Array.isArray(arr) || arr.length === 0) break

      for (const it of arr) {
        const sha = it.sha || ''
        const key = normalizeSha(sha)
        if (!key) continue
        if (merged.has(key)) continue
        merged.set(key, {
          hash: sha,
          datetime: it.commit?.author?.date || it.commit?.committer?.date,
          author: it.commit?.author?.name || it.author?.login || '',
          email: it.commit?.author?.email || '',
          subject: (it.commit?.message || '').split('\n')[0],
          modules: [],
        })
      }

      // 如果已经达到大致目标数量，可提前停止
      if (merged.size >= approxYearTotal) break
    }

    // 写回并标记
    LIVE.project.recentCommits = Array.from(merged.values()).sort(
      (a, b) => new Date(b.datetime) - new Date(a.datetime),
    )
    LIVE.project._augmentedYear = true

    // 重新渲染一次
    renderRecentCommitsFromProject(LIVE.project)
  } catch (e) {
    console.warn('[ensureRecentCommitsAugmented] failed:', e)
  } finally {
    LIVE.project._augmenting = false
  }
}

function normalizeSha(hash) {
  if (!hash) return ''
  const m = String(hash).match(/[0-9a-f]{7,40}$/i)
  return m ? m[0].toLowerCase() : ''
}

function sumCounts(series) {
  if (!Array.isArray(series)) return 0
  return series.reduce((acc, p) => acc + (Number(p.count) || 0), 0)
}

// 计算所有模块名（并去重）
function computeAllModuleNames(project) {
  const set = new Set(
    Array.isArray(project.modulesAllowed) ? project.modulesAllowed : [],
  )
  function addKeys(obj) {
    if (obj && typeof obj === 'object')
      Object.keys(obj).forEach((k) => set.add(k))
  }
  addKeys(project.weekTotals?.byModule)
  addKeys(project.monthTotals?.byModule)
  addKeys(project.yearTotals?.byModule)
  if (Array.isArray(project.months))
    project.months.forEach((m) => addKeys(m.byModule))
  return Array.from(set)
}

// 初始化或更新模块下拉选项，保持当前选择
function ensureModuleSelectOptions(names) {
  const modSel = document.getElementById('moduleSelect')
  if (!modSel) return
  const want = ['all', ...names]
  const have = Array.from(modSel.options).map((o) => o.value)
  const same =
    want.length === have.length && want.every((v, i) => v === have[i])
  if (same) return
  const current = modSel.value || 'all'
  modSel.innerHTML =
    `<option value="all">${currentLang === 'zh' ? '全部' : 'All'}</option>` +
    names.map((n) => `<option value="${n}">${n}</option>`).join('')
  // 恢复选择
  modSel.value = want.includes(current) ? current : 'all'
}

// 用 LIVE 的 months 列表填充月份下拉
function ensureMonthOptions(project) {
  const el = document.getElementById('monthPicker')
  if (!el) return
  const months = Array.isArray(project.months)
    ? project.months.map((m) => m.month)
    : []
  if (!months.length) return
  const have = Array.from(el.options || []).map((o) => o.value)
  const want = ['', ...months]
  const same =
    have.length === want.length && have.every((v, i) => v === want[i])
  if (same) return
  const placeholder = currentLang === 'zh' ? '选择月份' : 'Select month'
  el.innerHTML =
    `<option value="">— ${placeholder} —</option>` +
    months.map((m) => `<option value="${m}">${m}</option>`).join('')
  if (STATE.view.range === 'month' && STATE.view.month) {
    el.value = STATE.view.month
  }
}

function hideAllDataSections() {
  ;['projectStats', 'contributionSection', 'recentCommits'].forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.style.display = 'none'
  })
}

// ==================== 渲染贡献热力图 ====================
function renderContributionHeatmap(modules) {
  const container = document.getElementById('heatmapContainer')
  if (!container) return

  const commitsByDate = {}
  modules.forEach((m) => {
    ;(m.commits || []).forEach((c) => {
      if (!c.datetime) return
      const date = c.datetime.split('T')[0]
      commitsByDate[date] = (commitsByDate[date] || 0) + 1
    })
  })

  const days = 365
  const today = new Date()
  const dates = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }

  const maxCommits = Math.max(...Object.values(commitsByDate), 1)
  const getColor = (count) => {
    if (count === 0) return '#ebedf0'
    const ratio = count / maxCommits
    if (ratio < 0.25) return '#c6e48b'
    if (ratio < 0.5) return '#7bc96f'
    if (ratio < 0.75) return '#239a3b'
    return '#196127'
  }

  const weeks = []
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7))
  }

  container.innerHTML = `
    <div class="flex gap-1 justify-center">
      ${weeks
        .map(
          (week) => `
        <div class="flex flex-col gap-1">
          ${week
            .map((date) => {
              const count = commitsByDate[date] || 0
              return `<div class="w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-indigo-400" style="background: ${getColor(
                count,
              )};" title="${date}: ${count} commits"></div>`
            })
            .join('')}
        </div>
      `,
        )
        .join('')}
    </div>
  `
  // 默认滚动到最右侧（显示最近日期，更符合 GitHub 展示习惯）
  try {
    requestAnimationFrame(() => (container.scrollLeft = container.scrollWidth))
  } catch {}
}

// ==================== 渲染提交趋势图表 ====================
function renderCommitTrendChart(modules) {
  const canvas = document.getElementById('commitTrendChart')
  if (!canvas) return

  const commitsByDate = {}
  modules.forEach((m) => {
    ;(m.commits || []).forEach((c) => {
      if (!c.datetime) return
      const date = c.datetime.split('T')[0]
      commitsByDate[date] = (commitsByDate[date] || 0) + 1
    })
  })

  const days = 30
  const today = new Date()
  const labels = []
  const data = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`)
    data.push(commitsByDate[dateStr] || 0)
  }

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '每日提交数',
          data,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
    },
  })
}

// 从预计算序列渲染提交趋势
function renderCommitTrendChartFromSeries(series) {
  const canvas = document.getElementById('commitTrendChart')
  if (!canvas) return
  const labels = series.map((p) => {
    const d = new Date(p.date)
    return `${d.getMonth() + 1}/${d.getDate()}`
  })
  const data = series.map((p) => p.count || 0)
  STATE.charts.commitTrend = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '每日提交数',
          data,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  })
}

// ==================== 渲染模块分布图表 ====================
function renderModuleDistChart(modules) {
  const canvas = document.getElementById('moduleDistChart')
  if (!canvas) return
  if (!modules || modules.length === 0) {
    const parent = canvas.parentElement
    if (parent)
      parent.innerHTML +=
        '<div class="text-sm text-gray-500 text-center py-4">暂无模块提交数据</div>'
    return
  }

  const labels = modules.map((m) =>
    m.name === 'ProjectPrinting' ? '主仓库' : m.name,
  )
  const data = modules.map((m) => (m.commits || []).length)
  const sum = data.reduce((a, b) => a + b, 0)
  if (sum === 0) {
    const parent = canvas.parentElement
    if (parent)
      parent.innerHTML +=
        '<div class="text-sm text-gray-500 text-center py-4">最近无模块提交</div>'
    return
  }
  const colors = [
    '#4f46e5',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
  ]

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 10, font: { size: 11 } },
        },
      },
    },
  })
}

function renderModuleDistChartFromSeries(items) {
  const canvas = document.getElementById('moduleDistChart')
  if (!canvas) return
  if (!items || items.length === 0) {
    const parent = canvas.parentElement
    if (parent)
      parent.innerHTML +=
        '<div class="text-sm text-gray-500 text-center py-4">暂无模块提交数据</div>'
    return
  }
  const labels = items.map((m) => m.name)
  const data = items.map((m) => m.commits || 0)
  const sum = data.reduce((a, b) => a + b, 0)
  if (sum === 0) {
    const parent = canvas.parentElement
    if (parent)
      parent.innerHTML +=
        '<div class="text-sm text-gray-500 text-center py-4">最近无模块提交</div>'
    return
  }
  const colors = [
    '#4f46e5',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
  ]
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        { data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 10, font: { size: 11 } },
        },
      },
    },
  })
}

// 使用报告 JSON 的 modules（包含 added/removed）渲染“按新增行数”的模块分布
function renderModuleLinesDistFromModules(modules) {
  const canvas = document.getElementById('moduleDistChart')
  if (!canvas) return
  if (!Array.isArray(modules) || modules.length === 0) {
    const parent = canvas.parentElement
    if (parent)
      parent.innerHTML +=
        '<div class="text-sm text-gray-500 text-center py-4">暂无模块数据</div>'
    return
  }
  const labels = modules.map((m) =>
    m.name === 'ProjectPrinting' ? '主仓库' : m.name,
  )
  const data = modules.map((m) => Number(m.added || 0))
  const sum = data.reduce((a, b) => a + b, 0)
  if (sum === 0) {
    const parent = canvas.parentElement
    if (parent)
      parent.innerHTML +=
        '<div class="text-sm text-gray-500 text-center py-4">最近无模块代码变更</div>'
    return
  }
  const colors = [
    '#4f46e5',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
  ]
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 10, font: { size: 11 } },
        },
      },
    },
  })
}

// 使用 weekTotals.byModule（name -> {added, removed}）+ modulesAllowed 列表渲染分布，覆盖全部 submodule
function renderModuleLinesDistFromByModule(byModule = {}, modulesAllowed = []) {
  const canvas = document.getElementById('moduleDistChart')
  if (!canvas) return

  console.log('[DEBUG] renderModuleLinesDistFromByModule:', {
    byModule,
    modulesAllowed,
    selectedModule: STATE.view.module,
  })

  // 先销毁旧图
  if (STATE.charts.moduleDist && STATE.charts.moduleDist.destroy) {
    try {
      STATE.charts.moduleDist.destroy()
    } catch {}
    STATE.charts.moduleDist = null
  }

  // 合并 allowed 与实际出现的模块，过滤掉 'root' 模块
  const set = new Set(
    Array.isArray(modulesAllowed)
      ? modulesAllowed.filter((n) => n !== 'root')
      : [],
  )
  Object.keys(byModule || {}).forEach((k) => {
    if (k !== 'root') set.add(k)
  })

  let names = Array.from(set)

  // 代码分布图始终显示全部模块,不受模块筛选影响,只根据时间范围(byModule数据)

  console.log('[DEBUG] Final module names for chart:', names)
  if (!names || names.length === 0) {
    const parent = canvas.parentElement
    if (parent && !parent.querySelector('.no-data-message')) {
      const msg = document.createElement('div')
      msg.className = 'text-sm text-gray-500 text-center py-4 no-data-message'
      msg.textContent = '暂无模块数据'
      parent.appendChild(msg)
    }
    return
  }

  // 清除旧的错误消息
  const parent = canvas.parentElement
  if (parent) {
    const oldMsg = parent.querySelector('.no-data-message')
    if (oldMsg) oldMsg.remove()
  }

  const labels = names
  const data = names.map((n) => Number(byModule[n]?.added || 0))
  const sum = data.reduce((a, b) => a + b, 0)

  console.log('[DEBUG] Chart data:', { labels, data, sum })

  if (sum === 0) {
    if (parent && !parent.querySelector('.no-data-message')) {
      const msg = document.createElement('div')
      msg.className = 'text-sm text-gray-500 text-center py-4 no-data-message'
      msg.textContent = '最近无模块代码变更'
      parent.appendChild(msg)
    }
    return
  }

  const colors = [
    '#4f46e5',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
  ]

  STATE.charts.moduleDist = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        { data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 10, font: { size: 11 } },
        },
      },
    },
  })
}

// ==================== 渲染最近提交记录 ====================
function renderRecentCommits(modules) {
  const commitsList = document.getElementById('commitsList')
  const commitCount = document.getElementById('commitCount')
  if (!commitsList) return

  const allCommits = []
  modules.forEach((m) => {
    ;(m.commits || []).forEach((c) => {
      allCommits.push({
        ...c,
        moduleName: m.name === 'ProjectPrinting' ? '主仓库' : m.name,
      })
    })
  })

  allCommits.sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
  const recentCommits = allCommits.slice(0, 10)

  if (recentCommits.length === 0) {
    commitsList.innerHTML =
      '<p class="text-sm text-gray-500 text-center py-4">暂无提交记录</p>'
    commitCount.textContent = '0 条'
    return
  }

  commitCount.textContent = `${allCommits.length} 条`

  commitsList.innerHTML = recentCommits
    .map(
      (c) => `
    <div class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
      <div class="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-sm font-medium text-gray-900">${escapeHtml(
            c.subject || 'No message',
          )}</span>
          <span class="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded">${
            c.moduleName
          }</span>
        </div>
        <div class="flex items-center gap-3 text-xs text-gray-500">
          <span class="flex items-center gap-1">
            <i class="ri-time-line"></i>
            ${formatDate(c.datetime)}
          </span>
          <span class="font-mono">${(c.hash || '').substring(0, 7)}</span>
        </div>
      </div>
    </div>
  `,
    )
    .join('')
}

function renderRecentCommitsFromList(list) {
  const commitsList = document.getElementById('commitsList')
  if (!commitsList) return
  if (!Array.isArray(list) || list.length === 0) {
    commitsList.innerHTML =
      '<p class="text-sm text-gray-500 text-center py-4">暂无提交记录</p>'
    return
  }
  // 不再截取,显示所有传入的提交
  commitsList.innerHTML = list
    .map(
      (c) => `
    <div class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
      <div class="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-sm font-medium text-gray-900">${escapeHtml(
            c.subject || 'No message',
          )}</span>
          ${
            c.moduleName
              ? `<span class="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded">${escapeHtml(
                  c.moduleName,
                )}</span>`
              : ''
          }
        </div>
        <div class="flex items-center gap-3 text-xs text-gray-500">
          <span class="flex items-center gap-1"><i class="ri-time-line"></i>${formatDate(
            c.datetime,
          )}</span>
          <span class="font-mono">${(c.hash || '').substring(0, 7)}</span>
        </div>
      </div>
    </div>
  `,
    )
    .join('')
}

function renderRecentCommitsFromProject(project) {
  const list = Array.isArray(project?.recentCommits)
    ? project.recentCommits
    : []
  const range = STATE.view.range
  const month = STATE.view.month
  let filtered = list

  // 模块筛选：只有选择具体模块时才过滤，all时显示所有
  const mod = STATE.view.module
  if (mod && mod !== 'all') {
    filtered = filtered.filter((c) =>
      Array.isArray(c.modules)
        ? c.modules.includes(mod)
        : (c.moduleName || '').toLowerCase() === mod.toLowerCase(),
    )
  }
  const now = new Date()
  if (range === '1w') {
    filtered = filtered.filter((c) => {
      const d = parseDateSafe(c.datetime)
      return d && now - d <= 7 * 86400000
    })
  } else if (range === '1m') {
    filtered = filtered.filter((c) => {
      const d = parseDateSafe(c.datetime)
      return d && now - d <= 30 * 86400000
    })
  } else if (range === '1y') {
    filtered = filtered // 已是近一年
  } else if (range === 'month' && month) {
    filtered = filtered.filter((c) => {
      const d = parseDateSafe(c.datetime)
      if (!d) return false
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}`
      return ym === month
    })
  }
  const shown = filtered.slice(0, STATE.view.commitsShown)
  renderRecentCommitsFromList(shown)

  // 更新显示的总数
  const commitCount = document.getElementById('commitCount')
  if (commitCount) {
    commitCount.textContent = `${filtered.length} 条`
  }

  const btn = document.getElementById('loadMoreCommits')
  if (btn) {
    btn.style.display =
      filtered.length > STATE.view.commitsShown ? 'block' : 'none'
    btn.onclick = (e) => {
      // 如果按住 Alt/Option 键，则一次性展开全部
      if (e && (e.altKey || e.metaKey || e.ctrlKey)) {
        STATE.view.commitsShown = filtered.length
      } else {
        STATE.view.commitsShown += 20
      }
      const more = filtered.slice(0, STATE.view.commitsShown)
      renderRecentCommitsFromList(more)
      if (filtered.length <= STATE.view.commitsShown) {
        btn.style.display = 'none'
      }
    }
  }
}

// ==================== LANGUAGE / UI TEXTS ====================
function labelForRangeZh() {
  switch (STATE.view.range) {
    case '1w':
      return '近一周'
    case '1m':
      return '近一月'
    case '1y':
      return '近一年'
    case 'month':
      return STATE.view.month ? STATE.view.month : '按月份'
    default:
      return '本期'
  }
}
function labelForRangeEn() {
  switch (STATE.view.range) {
    case '1w':
      return 'last week'
    case '1m':
      return 'last month'
    case '1y':
      return 'last year'
    case 'month':
      return STATE.view.month ? STATE.view.month : 'by month'
    default:
      return 'this period'
  }
}
function applyLanguageUI() {
  try {
    const search = document.getElementById('search')
    if (search)
      search.placeholder =
        currentLang === 'zh' ? '搜索周报...' : 'Search reports...'
    // 模块下拉首项文案
    const modSel = document.getElementById('moduleSelect')
    if (modSel && modSel.options && modSel.options.length) {
      modSel.options[0].text = currentLang === 'zh' ? '全部' : 'All'
    }

    const yr = document.getElementById('labelYearCommits')
    if (yr) yr.textContent = currentLang === 'zh' ? '今年提交' : 'Year Commits'
    const yrf = document.getElementById('footYearCommits')
    if (yrf)
      yrf.textContent = currentLang === 'zh' ? 'Year Commits' : 'Year Commits'

    const wk = document.getElementById('labelWeekCommits')
    if (wk) wk.textContent = currentLang === 'zh' ? '本周提交' : 'Week Commits'
    const wkf = document.getElementById('footWeekCommits')
    if (wkf)
      wkf.textContent = currentLang === 'zh' ? 'Week Commits' : 'Week Commits'

    const rangeLabelZh = labelForRangeZh()
    const rangeLabelEn = labelForRangeEn()
    const mon = document.getElementById('labelMonthlyChanges')
    if (mon)
      mon.textContent =
        currentLang === 'zh'
          ? `${rangeLabelZh}代码变更数`
          : `Code Changes (${rangeLabelEn})`
    const monf = document.getElementById('footMonthlyChanges')
    if (monf)
      monf.textContent = currentLang === 'zh' ? 'Code Changes' : 'Code Changes'

    const am = document.getElementById('labelActiveModules')
    if (am)
      am.textContent = currentLang === 'zh' ? '活跃模块' : 'Active Modules'
    const amf = document.getElementById('footActiveModules')
    if (amf)
      amf.textContent =
        currentLang === 'zh' ? 'Active Modules' : 'Active Modules'

    const heat = document.getElementById('heatmapTitle')
    if (heat)
      heat.innerHTML = `<i class="ri-calendar-check-line text-indigo-600"></i>${
        currentLang === 'zh'
          ? '贡献热力图 (最近一年)'
          : 'Contribution Heatmap (last year)'
      }
    `
    const trend = document.getElementById('commitTrendTitle')
    if (trend) {
      let suffixZh = '最近30天',
        suffixEn = 'last 30 days'
      if (STATE.view.range === '1y') {
        suffixZh = '最近一年'
        suffixEn = 'last year'
      } else if (STATE.view.range === '1w') {
        suffixZh = '最近7天'
        suffixEn = 'last 7 days'
      } else if (STATE.view.range === 'month' && STATE.view.month) {
        suffixZh = STATE.view.month
        suffixEn = STATE.view.month
      }
      trend.innerHTML = `<i class="ri-line-chart-line text-indigo-600"></i>${
        currentLang === 'zh'
          ? `提交趋势 (${suffixZh})`
          : `Commit Trend (${suffixEn})`
      }`
    }
    const dist = document.getElementById('moduleDistTitle')
    if (dist)
      dist.innerHTML = `<i class="ri-pie-chart-line text-indigo-600"></i>${
        currentLang === 'zh' ? '模块代码分布' : 'Module Code Distribution'
      }`
  } catch {}
}

function renderContributionHeatmapFromMap(map) {
  const container = document.getElementById('heatmapContainer')
  if (!container) return
  const days = 365
  const today = new Date()
  const dates = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  const values = dates.map((d) => map[d] || 0)
  const maxCommits = Math.max(1, ...values)
  const getColor = (count) => {
    if (count === 0) return '#ebedf0'
    const ratio = count / maxCommits
    if (ratio < 0.25) return '#c6e48b'
    if (ratio < 0.5) return '#7bc96f'
    if (ratio < 0.75) return '#239a3b'
    return '#196127'
  }
  const weeks = []
  for (let i = 0; i < dates.length; i += 7) weeks.push(dates.slice(i, i + 7))
  container.innerHTML = `
    <div class="flex gap-1 justify-center">
      ${weeks
        .map(
          (week) => `
        <div class="flex flex-col gap-1">
          ${week
            .map((date) => {
              const count = map[date] || 0
              return `<div class="w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-indigo-400" style="background: ${getColor(
                count,
              )};" title="${date}: ${count} commits"></div>`
            })
            .join('')}
        </div>
      `,
        )
        .join('')}
    </div>
  `
  try {
    requestAnimationFrame(() => (container.scrollLeft = container.scrollWidth))
  } catch {}
}

async function loadLiveStats() {
  try {
    const acc = await fetch('./out/account-stats.json', { cache: 'no-cache' })
    if (acc.ok) LIVE.account = await acc.json()
  } catch {}
  try {
    const proj = await fetch('./out/project-stats.json', { cache: 'no-cache' })
    if (proj.ok) LIVE.project = await proj.json()
  } catch {}
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// 注意：escapeHtml 已在顶部定义，避免重复定义

// ==================== 加载报告列表 ====================
async function loadReportsIndex() {
  try {
    // 仅从 out/ 目录读取索引
    let response = await fetch('./out/index.json', { cache: 'no-cache' })
    if (!response.ok) throw new Error('Failed to load index')

    const data = await response.json()
    // 仅保留近一年（365 天）内的周报
    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000
    const items = Array.isArray(data.items) ? data.items : []
    STATE.reports = items.filter((r) => {
      const t = typeof r.mtime === 'number' ? r.mtime : 0
      return t >= oneYearAgo
    })

    renderReportsList()
  } catch (error) {
    console.error('Error loading reports:', error)
    // 显示友好的错误提示
    const container = document.getElementById('reportsList')
    const emptyState = document.getElementById('emptyState')
    const countSpan = document.getElementById('reportCount')

    if (container) container.innerHTML = ''
    if (emptyState) {
      emptyState.classList.remove('hidden')
      const isFile = location.protocol === 'file:'
      emptyState.innerHTML = `
        <i class="ri-error-warning-line text-4xl mb-2 block" style="color: #ef4444;"></i>
        <p class="text-lg font-semibold mb-2">无法加载周报数据</p>
        ${
          isFile
            ? '<p class="text-sm text-gray-600 mb-4">检测到你是直接双击打开 HTML（file://）。请改用本地 HTTP 服务，否则浏览器会阻止读取 index.json 与 Markdown。</p>'
            : '<p class="text-sm text-gray-600 mb-4">请先确认已生成周报索引 index.json，并与本页位于同一目录。</p>'
        }
        ${
          isFile
            ? `<div class="bg-gray-100 rounded-lg p-4 max-w-2xl mx-auto">
                <pre class="text-sm font-mono text-gray-900 whitespace-pre-wrap">python3 -m http.server 8080
# 打开：http://localhost:8080/</pre>
              </div>`
            : `<div class="bg-gray-100 rounded-lg p-4 max-w-2xl mx-auto">
                <code class="text-sm font-mono text-gray-900">MODE=weekly SINCE_DAYS=7 PUBLISH_MD=true INIT_SUBMODULES=true node scripts/pull-and-generate.mjs</code>
              </div>`
        }
        <p class="text-sm text-gray-500 mt-4">处理后刷新此页面</p>
      `
    }
    if (countSpan) countSpan.textContent = '0 份周报'

    // 隐藏数据区域
    hideAllDataSections()
  }
}

// ==================== RENDERING ====================
function renderReportsList() {
  const container = document.getElementById('reportsList')
  const emptyState = document.getElementById('emptyState')
  const countSpan = document.getElementById('reportCount')

  // Filter reports
  let filtered = STATE.reports
  if (STATE.filters.lang !== 'all') {
    filtered = filtered.filter((r) => r.lang === STATE.filters.lang)
  }
  if (STATE.filters.search) {
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(STATE.filters.search) ||
        r.file.toLowerCase().includes(STATE.filters.search),
    )
  }

  // 分组：将相同周（或同一基名）的中英文合并成一个卡片
  const groups = new Map()
  for (const r of filtered) {
    const base = r.file.replace(/\.(zh|en)\.md$/, '.md')
    if (!groups.has(base)) groups.set(base, { base, items: [] })
    groups.get(base).items.push(r)
  }
  const grouped = Array.from(groups.values()).sort((a, b) =>
    Math.max(...a.items.map((x) => x.mtime || 0)) <
    Math.max(...b.items.map((x) => x.mtime || 0))
      ? 1
      : -1,
  )

  // Update count (i18n)
  countSpan.textContent =
    currentLang === 'zh'
      ? `共 ${grouped.length} 份周报（含中/英）`
      : `${grouped.length} reports (zh/en grouped)`

  if (grouped.length === 0) {
    container.innerHTML = ''
    emptyState.classList.remove('hidden')
    return
  }

  emptyState.classList.add('hidden')

  // 渲染周报卡片（分页）
  const shown = grouped.slice(0, STATE.view.reportsShown)
  container.innerHTML = shown
    .map(({ base, items }) => {
      const zh = items.find((x) => x.lang === 'zh')
      const en = items.find((x) => x.lang === 'en')
      const head = zh || en || items[0]
      const title = head ? head.title : base
      const mtime = Math.max(...items.map((x) => x.mtime || 0))

      // 统一使用语言按钮显示(如果有多个语言版本)
      const hasMultipleLangs = zh && en

      // 卡片不可直接点击,只能通过语言按钮
      const cardClass = 'card p-6 cursor-default'
      const cardOnClick = ''

      // 构建语言按钮
      const chipZh = zh
        ? `<button class="tag tag-primary" onclick="openReport('${escapeHtml(
            zh.file,
          )}'); event.stopPropagation();" aria-label="Open Chinese version"><i class="ri-translate-2 mr-1"></i>中文</button>`
        : ''
      const chipEn = en
        ? `<button class="tag tag-gray" onclick="openReport('${escapeHtml(
            en.file,
          )}'); event.stopPropagation();" aria-label="Open English version"><i class="ri-global-line mr-1"></i>English</button>`
        : ''

      // 统一的卡片内容: 始终显示语言按钮
      const actionContent = `
        <div class="flex flex-wrap items-center gap-2 mb-4">${chipZh}${chipEn}</div>
        <div class="flex items-center justify-between pt-3 border-t border-gray-100">
          <span class="text-xs text-gray-400 font-mono">${escapeHtml(
            base,
          )}</span>
          <span class="text-xs text-gray-500">
            <i class="ri-information-line text-indigo-600 mr-1"></i>
            ${currentLang === 'zh' ? '选择语言查看' : 'Select language'}
          </span>
        </div>
      `

      return `
      <div class="${cardClass}" ${cardOnClick}>
        <div class="mb-4">
          <h3 class="font-bold text-xl text-gray-900 mb-3 leading-tight">${escapeHtml(
            title,
          )}</h3>
          <div class="flex items-center text-sm text-gray-500 mb-3">
            <i class="ri-calendar-line mr-2 text-indigo-600"></i>
            ${formatDate(mtime)}
          </div>
        </div>
        ${actionContent}
      </div>`
    })
    .join('')

  // 查看更多按钮
  const loadMoreBtn = document.getElementById('loadMoreReports')
  const loadMoreWrapper = document.getElementById('loadMoreReportsWrapper')
  if (loadMoreBtn && loadMoreWrapper) {
    if (grouped.length > STATE.view.reportsShown) {
      loadMoreWrapper.style.display = 'block'
      loadMoreBtn.onclick = () => {
        STATE.view.reportsShown += 6
        renderReportsList()
      }
    } else {
      loadMoreWrapper.style.display = 'none'
    }
  }
}

function showEmptyState() {
  document.getElementById('reportsList').innerHTML = ''
  document.getElementById('emptyState').classList.remove('hidden')
  document.getElementById('reportCount').textContent = '共 0 份周报'
}

// ==================== MODAL & REPORT VIEWING ====================
async function openReport(filename) {
  const report = STATE.reports.find((r) => r.file === filename)
  if (!report) return

  STATE.currentReport = report

  // Update modal header
  document.getElementById('modalTitle').textContent = report.title
  const badge = document.getElementById('modalBadge')
  badge.textContent = report.lang === 'zh' ? '中文' : 'English'
  badge.className = `tag ${report.lang === 'zh' ? 'tag-primary' : 'tag-gray'}`

  // 原始文件链接：指向 GitHub blob（PPProgress/out/...），避免浏览器下载 .md
  const rawLink = document.getElementById('rawLink')
  if (rawLink) {
    const blobUrl = `https://github.com/${PROGRESS_REPO_OWNER}/${PROGRESS_REPO_NAME}/blob/${PROGRESS_REPO_BRANCH}/out/${encodeURI(
      filename,
    )}`
    rawLink.href = blobUrl
    rawLink.target = '_blank'
    rawLink.rel = 'noopener'
    rawLink.onclick = null // 使用默认跳转行为
  }

  // Show modal
  document.getElementById('modal').classList.remove('hidden')
  document.getElementById('modal').classList.add('flex')

  // Load content
  const content = document.getElementById('modalContent')
  content.innerHTML =
    '<div class="text-center text-gray-500 py-12"><i class="ri-loader-4-line text-4xl animate-spin mb-2 block"></i>加载中...</div>'

  try {
    // 优先尝试加载 out/ 下 JSON（富可视化）
    const jsonFilename = filename.replace(/\.md$/, '.json')
    let jsonResponse = await fetch(`./out/${encodeURI(jsonFilename)}`, {
      cache: 'no-cache',
    })

    if (jsonResponse.ok) {
      const data = await jsonResponse.json()
      renderRichReport(data)
      // 保持“原始文件”链接指向 Markdown，便于访客查看原始周报文本
    } else {
      // 回退到 out/ 下的 Markdown
      let mdResponse = await fetch(`./out/${encodeURI(filename)}`, {
        cache: 'no-cache',
      })
      if (!mdResponse.ok) throw new Error('Failed to load report')

      const markdown = await mdResponse.text()
      renderMarkdownReport(markdown)
    }
  } catch (error) {
    console.error('Error loading report:', error)
    content.innerHTML = `
      <div class="text-center text-red-600 py-12">
        <i class="ri-error-warning-line text-4xl mb-2 block"></i>
        加载失败：${escapeHtml(error.message)}
      </div>
    `
  }
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden')
  document.getElementById('modal').classList.remove('flex')

  // 仅销毁“周报详情模态窗”内部的图表，避免误删仪表盘上的趋势与分布图
  ;['module', 'changes'].forEach((key) => {
    const chart = STATE.charts[key]
    if (chart && typeof chart.destroy === 'function') {
      try {
        chart.destroy()
      } catch {}
    }
    delete STATE.charts[key]
  })

  // 可选：在关闭模态后根据当前视图状态刷新仪表盘，确保画布正确渲染
  try {
    updateDashboardByView()
  } catch {}
}

// 允许通过 URL 直接打开具体周报，例如: ?report=weekly-2025-W21.zh.md
function tryOpenReportFromQuery() {
  try {
    const url = new URL(window.location.href)
    const file = url.searchParams.get('report')
    if (!file) return
    const exists = STATE.reports.find((r) => r.file === file)
    if (!exists) {
      STATE.reports.push({
        file,
        title: file,
        lang: /\.zh\.md$/i.test(file) ? 'zh' : 'en',
        mtime: Date.now(),
      })
    }
    openReport(file)
  } catch {}
}

// ==================== RICH REPORT RENDERING ====================
function renderRichReport(data) {
  const content = document.getElementById('modalContent')
  const lang = data.lang || 'en'
  const t = getTranslations(lang)

  content.innerHTML = `
    <!-- Report Header -->
    <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">${escapeHtml(
            data.title,
          )}</h2>
          <div class="flex items-center gap-4 text-sm text-gray-600">
            <span><i class="ri-calendar-line mr-1"></i>${
              data.since || t.recent
            } → ${data.until || t.now}</span>
            <span><i class="ri-time-line mr-1"></i>${formatDateTime(
              data.generatedAt,
            )}</span>
          </div>
        </div>
        <div class="text-right">
          <div class="text-3xl font-bold text-indigo-600">${
            data.progress?.totals?.commits || 0
          }</div>
          <div class="text-xs text-gray-500">${t.totalCommits}</div>
        </div>
      </div>
    </div>
    
    <!-- Metrics Section -->
    ${renderMetricsSection(data.metrics, lang)}
    
    <!-- Progress Charts -->
    ${renderProgressSection(data.progress, lang)}
    
    <!-- Commits Timeline -->
    ${renderCommitsTimeline(data.progress, lang)}
    
    <!-- Panorama Progress -->
    ${renderPanoramaSection(data.panorama, lang)}
  `

  // Initialize charts after DOM is ready
  setTimeout(() => {
    initializeCharts(data)
  }, 100)
}

function renderMetricsSection(metrics, lang) {
  if (!metrics) return ''

  const t = getTranslations(lang)

  return `
    <section class="mb-8">
      <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <i class="ri-dashboard-line text-indigo-600 mr-2"></i>${t.metrics}
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="card p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">${t.controllers}</span>
            <i class="ri-function-line text-2xl text-indigo-600"></i>
          </div>
          <div class="text-3xl font-bold text-gray-900">${
            metrics.controllers || 0
          }</div>
        </div>
        
        <div class="card p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">${t.endpoints}</span>
            <i class="ri-code-s-slash-line text-2xl text-green-600"></i>
          </div>
          <div class="text-3xl font-bold text-gray-900">${
            metrics.endpoints || 0
          }</div>
        </div>
        
        <div class="card p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-600">${t.scheduled}</span>
            <i class="ri-timer-line text-2xl text-orange-600"></i>
          </div>
          <div class="text-3xl font-bold text-gray-900">${
            metrics.scheduledJobs || 0
          }</div>
        </div>
      </div>
      
      <div class="card p-6">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-semibold text-gray-900">${t.enums}</h4>
          <span class="text-xs text-gray-500 italic">${
            lang === 'zh' ? '(代码静态扫描)' : '(Static code scan)'
          }</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="text-sm text-gray-600 mb-1">OrderStatus</div>
            <div class="flex flex-wrap gap-1">
              ${(metrics.orderStatus || [])
                .map((e) => `<span class="tag tag-gray text-xs">${e}</span>`)
                .join('')}
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">FulfillmentType</div>
            <div class="flex flex-wrap gap-1">
              ${(metrics.fulfillmentType || [])
                .map((e) => `<span class="tag tag-gray text-xs">${e}</span>`)
                .join('')}
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">PrintJobStatus</div>
            <div class="flex flex-wrap gap-1">
              ${(metrics.printJobStatus || [])
                .map((e) => `<span class="tag tag-gray text-xs">${e}</span>`)
                .join('')}
            </div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div class="card p-4">
          <h4 class="font-semibold text-gray-900 mb-3">${t.thresholds}</h4>
          <div class="space-y-2">
            ${
              metrics.qrTimeoutMin
                ? `<div class="flex items-center justify-between"><span class="text-sm text-gray-600">${t.qr}</span><span class="font-medium">${metrics.qrTimeoutMin} ${t.minutes}</span></div>`
                : ''
            }
            ${
              metrics.pinTimeoutMin
                ? `<div class="flex items-center justify-between"><span class="text-sm text-gray-600">${t.pin}</span><span class="font-medium">${metrics.pinTimeoutMin} ${t.minutes}</span></div>`
                : ''
            }
            ${
              metrics.queueTimeoutHours
                ? `<div class="flex items-center justify-between"><span class="text-sm text-gray-600">${t.queue}</span><span class="font-medium">${metrics.queueTimeoutHours} ${t.hours}</span></div>`
                : ''
            }
          </div>
        </div>
        
        <div class="card p-4">
          <h4 class="font-semibold text-gray-900 mb-3">${t.capabilities}</h4>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">MySQL</span>
              <span class="font-medium">${metrics.mysqlVer || 'N/A'}</span>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              ${
                metrics.hasRedis
                  ? '<span class="tag tag-success">Redis</span>'
                  : ''
              }
              ${
                metrics.hasLiquibase
                  ? '<span class="tag tag-success">Liquibase</span>'
                  : ''
              }
              ${
                metrics.hasActuator
                  ? '<span class="tag tag-success">Actuator</span>'
                  : ''
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `
}

function renderProgressSection(progress, lang) {
  if (!progress) return ''

  const t = getTranslations(lang)
  const totals = progress.totals || {}
  const modules = progress.modules || []

  return `
    <section class="mb-8">
      <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <i class="ri-git-commit-line text-indigo-600 mr-2"></i>${t.progress}
      </h3>
      
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="card p-4 text-center">
          <i class="ri-git-commit-line text-3xl text-indigo-600 mb-2"></i>
          <div class="text-2xl font-bold text-gray-900">${
            totals.commits || 0
          }</div>
          <div class="text-xs text-gray-500">${t.commits}</div>
        </div>
        <div class="card p-4 text-center">
          <i class="ri-file-list-line text-3xl text-blue-600 mb-2"></i>
          <div class="text-2xl font-bold text-gray-900">${
            totals.files || 0
          }</div>
          <div class="text-xs text-gray-500">${t.files}</div>
        </div>
        <div class="card p-4 text-center">
          <i class="ri-add-circle-line text-3xl text-green-600 mb-2"></i>
          <div class="text-2xl font-bold text-green-600">+${
            totals.added || 0
          }</div>
          <div class="text-xs text-gray-500">${t.added}</div>
        </div>
        <div class="card p-4 text-center">
          <i class="ri-indeterminate-circle-line text-3xl text-red-600 mb-2"></i>
          <div class="text-2xl font-bold text-red-600">-${
            totals.removed || 0
          }</div>
          <div class="text-xs text-gray-500">${t.removed}</div>
        </div>
      </div>
      
      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="card p-6">
          <h4 class="font-semibold text-gray-900 mb-4">${
            t.moduleComparison
          }</h4>
          <div class="chart-container">
            <canvas id="moduleChart"></canvas>
          </div>
        </div>
        
        <div class="card p-6">
          <h4 class="font-semibold text-gray-900 mb-4">${t.codeChanges}</h4>
          <div class="chart-container">
            <canvas id="changesChart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Modules Details -->
      <div class="space-y-4">
        ${modules
          .map(
            (m) => `
          <div class="card p-6 module-card" onclick="toggleModuleDetails(this)">
            <div class="flex items-center justify-between cursor-pointer">
              <div class="flex items-center gap-3 flex-1">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style="background: ${moduleColor(m.name)};">
                  <i class="ri-git-branch-line"></i>
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-gray-900">${escapeHtml(
                    m.name,
                  )}</div>
                  <div class="text-xs text-gray-500">${escapeHtml(m.path)}</div>
                </div>
              </div>
              
              <div class="flex items-center gap-6">
                <div class="text-center">
                  <div class="text-sm font-medium text-gray-900">${
                    Array.isArray(m.commits) ? m.commits.length : m.commits || 0
                  }</div>
                  <div class="text-xs text-gray-500">${t.commits}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm font-medium text-gray-900">${
                    m.files
                  }</div>
                  <div class="text-xs text-gray-500">${t.files}</div>
                </div>
                <div class="text-center">
                  <div class="text-sm font-medium text-green-600">+${
                    m.added
                  }</div>
                  <div class="text-sm font-medium text-red-600">-${
                    m.removed
                  }</div>
                </div>
                <i class="ri-arrow-down-s-line text-xl text-gray-400 transition-transform"></i>
              </div>
            </div>
            
            <div class="module-details hidden mt-4 pt-4 border-t border-gray-200">
              ${
                m.heat && m.heat.length
                  ? `
                <div class="mb-4">
                  <h5 class="text-sm font-medium text-gray-700 mb-2">${
                    t.heatmap
                  }</h5>
                  <div class="space-y-1">
                    ${m.heat
                      .slice(0, 5)
                      .map(
                        ([dir, count]) => `
                      <div class="flex items-center gap-2">
                        <div class="text-xs text-gray-600 w-32 truncate">${escapeHtml(
                          dir,
                        )}</div>
                        <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div class="heat-bar h-full" style="width: ${Math.min(
                            100,
                            (count / m.heat[0][1]) * 100,
                          )}%"></div>
                        </div>
                        <div class="text-xs text-gray-500 w-16 text-right">${count}</div>
                      </div>
                    `,
                      )
                      .join('')}
                  </div>
                </div>
              `
                  : ''
              }
              
              ${
                m.subjects && m.subjects.length
                  ? `
                <div>
                  <h5 class="text-sm font-medium text-gray-700 mb-2">${
                    t.recentCommits
                  }</h5>
                  <div class="space-y-1 max-h-48 overflow-y-auto">
                    ${m.subjects
                      .slice(0, 10)
                      .map(
                        (subject) => `
                      <div class="text-sm text-gray-600 flex items-start gap-2">
                        <i class="ri-git-commit-line text-gray-400 mt-0.5"></i>
                        <span class="line-clamp-2">${escapeHtml(subject)}</span>
                      </div>
                    `,
                      )
                      .join('')}
                  </div>
                </div>
              `
                  : ''
              }
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    </section>
  `
}

function renderCommitsTimeline(progress, lang) {
  if (!progress || !progress.modules) return ''

  const t = getTranslations(lang)
  const allCommits = []
  // 展示所有模块；主仓 ProjectPrinting 的 bot 提交已在生成阶段过滤
  progress.modules.forEach((m) => {
    const list = Array.isArray(m.commits) ? m.commits : []
    list.forEach((c) =>
      allCommits.push({
        module: m.name,
        subject: c.subject || '',
        datetime: c.datetime,
      }),
    )
  })

  if (allCommits.length === 0) return ''

  return `
    <section class="mb-8">
      <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <i class="ri-time-line text-indigo-600 mr-2"></i>${t.commitTimeline}
      </h3>
      
      <div class="card p-6">
        <div class="space-y-4">
          ${allCommits
            .map(
              (commit, idx) => `
            <div class="timeline-item ${
              idx === allCommits.length - 1 ? 'pb-0' : ''
            }">
              <div class="timeline-dot" style="background: ${moduleColor(
                commit.module,
              )}"></div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style="background: ${moduleColor(
                  commit.module,
                )}"><i class="ri-git-branch-line"></i></div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm text-gray-600 line-clamp-2">${escapeHtml(
                    commit.subject,
                  )}</div>
                  <div class="text-xs text-gray-400 mt-1">${escapeHtml(
                    commit.module,
                  )}</div>
                </div>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    </section>
  `
}

function renderPanoramaSection(panorama, lang) {
  if (!panorama || !panorama.overall) return ''

  const t = getTranslations(lang)
  const { completed, total } = panorama.overall
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return `
    <section class="mb-8">
      <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <i class="ri-checkbox-circle-line text-indigo-600 mr-2"></i>${
          t.panorama
        }
      </h3>
      
      <div class="card p-6">
        <div class="flex items-center gap-8">
          <div class="relative w-32 h-32">
            <svg class="w-full h-full progress-ring" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" stroke-width="12"/>
              <circle cx="60" cy="60" r="54" fill="none" stroke="#4f46e5" stroke-width="12" 
                class="progress-ring-circle"
                stroke-dasharray="${2 * Math.PI * 54}"
                stroke-dashoffset="${2 * Math.PI * 54 * (1 - percentage / 100)}"
                stroke-linecap="round"/>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <div class="text-3xl font-bold text-indigo-600">${percentage}%</div>
            </div>
          </div>
          
          <div class="flex-1">
            <div class="text-2xl font-bold text-gray-900 mb-2">${completed} / ${total}</div>
            <div class="text-gray-600">${t.tasksCompleted}</div>
            <div class="mt-4 flex gap-2">
              <span class="tag tag-success">${completed} ${t.completed}</span>
              <span class="tag tag-gray">${total - completed} ${
    t.remaining
  }</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
}

function renderMarkdownReport(markdown) {
  const content = document.getElementById('modalContent')
  const html = marked.parse(markdown)
  content.innerHTML = `<div class="prose max-w-none">${DOMPurify.sanitize(
    html,
  )}</div>`
}

// ==================== CHARTS ====================
function initializeCharts(data) {
  const progress = data.progress
  if (!progress || !progress.modules) return

  // Module Comparison Chart
  const moduleCtx = document.getElementById('moduleChart')
  if (moduleCtx) {
    STATE.charts.module = new Chart(moduleCtx, {
      type: 'bar',
      data: {
        labels: progress.modules.map((m) => m.name),
        datasets: [
          {
            label: 'Commits',
            data: progress.modules.map((m) =>
              Array.isArray(m.commits) ? m.commits.length : m.commits || 0,
            ),
            backgroundColor: 'rgba(79, 70, 229, 0.8)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },
    })
  }

  // Code Changes Chart
  const changesCtx = document.getElementById('changesChart')
  if (changesCtx) {
    STATE.charts.changes = new Chart(changesCtx, {
      type: 'doughnut',
      data: {
        labels: progress.modules.map((m) => m.name),
        datasets: [
          {
            data: progress.modules.map((m) => m.added + m.removed),
            backgroundColor: [
              'rgba(79, 70, 229, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
            ],
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    })
  }
}

// ==================== INTERACTIVE FEATURES ====================
function toggleModuleDetails(element) {
  const details = element.querySelector('.module-details')
  const arrow = element.querySelector('.ri-arrow-down-s-line')

  if (details.classList.contains('hidden')) {
    details.classList.remove('hidden')
    arrow.style.transform = 'rotate(180deg)'
  } else {
    details.classList.add('hidden')
    arrow.style.transform = 'rotate(0deg)'
  }
}

// ==================== UTILITIES ====================
function formatDateTime(isoString) {
  if (!isoString) return '--'
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 为模块名称生成稳定的颜色（用于时间线与模块头像）
function moduleColor(name) {
  const palette = [
    '#4f46e5',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#e11d48',
    '#84cc16',
  ]
  let h = 0
  for (let i = 0; i < (name || '').length; i++)
    h = (h * 31 + name.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

function getTranslations(lang) {
  const translations = {
    en: {
      recent: 'recent',
      now: 'now',
      totalCommits: 'Total Commits',
      metrics: 'Code Metrics',
      controllers: 'Controllers',
      endpoints: 'Endpoints',
      scheduled: 'Scheduled Jobs',
      enums: 'Domain Enums',
      thresholds: 'Operational Thresholds',
      qr: 'QR Pickup',
      pin: 'PIN Pickup',
      queue: 'Queue Pickup',
      minutes: 'min',
      hours: 'h',
      capabilities: 'Capabilities',
      progress: 'Development Progress',
      commits: 'commits',
      files: 'files',
      added: 'added',
      removed: 'removed',
      moduleComparison: 'Module Comparison',
      codeChanges: 'Code Changes Distribution',
      heatmap: 'Directory Heatmap',
      recentCommits: 'Recent Commits',
      commitTimeline: 'Commit Timeline',
      panorama: 'Panoramic Progress',
      tasksCompleted: 'Tasks Completed',
      completed: 'completed',
      remaining: 'remaining',
    },
    zh: {
      recent: '近期',
      now: '当前',
      totalCommits: '总提交数',
      metrics: '代码指标',
      controllers: '控制器',
      endpoints: '端点',
      scheduled: '定时任务',
      enums: '领域枚举',
      thresholds: '运行阈值',
      qr: '二维码取件',
      pin: 'PIN 码取件',
      queue: '排队取件',
      minutes: '分钟',
      hours: '小时',
      capabilities: '构建能力',
      progress: '开发进展',
      commits: '提交',
      files: '文件',
      added: '新增',
      removed: '删除',
      moduleComparison: '模块对比',
      codeChanges: '代码变更分布',
      heatmap: '目录热力图',
      recentCommits: '最近提交',
      commitTimeline: '提交时间线',
      panorama: '全景进度',
      tasksCompleted: '任务完成情况',
      completed: '已完成',
      remaining: '待完成',
    },
  }

  return translations[lang] || translations.en
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { STATE, loadReportsIndex, renderRichReport }
}
