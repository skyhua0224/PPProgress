#!/usr/bin/env node
/**
 * pp-report.mjs — ProjectPrinting unified reporting CLI
 *
 * Commands:
 *   metrics   -> code-derived metrics snapshot (endpoints/jobs/enums/thresholds/deps)
 *   progress  -> commit heat (ProjectPrinting main repo + submodules) for a date window
 *   weekly    -> compose a weekly report (metrics + progress) for a window
 *   retro     -> backfill weekly reports per ISO week across history (commit-based)
 *
 * Defaults write to analysis/out/. Override with --outDir=...
 *
 * Examples:
 *   node analysis/tools/pp-report.mjs weekly --sinceDays=7
 *   node analysis/tools/pp-report.mjs progress --since=2025-09-01 --until=2025-09-30
 *   node analysis/tools/pp-report.mjs retro --start=2024-01-01 --end=2025-11-01
 */
import { execSync } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

// ---------- arg helpers ----------
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .map((a) => {
      if (a.startsWith('--')) {
        const [k, v] = a.replace(/^--/, '').split('=')
        return [k, v ?? 'true']
      }
      return [Symbol.for('cmd'), a]
    })
    .filter(([k]) => k),
)

function getCmd() {
  const list = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  return list[0] || 'weekly'
}

function sinceDateISO(days) {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return d.toISOString().slice(0, 10)
}

function safeGit(cmd, cwd) {
  try {
    return execSync(cmd, {
      stdio: ['ignore', 'pipe', 'ignore'],
      cwd,
    }).toString()
  } catch {
    return ''
  }
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true }).catch(() => {})
}

// ---------- reports index (for pretty viewer) ----------
async function updateReportsIndex(dir) {
  // Build reports/index.json listing weekly*.md with metadata (title/lang/stamp/mtime)
  const entries = []
  let files = []
  try {
    files = await fs.readdir(dir)
  } catch {
    files = []
  }
  for (const name of files) {
    if (!name.startsWith('weekly-') || !name.endsWith('.md')) continue
    const lang = name.endsWith('.zh.md')
      ? 'zh'
      : name.endsWith('.en.md')
      ? 'en'
      : 'en'
    const file = path.join(dir, name)
    let title = name
    try {
      const txt = await fs.readFile(file, 'utf8')
      const first = (txt.split(/\r?\n/)[0] || '').replace(/^#\s*/, '')
      if (first) title = first
    } catch {}
    let mtime = 0
    try {
      const st = await fs.stat(file)
      mtime = st.mtimeMs || st.mtime?.getTime?.() || 0
    } catch {}
    entries.push({ file: name, title, lang, mtime })
  }
  entries.sort((a, b) => b.mtime - a.mtime)
  try {
    await fs.writeFile(
      path.join(dir, 'index.json'),
      JSON.stringify({ items: entries }, null, 2),
    )
  } catch {}
  return entries
}

// ---------- metrics data (extract only data, no formatting) ----------
async function computeMetricsData(repoRoot) {
  const includeCaps = String(args.includeCaps || 'true') !== 'false'
  const backendSrc = path.join(repoRoot, 'backend', 'src', 'main', 'java')
  const pomPath = path.join(repoRoot, 'backend', 'pom.xml')
  async function readAllFiles(dir, exts = ['.java', '.xml']) {
    const out = []
    async function walk(d) {
      let es = []
      try {
        es = await fs.readdir(d, { withFileTypes: true })
      } catch {
        return
      }
      for (const e of es) {
        const p = path.join(d, e.name)
        if (e.isDirectory()) await walk(p)
        else if (exts.includes(path.extname(e.name))) out.push(p)
      }
    }
    await walk(dir)
    return out
  }
  function countRegex(text, re) {
    const m = text.match(new RegExp(re, 'g'))
    return m ? m.length : 0
  }
  function extractEnumConstants(java, name) {
    const re = new RegExp(`enum\\s+${name}\\s*{([\\s\\S]*?)}`)
    const m = java.match(re)
    if (!m) return []
    const body = m[1].split(';')[0] || ''
    return body
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && /^[A-Z0-9_]+$/.test(s))
  }
  async function readText(f) {
    try {
      return await fs.readFile(f, 'utf8')
    } catch {
      return ''
    }
  }

  const files = await readAllFiles(backendSrc)
  let endpoints = 0,
    controllers = 0,
    scheduledJobs = 0
  let orderStatus = [],
    fulfillmentType = [],
    printJobStatus = []
  let qrTimeoutMin = null,
    pinTimeoutMin = null,
    queueTimeoutHours = null
  for (const f of files) {
    const txt = await readText(f)
    if (!txt) continue
    if (/(@RestController|@Controller)\b/.test(txt)) controllers += 1
    endpoints +=
      countRegex(txt, '@GetMapping\\(') +
      countRegex(txt, '@PostMapping\\(') +
      countRegex(txt, '@PutMapping\\(') +
      countRegex(txt, '@DeleteMapping\\(') +
      countRegex(txt, '@PatchMapping\\(') +
      countRegex(txt, '@RequestMapping\\(')
    scheduledJobs += countRegex(txt, '@Scheduled\\(')
    if (!orderStatus.length) {
      const a = extractEnumConstants(txt, 'OrderStatus')
      if (a.length) orderStatus = a
    }
    if (!fulfillmentType.length) {
      const a = extractEnumConstants(txt, 'FulfillmentType')
      if (a.length) fulfillmentType = a
    }
    if (!printJobStatus.length) {
      const a = extractEnumConstants(txt, 'PrintJobStatus')
      if (a.length) printJobStatus = a
    }
    if (
      f.includes(`${path.sep}job${path.sep}`) &&
      f.endsWith('AutoCompleteOrderJob.java')
    ) {
      const qr =
        txt.match(/qrPickupTimeoutMinutes\s*[:=].*?(\d+)/) ||
        txt.match(/\${[^:}]+:(\d+)}/)
      const pin = txt.match(/pinPickupTimeoutMinutes\s*[:=].*?(\d+)/)
      const queue = txt.match(/queuePickupTimeoutHours\s*[:=].*?(\d+)/)
      if (qr && !qrTimeoutMin) qrTimeoutMin = parseInt(qr[1])
      if (pin && !pinTimeoutMin) pinTimeoutMin = parseInt(pin[1])
      if (queue && !queueTimeoutHours) queueTimeoutHours = parseInt(queue[1])
    }
  }
  let mysqlVer = 'unknown'
  let hasRedis = false
  let hasActuator = false
  let hasLiquibase = false
  if (includeCaps) {
    const pom = await readText(pomPath)
    mysqlVer =
      (pom.match(/mysql-connector-j[\s\S]*?<version>(.*?)<\/version>/) ||
        [])[1] || 'unknown'
    hasRedis = /spring-boot-starter-data-redis|redisson/i.test(pom)
    hasActuator = /spring-boot-starter-actuator/i.test(pom)
    hasLiquibase = /liquibase-core/i.test(pom)
  }
  return {
    controllers,
    endpoints,
    scheduledJobs,
    orderStatus,
    fulfillmentType,
    printJobStatus,
    qrTimeoutMin,
    pinTimeoutMin,
    queueTimeoutHours,
    mysqlVer,
    hasRedis,
    hasActuator,
    hasLiquibase,
    generatedAt: new Date().toISOString(),
  }
}
async function runMetrics(outFile, repoRoot) {
  const lang = String(args.lang || 'en').toLowerCase()
  const i18n = (k) =>
    ({
      en: {
        title: 'Backend endpoints and jobs',
        controllers: 'Controllers',
        endpoints: 'Endpoint annotations',
        scheduled: 'Scheduled jobs (@Scheduled)',
        enums: 'Domain enums discovered',
        order: 'OrderStatus',
        fulfill: 'FulfillmentType',
        print: 'PrintJobStatus',
        thresholds: 'Operational thresholds (in code)',
        qr: 'QR pickup timeout',
        pin: 'PIN pickup timeout',
        queue: 'Queue pickup timeout',
        caps: 'Build/runtime capabilities',
        mysql: 'MySQL Connector/J version',
        redis: 'Redis/Redisson present',
        liq: 'Liquibase present',
        act: 'Actuator present',
        yes: 'yes',
        no: 'no',
      },
      zh: {
        title: '后端端点与任务',
        controllers: '控制器',
        endpoints: '端点注解',
        scheduled: '定时任务 (@Scheduled)',
        enums: '发现的领域枚举',
        order: 'OrderStatus',
        fulfill: 'FulfillmentType',
        print: 'PrintJobStatus',
        thresholds: '运行阈值（代码中）',
        qr: '二维码取件超时',
        pin: 'PIN 码取件超时',
        queue: '排队取件超时',
        caps: '构建/运行能力',
        mysql: 'MySQL Connector/J 版本',
        redis: '是否引入 Redis/Redisson',
        liq: '是否引入 Liquibase',
        act: '是否引入 Actuator',
        yes: '是',
        no: '否',
      },
    }[lang][k])

  const data = await computeMetricsData(repoRoot)
  const lines = []
  lines.push(`# ${i18n('title')}`)
  lines.push(
    `Controllers: ${data.controllers}`.replace(
      'Controllers',
      i18n('controllers'),
    ),
  )
  lines.push(`${i18n('endpoints')}: ${data.endpoints}`)
  lines.push(`${i18n('scheduled')}: ${data.scheduledJobs}`)
  lines.push(`${i18n('enums')}`)
  lines.push(
    `${i18n('order')} (${data.orderStatus.length}): ${
      data.orderStatus.join(', ') || 'N/A'
    }`,
  )
  lines.push(
    `${i18n('fulfill')} (${data.fulfillmentType.length}): ${
      data.fulfillmentType.join(', ') || 'N/A'
    }`,
  )
  lines.push(
    `${i18n('print')} (${data.printJobStatus.length}): ${
      data.printJobStatus.join(', ') || 'N/A'
    }`,
  )
  lines.push(`${i18n('thresholds')}`)
  lines.push(`${i18n('qr')}: ${data.qrTimeoutMin ?? 'N/A'} minutes`)
  lines.push(`${i18n('pin')}: ${data.pinTimeoutMin ?? 'N/A'} minutes`)
  lines.push(`${i18n('queue')}: ${data.queueTimeoutHours ?? 'N/A'} hours`)
  lines.push(`${i18n('caps')}`)
  lines.push(`${i18n('mysql')}: ${data.mysqlVer}`)
  lines.push(`${i18n('redis')}: ${data.hasRedis ? i18n('yes') : i18n('no')}`)
  lines.push(`${i18n('liq')}: ${data.hasLiquibase ? i18n('yes') : i18n('no')}`)
  lines.push(`${i18n('act')}: ${data.hasActuator ? i18n('yes') : i18n('no')}`)
  await fs.writeFile(outFile, lines.join('\n') + '\n')
  return { file: outFile, data }
}

// ---------- submodules helpers ----------
async function getSubmodules(repoRoot) {
  const modules = []
  const gm = path.join(repoRoot, '.gitmodules')
  try {
    const txt = await fs.readFile(gm, 'utf8')
    let current = null
    for (const raw of txt.split(/\r?\n/)) {
      const line = raw.trim()
      if (line.startsWith('[submodule')) {
        if (current) modules.push(current)
        current = {
          name: (line.match(/"(.+?)"/) || [])[1] || 'unknown',
          path: null,
          url: null,
        }
      } else if (current) {
        const m = line.match(/(path|url)\s*=\s*(.+)/)
        if (m) current[m[1]] = m[2]
      }
    }
    if (current) modules.push(current)
  } catch {}
  for (const g of ['frontend', 'admin', 'backend']) {
    const p = path.join(repoRoot, g)
    try {
      const st = await fs.stat(p)
      if (st.isDirectory() && !modules.find((m) => m.path === g))
        modules.push({ name: g, path: g })
    } catch {}
  }
  return modules
}

function summarizeRepo(cwd, sinceISO, untilISO, isMainRepo = false) {
  const range = [
    sinceISO ? `--since="${sinceISO}"` : null,
    untilISO ? `--until="${untilISO}"` : null,
  ]
    .filter(Boolean)
    .join(' ')
  // Combine numstat with commit meta per-commit for filtering
  const out = safeGit(
    `git -c core.quotepath=false log ${range} --no-merges --numstat --pretty=format:COMMIT:%H:::%ai:::%an:::%ae:::%s --date=iso-strict`,
    cwd,
  )
  const commits = []
  const changesByDir = new Map()
  let insertions = 0,
    deletions = 0,
    filesChanged = 0
  let cur = null
  const BOT_AUTHOR = /github-actions\[bot\]/i
  const BOT_EMAIL = /noreply@github\.com/i
  const BOT_SUBJ =
    /(submodule|sync submodule|update submodule|auto-merge|bump submodule|merge.*into|merged.*from)/i
  for (const raw of out.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('COMMIT:')) {
      // flush prev
      if (cur) {
        const onlyGitlink =
          cur.files.length > 0 && cur.files.every((f) => f.binary)
        const isBot =
          BOT_AUTHOR.test(cur.author) ||
          BOT_EMAIL.test(cur.email) ||
          BOT_SUBJ.test(cur.subject)
        // 对于主仓库，额外过滤只涉及子模块更新的commit
        const isSubmoduleOnly =
          isMainRepo &&
          cur.files.length > 0 &&
          cur.files.every((f) =>
            ['admin', 'backend', 'frontend'].includes(f.path),
          )
        if (!isBot && !onlyGitlink && !isSubmoduleOnly) {
          commits.push({
            hash: cur.hash,
            datetime: cur.datetime,
            subject: cur.subject,
            author: cur.author,
            email: cur.email,
          })
          // accumulate totals by files
          for (const f of cur.files) {
            insertions += f.ins
            deletions += f.del
            filesChanged += 1
            // 显示2-3层目录以展示核心位置
            const parts = (f.path || '').split(path.sep).filter(Boolean)
            let dirKey = parts[0] || ''
            if (
              parts.length > 1 &&
              ['admin', 'backend', 'frontend', 'src'].includes(parts[0])
            ) {
              dirKey = parts.slice(0, Math.min(3, parts.length)).join('/')
            }
            const score = (f.ins || 0) + (f.del || 0)
            changesByDir.set(dirKey, (changesByDir.get(dirKey) || 0) + score)
          }
        }
      }
      // start new
      const meta = line.replace('COMMIT:', '').split(':::')
      cur = {
        hash: meta[0] || '',
        datetime: meta[1] || '',
        author: meta[2] || '',
        email: meta[3] || '',
        subject: (meta.slice(4).join(':::') || '').trim(),
        files: [],
      }
      continue
    }
    // numstat line
    if (!cur) continue
    const parts = line.split('\t')
    if (parts.length < 3) continue
    const a = parts[0]
    const b = parts[1]
    const p = parts[2]
    const binary = a === '-' && b === '-'
    const ins = binary ? 0 : parseInt(a) || 0
    const del = binary ? 0 : parseInt(b) || 0
    cur.files.push({ path: p, binary, ins, del })
  }
  // flush last
  if (cur) {
    const onlyGitlink = cur.files.length > 0 && cur.files.every((f) => f.binary)
    const isBot =
      BOT_AUTHOR.test(cur.author) ||
      BOT_EMAIL.test(cur.email) ||
      BOT_SUBJ.test(cur.subject)
    const isSubmoduleOnly =
      isMainRepo &&
      cur.files.length > 0 &&
      cur.files.every((f) => ['admin', 'backend', 'frontend'].includes(f.path))
    if (!isBot && !onlyGitlink && !isSubmoduleOnly) {
      commits.push({
        hash: cur.hash,
        datetime: cur.datetime,
        subject: cur.subject,
        author: cur.author,
        email: cur.email,
      })
      for (const f of cur.files) {
        insertions += f.ins
        deletions += f.del
        filesChanged += 1
        const parts = (f.path || '').split(path.sep).filter(Boolean)
        let dirKey = parts[0] || ''
        if (
          parts.length > 1 &&
          ['admin', 'backend', 'frontend', 'src'].includes(parts[0])
        ) {
          dirKey = parts.slice(0, Math.min(3, parts.length)).join('/')
        }
        const score = (f.ins || 0) + (f.del || 0)
        changesByDir.set(dirKey, (changesByDir.get(dirKey) || 0) + score)
      }
    }
  }
  return { commits, changesByDir, insertions, deletions, filesChanged }
}

async function runProgress(outFile, repoRoot, sinceISO, untilISO) {
  const lang = String(args.lang || 'en').toLowerCase()
  const T = (k) =>
    ({
      en: {
        title: (days) =>
          `Dev progress — ProjectPrinting + submodules (${days})`,
        modules: 'Modules scanned',
        totalCommits: 'Total commits',
        totalFiles: 'Total files touched',
        totalLines: 'Total lines +/-',
        perModule: 'Per-module summary',
        heat: 'Heat by top-level directory (per module)',
        subjects: 'Commit subjects (up to 10 per module)',
        fromTo: (s, u) =>
          s && u ? `from ${s} to ${u}` : s ? `since ${s}` : 'recent',
      },
      zh: {
        title: (days) => `开发进展 — 主仓与子模块（${days}）`,
        modules: '扫描的模块',
        totalCommits: '提交总数',
        totalFiles: '触达文件总数',
        totalLines: '行变更合计 +/-',
        perModule: '按模块汇总',
        heat: '顶层目录热力（按模块）',
        subjects: '提交主题（每模块最多 10 条）',
        fromTo: (s, u) => (s && u ? `自 ${s} 至 ${u}` : s ? `自 ${s}` : '近期'),
      },
    }[lang][k])
  const modules = await getSubmodules(repoRoot)
  const moduleSummaries = [] // include main repo (ProjectPrinting)
  moduleSummaries.push({
    name: 'ProjectPrinting',
    path: '.',
    summary: summarizeRepo(repoRoot, sinceISO, untilISO, true),
  })
  for (const m of modules) {
    const modPath = path.join(repoRoot, m.path || '')
    const isGit = !!safeGit(
      'git rev-parse --is-inside-work-tree',
      modPath,
    ).trim()
    if (!isGit) continue
    moduleSummaries.push({
      name: m.name || m.path,
      path: m.path,
      summary: summarizeRepo(modPath, sinceISO, untilISO, false),
    })
  }
  let totalCommits = 0,
    totalFiles = 0,
    totalIns = 0,
    totalDel = 0
  for (const ms of moduleSummaries) {
    totalCommits += ms.summary.commits.length
    totalFiles += ms.summary.filesChanged
    totalIns += ms.summary.insertions
    totalDel += ms.summary.deletions
  }
  const days = T('fromTo')(sinceISO, untilISO)
  const lines = []
  lines.push(`# ${T('title')(days)}`, '')
  lines.push(
    `${T('modules')}: ${moduleSummaries.map((m) => m.name).join(', ')}`,
  )
  lines.push(`${T('totalCommits')}: ${totalCommits}`)
  lines.push(`${T('totalFiles')}: ${totalFiles}`)
  lines.push(`${T('totalLines')}: +${totalIns} / -${totalDel}`, '')
  lines.push(`## ${T('perModule')}`)
  for (const ms of moduleSummaries) {
    const { commits, filesChanged, insertions, deletions } = ms.summary
    lines.push(
      `- ${ms.name} (${ms.path}): commits=${commits.length}, files=${filesChanged}, +${insertions}/-${deletions}`,
    )
  }
  lines.push('')
  lines.push(`## ${T('heat')}`)
  for (const ms of moduleSummaries) {
    const entries = Array.from(ms.summary.changesByDir.entries()).sort(
      (a, b) => b[1] - a[1],
    )
    if (!entries.length) continue
    lines.push(`- ${ms.name}:`)
    for (const [dir, score] of entries.slice(0, 15)) {
      if (dir === '') continue
      lines.push(`  - ${dir}: ${score}`)
    }
  }
  lines.push('')
  lines.push(`## ${T('subjects')}`)
  for (const ms of moduleSummaries) {
    const top = ms.summary.commits.slice(0, 10)
    if (!top.length) continue
    lines.push(`- ${ms.name}:`)
    for (const c of top) lines.push(`  - [${c.date}] ${c.subject}`)
  }
  await fs.writeFile(outFile, lines.join('\n') + '\n')
  return outFile
}

// ---------- weekly composition ----------
async function runWeekly(
  outFile,
  repoRoot,
  sinceISO,
  untilISO,
  publish = false,
) {
  const outDir = path.dirname(outFile)
  await ensureDir(outDir)
  const lang = String(args.lang || '').toLowerCase()
  const suffix = lang && lang !== 'both' ? `.${lang}` : ''
  const T = (k) =>
    ({
      en: {
        title: (s, u) => `Weekly Report (${s || 'recent'} to ${u || 'now'})`,
        s1: '1. Code-derived metrics',
        s2: '2. Dev progress (ProjectPrinting + submodules)',
      },
      zh: {
        title: (s, u) => `周报（${s || '近期'} 至 ${u || '当前'}）`,
        s1: '1. 代码派生指标',
        s2: '2. 开发进展（主仓 + 子模块）',
      },
    }[lang === 'zh' || lang === 'en' ? lang : 'en'][k])

  // 先检查本周是否有commit，如果没有则不生成周报
  const modules = await getSubmodules(repoRoot)
  const moduleSummaries = []
  moduleSummaries.push({
    name: 'ProjectPrinting',
    path: '.',
    summary: summarizeRepo(repoRoot, sinceISO, untilISO),
  })
  for (const m of modules) {
    const modPath = path.join(repoRoot, m.path || '')
    const isGit = !!safeGit(
      'git rev-parse --is-inside-work-tree',
      modPath,
    ).trim()
    if (!isGit) continue
    moduleSummaries.push({
      name: m.name || m.path,
      path: m.path,
      summary: summarizeRepo(modPath, sinceISO, untilISO),
    })
  }
  let totalCommits = 0
  for (const ms of moduleSummaries) {
    totalCommits += ms.summary.commits.length
  }

  // 如果本周没有commit，则不生成周报
  if (totalCommits === 0) {
    // 仍然刷新索引，确保前端至少拿到空的 index.json
    try {
      await updateReportsIndex(outDir)
    } catch {}
    console.log(
      `Skip generating weekly report for ${sinceISO || 'recent'} to ${
        untilISO || 'now'
      }: no commits in this period`,
    )
    return null
  }

  const metricsFile = path.join(outDir, `metrics-estimates${suffix}.md`)
  const progressFile = path.join(
    outDir,
    `dev-progress-${sinceISO || 'recent'}_${untilISO || 'now'}${suffix}.md`,
  )

  // 只生成开发进展,移除重复的静态指标
  // const { data: metricsData } = await runMetrics(metricsFile, repoRoot)
  await runProgress(progressFile, repoRoot, sinceISO, untilISO)
  const lines = []
  lines.push(`# ${T('title')(sinceISO, untilISO)}`, '')
  // 移除静态指标部分
  // lines.push(`## ${T('s1')}`)
  // lines.push('', await fs.readFile(metricsFile, 'utf8'))
  lines.push(
    `## ${T('s2')
      .replace(/2\.\s*/, '')
      .replace(/^(.+?)（.+$/, '$1')}`,
  ) // 移除序号和括号说明
  lines.push('', await fs.readFile(progressFile, 'utf8'))
  await fs.writeFile(outFile, lines.join('\n'))
  // Write a paired JSON for viewer (best-effort)
  try {
    // Recompute light-weight progress summary for JSON (per-module details)
    const modules = await getSubmodules(repoRoot)
    const moduleSummaries = []
    moduleSummaries.push({
      name: 'ProjectPrinting',
      path: '.',
      summary: summarizeRepo(repoRoot, sinceISO, untilISO, true),
    })
    for (const m of modules) {
      const modPath = path.join(repoRoot, m.path || '')
      const isGit = !!safeGit(
        'git rev-parse --is-inside-work-tree',
        modPath,
      ).trim()
      if (!isGit) continue
      moduleSummaries.push({
        name: m.name || m.path,
        path: m.path,
        summary: summarizeRepo(modPath, sinceISO, untilISO, false),
      })
    }
    let totalCommits = 0,
      totalFiles = 0,
      totalIns = 0,
      totalDel = 0
    for (const ms of moduleSummaries) {
      totalCommits += ms.summary.commits.length
      totalFiles += ms.summary.filesChanged
      totalIns += ms.summary.insertions
      totalDel += ms.summary.deletions
    }
    // Panorama removed by user request — no longer included
    const jsonName = path.basename(outFile).replace(/\.md$/, '.json')
    const jsonFile = path.join(path.dirname(outFile), jsonName)
    const payload = {
      title: lines[0].replace(/^#\s*/, ''),
      lang: String(args.lang || '').toLowerCase() || 'en',
      since: sinceISO,
      until: untilISO,
      generatedAt: new Date().toISOString(),
      // metrics: metricsData, // 移除静态指标数据
      progress: {
        totals: {
          commits: totalCommits,
          files: totalFiles,
          added: totalIns,
          removed: totalDel,
        },
        modules: moduleSummaries.map((ms) => ({
          name: ms.name,
          path: ms.path,
          commits: ms.summary.commits.slice(0, 30).map((c) => ({
            hash: c.hash,
            datetime: c.datetime,
            subject: c.subject,
          })),
          files: ms.summary.filesChanged,
          added: ms.summary.insertions,
          removed: ms.summary.deletions,
          heat: Array.from(ms.summary.changesByDir.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15),
          subjects: ms.summary.commits.slice(0, 30).map((c) => c.subject),
        })),
      },
      // panorama removed — omit panorama field
    }
    await fs.writeFile(jsonFile, JSON.stringify(payload, null, 2))
  } catch {}
  // Always refresh index.json in the same output directory for the viewer
  try {
    await updateReportsIndex(path.dirname(outFile))
  } catch {}
  if (publish) {
    const pubDir = path.join(repoRoot, 'analysis', 'reports')
    await ensureDir(pubDir)
    const pubFile = path.join(pubDir, path.basename(outFile))
    await fs.writeFile(pubFile, lines.join('\n'))
    // copy paired json (if exists)
    try {
      const jsonSrc = path.join(
        path.dirname(outFile),
        path.basename(outFile).replace(/\.md$/, '.json'),
      )
      const jsonDst = path.join(
        pubDir,
        path.basename(outFile).replace(/\.md$/, '.json'),
      )
      const jsontxt = await fs.readFile(jsonSrc, 'utf8')
      await fs.writeFile(jsonDst, jsontxt)
    } catch {}
    // refresh index.json for viewer
    await updateReportsIndex(pubDir)
  }
  return outFile
}

function isoWeekKey(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z')
  const t = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  )
  const day = (t.getUTCDay() + 6) % 7
  t.setUTCDate(t.getUTCDate() - day + 3)
  const week1 = new Date(Date.UTC(t.getUTCFullYear(), 0, 4))
  const week =
    1 +
    Math.round(((t - week1) / 86400000 - 3 + ((week1.getUTCDay() + 6) % 7)) / 7)
  const y = t.getUTCFullYear()
  return `${y}-W${String(week).padStart(2, '0')}`
}

function prevIsoWeekSpanUTC(base = new Date()) {
  // 使用 UTC 计算：找到“本周一(UTC)”和“上周一(UTC)”
  const b = new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()),
  )
  const day = (b.getUTCDay() + 6) % 7 // Monday=0
  const thisMon = new Date(b)
  thisMon.setUTCDate(thisMon.getUTCDate() - day)
  const lastMon = new Date(thisMon)
  lastMon.setUTCDate(lastMon.getUTCDate() - 7)
  const lastSun = new Date(lastMon)
  lastSun.setUTCDate(lastSun.getUTCDate() + 6)
  const fmt = (d) => d.toISOString().slice(0, 10)
  const since = fmt(lastMon)
  const until = fmt(lastSun)
  const key = isoWeekKey(since)
  return { since, until, key }
}

async function runRetro(outDir, repoRoot, startISO, endISO, publish = false) {
  await ensureDir(outDir)
  const lang = String(args.lang || '').toLowerCase()
  const suffix = lang && lang !== 'both' ? `.${lang}` : ''
  // derive all commit dates across modules, then bin by ISO week
  const modules = await getSubmodules(repoRoot)
  const allDates = new Set()
  function collectDates(cwd) {
    const log = safeGit('git log --pretty=format:%ad --date=short', cwd)
    for (const line of log.split('\n').filter(Boolean)) {
      allDates.add(line.trim())
    }
  }
  collectDates(repoRoot)
  for (const m of modules) {
    const modPath = path.join(repoRoot, m.path || '')
    const isGit = !!safeGit(
      'git rev-parse --is-inside-work-tree',
      modPath,
    ).trim()
    if (isGit) collectDates(modPath)
  }
  const dates = Array.from(allDates)
    .filter((d) => (!startISO || d >= startISO) && (!endISO || d <= endISO))
    .sort()
  const byWeek = new Map()
  for (const d of dates) {
    const wk = isoWeekKey(d)
    if (!byWeek.has(wk)) byWeek.set(wk, { since: d, until: d })
    const w = byWeek.get(wk)
    if (d < w.since) w.since = d
    if (d > w.until) w.until = d
  }
  for (const [wk, span] of byWeek) {
    const outFile = path.join(outDir, `weekly-${wk}${suffix}.md`)
    // 使用 runWeekly 以便同时生成配套 JSON，前端可渲染富视图
    await runWeekly(outFile, repoRoot, span.since, span.until, publish)
  }
  // Ensure viewer index.json exists/updated in outDir regardless of publish
  try {
    await updateReportsIndex(outDir)
  } catch {}
  if (publish) {
    const pubDir = path.join(repoRoot, 'analysis', 'reports')
    await updateReportsIndex(pubDir)
  }
  // note: metrics are HEAD-based and not retroed here to avoid false historical claims
  return outDir
}

// ---------- main ----------
async function main() {
  const cmd = getCmd()
  const repoRoot = process.cwd()
  const outDir = args.outDir || path.join(repoRoot, 'analysis', 'out')
  await ensureDir(outDir)
  const sinceISO =
    args.since ||
    (args.sinceDays ? sinceDateISO(parseInt(args.sinceDays)) : null)
  const untilISO = args.until || null

  if (cmd === 'metrics') {
    const original = args.lang
    if (String(args.lang).toLowerCase() === 'both') {
      for (const l of ['zh', 'en']) {
        args.lang = l
        const out = path.join(outDir, `metrics-estimates.${l}.md`)
        await runMetrics(out, repoRoot)
        console.log(out)
      }
      args.lang = original
    } else if (['zh', 'en'].includes(String(args.lang || '').toLowerCase())) {
      const l = String(args.lang).toLowerCase()
      const out = path.join(outDir, `metrics-estimates.${l}.md`)
      await runMetrics(out, repoRoot)
      console.log(out)
    } else {
      const out = path.join(outDir, 'metrics-estimates.md')
      await runMetrics(out, repoRoot)
      console.log(out)
    }
  } else if (cmd === 'progress') {
    const stamp = `${sinceISO || 'recent'}_${untilISO || 'now'}`
    const original = args.lang
    if (String(args.lang).toLowerCase() === 'both') {
      for (const l of ['zh', 'en']) {
        args.lang = l
        const out = path.join(outDir, `dev-progress-${stamp}.${l}.md`)
        await runProgress(out, repoRoot, sinceISO, untilISO)
        console.log(out)
      }
      args.lang = original
    } else if (['zh', 'en'].includes(String(args.lang || '').toLowerCase())) {
      const l = String(args.lang).toLowerCase()
      const out = path.join(outDir, `dev-progress-${stamp}.${l}.md`)
      await runProgress(out, repoRoot, sinceISO, untilISO)
      console.log(out)
    } else {
      const out = path.join(outDir, `dev-progress-${stamp}.md`)
      await runProgress(out, repoRoot, sinceISO, untilISO)
      console.log(out)
    }
  } else if (cmd === 'weekly') {
    // 默认：上一整周（ISO 周，周一至周日）
    let span
    if (sinceISO || untilISO) {
      const s = sinceISO || null
      const u = untilISO || null
      const key = s ? isoWeekKey(s) : 'recent'
      span = { since: s, until: u, key }
    } else {
      span = prevIsoWeekSpanUTC(new Date())
    }
    const publish = String(args.publish || 'false') === 'true'
    const original = args.lang
    if (String(args.lang).toLowerCase() === 'both') {
      for (const l of ['zh', 'en']) {
        args.lang = l
        const out = path.join(outDir, `weekly-${span.key}.${l}.md`)
        const result = await runWeekly(
          out,
          repoRoot,
          span.since,
          span.until,
          publish,
        )
        if (result) console.log(result)
      }
      args.lang = original
    } else if (['zh', 'en'].includes(String(args.lang || '').toLowerCase())) {
      const l = String(args.lang).toLowerCase()
      const out = path.join(outDir, `weekly-${span.key}.${l}.md`)
      const result = await runWeekly(
        out,
        repoRoot,
        span.since,
        span.until,
        publish,
      )
      if (result) console.log(result)
    } else {
      const out = path.join(outDir, `weekly-${span.key}.md`)
      const result = await runWeekly(
        out,
        repoRoot,
        span.since,
        span.until,
        publish,
      )
      if (result) console.log(result)
    }
  } else if (cmd === 'retro') {
    const startISO = args.start || null
    const endISO = args.end || null
    // 将 retro 的输出直接写入提供的 outDir 根目录，便于前端使用 out/index.json
    const out = outDir
    const publish = String(args.publish || 'false') === 'true'
    const original = args.lang
    if (String(args.lang).toLowerCase() === 'both') {
      for (const l of ['zh', 'en']) {
        args.lang = l
        await runRetro(out, repoRoot, startISO, endISO, publish)
      }
      args.lang = original
    } else {
      await runRetro(out, repoRoot, startISO, endISO, publish)
    }
    console.log(out)
  } else {
    console.error(
      'Usage: node analysis/tools/pp-report.mjs <metrics|progress|weekly|retro> [--sinceDays=N|--since=YYYY-MM-DD] [--until=YYYY-MM-DD] [--outDir=dir] [--includeCaps=true|false] [--publish=true|false]',
    )
    process.exit(2)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
