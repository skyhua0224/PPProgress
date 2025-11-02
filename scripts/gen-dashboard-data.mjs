#!/usr/bin/env node
/**
 * Generate real data JSON for the dashboard without exposing secrets to the browser.
 *
 * Outputs (under analysis/reports/out):
 * - account-stats.json: account-wide commits (year/week) and 90-day heatmap (requires GITHUB_TOKEN)
 * - project-stats.json: repo-level trends, SLOC total, module commits, recent commits (from local git)
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_xxx node analysis/tools/gen-dashboard-data.mjs --username=<github_name> --days=90
 */

import { spawnSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function tryGitRoot(cwd) {
  try {
    const res = spawnSync('git', ['rev-parse', '--show-toplevel'], {
      cwd,
      encoding: 'utf8',
    })
    if (res.status === 0 && res.stdout) return res.stdout.trim()
  } catch {}
  return null
}

const FALLBACK_DIR = path.resolve(__dirname, '../../')
const ROOT =
  tryGitRoot(process.cwd()) || tryGitRoot(FALLBACK_DIR) || FALLBACK_DIR
// Allow caller to override output directory so orchestrator can direct outputs into its TMP_OUT
const argPairs = process.argv.slice(2).map((a) => {
  const [k, v] = a.split('=')
  return [k.replace(/^--/, ''), v ?? true]
})
const args = Object.fromEntries(argPairs)
const REPORT_OUT = args.outDir
  ? path.resolve(args.outDir)
  : path.resolve(ROOT, 'analysis/reports/out')

// args is defined above to include potential outDir

const USERNAME = args.username || 'skyhua0224'
const DAYS = Number(args.days || 90) // 账户热力图默认 90 天
// 提交趋势与模块窗口默认固定为 30 天（除非显式传入）
const TREND_DAYS = args.trendDays !== undefined ? Number(args.trendDays) : 30
const MODULE_DAYS = args.moduleDays !== undefined ? Number(args.moduleDays) : 30
const YEAR_DAYS = 365
const MONTH_BUCKETS = Number(args.monthBuckets || 12)
const WEEK_DAYS = Number(args.weekDays || 7)
const TOKEN = process.env.GITHUB_TOKEN || ''

function sh(cmd, opts = {}) {
  const res = spawnSync(cmd, {
    shell: true,
    cwd: ROOT,
    encoding: 'utf8',
    ...opts,
  })
  if (res.status !== 0) {
    const err = new Error(`Command failed: ${cmd}\n${res.stderr}`)
    err.stdout = res.stdout
    err.stderr = res.stderr
    throw err
  }
  return res.stdout
}

// ---- filtering helpers (module scope so all functions can use) ----
const BOT_AUTHOR_PATTERNS = [/github-actions\[bot\]/i, /github\s*actions/i]
const BOT_EMAIL_PATTERNS = [/noreply@github\.com/i, /bot@/i]
const BOT_SUBJECT_PATTERNS = [
  /submodule/i,
  /sync submodule/i,
  /update submodule/i,
  /bump submodule/i,
  /auto-merge/i,
]
function isBotCommit(author, email, subject) {
  const a = author || ''
  const e = email || ''
  const s = subject || ''
  if (BOT_AUTHOR_PATTERNS.some((re) => re.test(a))) return true
  if (BOT_EMAIL_PATTERNS.some((re) => re.test(e))) return true
  if (BOT_SUBJECT_PATTERNS.some((re) => re.test(s))) return true
  return false
}

function runGit(args = []) {
  // Ensure file paths are not quoted/escaped so we can map modules reliably
  const res = spawnSync('git', ['-c', 'core.quotepath=false', ...args], {
    cwd: ROOT,
    encoding: 'utf8',
  })
  if (res.status !== 0) {
    const err = new Error(
      `Command failed: git ${args.join(' ')}\n${res.stderr}`,
    )
    err.stdout = res.stdout
    err.stderr = res.stderr
    throw err
  }
  return res.stdout
}

function sinceArg(days) {
  const d = new Date()
  d.setDate(d.getDate() - Number(days || 0))
  const ymd = d.toISOString().slice(0, 10) // YYYY-MM-DD
  return `--since=${ymd}`
}

function rangeArgs(sinceISO, untilISO) {
  const args = []
  if (sinceISO) args.push(`--since=${sinceISO}`)
  if (untilISO) args.push(`--until=${untilISO}`)
  return args
}

async function loadModuleConfig() {
  const defaultConfig = {
    allowed: ['admin', 'backend', 'frontend'],
    alias: { '': 'root' },
  }
  const candidatePaths = [
    path.join(ROOT, 'modules.config.json'),
    path.join(ROOT, 'modules.config.example.json'),
    path.join(ROOT, 'analysis/reports/modules.config.json'), // backward compat
  ]
  for (const p of candidatePaths) {
    try {
      const buf = await fs.readFile(p, 'utf8')
      const cfg = JSON.parse(buf)
      const allowed =
        Array.isArray(cfg.allowed) && cfg.allowed.length
          ? cfg.allowed
          : defaultConfig.allowed
      const alias =
        typeof cfg.alias === 'object' && cfg.alias
          ? cfg.alias
          : defaultConfig.alias
      return { allowed, alias }
    } catch {}
  }
  return defaultConfig
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}

// ---------------- Account stats via GitHub GraphQL ----------------
async function fetchAccountStats() {
  if (!TOKEN) {
    return {
      username: USERNAME,
      generatedAt: new Date().toISOString(),
      yearCommits: 0,
      weekCommits: 0,
      heatmap: {},
      source: 'fallback-no-token',
    }
  }
  const since = new Date()
  since.setDate(since.getDate() - DAYS)

  const query = `
    query($login:String!) {
      user(login:$login) {
        contributionsCollection {
          contributionCalendar { weeks { contributionDays { date contributionCount } } }
          totalCommitContributions
        }
      }
    }
  `

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { login: USERNAME } }),
  })

  if (!res.ok) throw new Error(`GitHub GraphQL failed: ${res.status}`)
  const json = await res.json()
  const weeks =
    json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks || []
  const heatmap = {}
  for (const w of weeks) {
    for (const d of w.contributionDays) {
      heatmap[d.date] = d.contributionCount
    }
  }

  // compute yearCommits from GraphQL total; week commits from last 7 days
  const yearCommits =
    json?.data?.user?.contributionsCollection?.totalCommitContributions || 0
  const last7 = Object.entries(heatmap)
    .filter(([date]) => Date.now() - new Date(date).getTime() <= 7 * 86400000)
    .reduce((s, [, c]) => s + (c || 0), 0)

  return {
    username: USERNAME,
    generatedAt: new Date().toISOString(),
    yearCommits,
    weekCommits: last7,
    heatmap,
    source: 'github-graphql',
  }
}

// ---------------- Project stats via local git ----------------
function collectCommitTrend(days = 30) {
  const s = sinceArg(days)
  const out = runGit(['log', s, '--no-merges', '--pretty=%ad', '--date=short'])
  const map = {}
  const lines = out.trim().split(/\r?\n/).filter(Boolean)
  for (const line of lines) {
    map[line] = (map[line] || 0) + 1
  }
  const result = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    result.push({ date: key, count: map[key] || 0 })
  }
  return result
}

function collectModuleCommits(days = 30, moduleConfig) {
  const s = sinceArg(days)
  const out = runGit([
    'log',
    s,
    '--no-merges',
    '--name-only',
    '--pretty=format:COMMIT:%H|%an|%ae|%s',
  ])
  const counts = new Map()
  const allowed = new Set(moduleConfig.allowed)
  const lines = out.split(/\r?\n/)
  let currentModules = new Set()
  let currentAuthor = '',
    currentEmail = '',
    currentSubject = ''
  for (const line of lines) {
    if (!line) continue
    if (line.startsWith('COMMIT:')) {
      // commit boundary: add 1 for each module touched in last commit
      if (!isBotCommit(currentAuthor, currentEmail, currentSubject)) {
        for (const m of currentModules) counts.set(m, (counts.get(m) || 0) + 1)
      }
      currentModules = new Set()
      const meta = line.replace('COMMIT:', '').split('|')
      currentAuthor = meta[1] || ''
      currentEmail = meta[2] || ''
      currentSubject = meta.slice(3).join('|') || ''
      continue
    }
    const file = line.trim()
    if (!file || file === '---') continue
    const seg = file.includes('/') ? file.split('/')[0] : '' // '' means root
    const moduleName = seg === '' ? moduleConfig.alias[''] || 'root' : seg
    if (allowed.has(moduleName)) currentModules.add(moduleName)
  }
  // flush last commit
  if (!isBotCommit(currentAuthor, currentEmail, currentSubject)) {
    for (const m of currentModules) counts.set(m, (counts.get(m) || 0) + 1)
  }
  // seed zero for missing allowed modules
  for (const name of moduleConfig.allowed)
    if (!counts.has(name)) counts.set(name, 0)
  // stable order: by allowed list order
  const order = new Map(moduleConfig.allowed.map((n, i) => [n, i]))
  return Array.from(counts.entries())
    .sort((a, b) => (order.get(a[0]) ?? 9999) - (order.get(b[0]) ?? 9999))
    .map(([name, commits]) => ({ name, commits }))
}

function collectTotalsByModule(days = 7, moduleConfig) {
  const s = sinceArg(days)
  const allowed = new Set(moduleConfig.allowed)
  const byModule = new Map() // name -> { added, removed, commits }

  // 收集主仓库的 root 数据
  const out = runGit([
    'log',
    s,
    '--no-merges',
    '--numstat',
    '--pretty=format:COMMIT:%H|%an|%ae|%s',
  ])

  let commitModules = new Set()
  let currentAuthor = '',
    currentEmail = '',
    currentSubject = ''
  let onlyGitlink = true
  const lines = out.split(/\r?\n/)
  for (const line of lines) {
    if (!line) continue
    if (line.startsWith('COMMIT:')) {
      // flush previous commit - 主仓库只统计非bot非自动合并的提交
      if (
        !isBotCommit(currentAuthor, currentEmail, currentSubject) &&
        !onlyGitlink
      ) {
        for (const name of commitModules) {
          const rec = byModule.get(name) || { added: 0, removed: 0, commits: 0 }
          rec.commits += 1
          byModule.set(name, rec)
        }
      }
      // reset state for new commit
      commitModules = new Set()
      onlyGitlink = true
      const meta = line.replace('COMMIT:', '').split('|')
      currentAuthor = meta[1] || ''
      currentEmail = meta[2] || ''
      currentSubject = meta.slice(3).join('|') || ''
      continue
    }
    const m = line.match(/^(\d+)\s+(\d+)\s+(.+)$/)
    if (!m) {
      // handle binary changes like -  -  path (could be submodule pointer)
      const mb = line.match(/^[-]+\s+[-]+\s+(.+)$/)
      if (mb) {
        const file = mb[1]
        const seg = file.includes('/') ? file.split('/')[0] : ''
        const moduleName = seg === '' ? moduleConfig.alias[''] || 'root' : seg
        if (allowed.has(moduleName)) commitModules.add(moduleName)
      }
      continue
    }
    const a = Number(m[1] || 0)
    const r = Number(m[2] || 0)
    const file = m[3]
    const seg = file.includes('/') ? file.split('/')[0] : ''
    const moduleName = seg === '' ? moduleConfig.alias[''] || 'root' : seg
    if (!allowed.has(moduleName)) continue
    const rec = byModule.get(moduleName) || { added: 0, removed: 0, commits: 0 }
    rec.added += isNaN(a) ? 0 : a
    rec.removed += isNaN(r) ? 0 : r
    byModule.set(moduleName, rec)
    commitModules.add(moduleName)
    if ((a || 0) + (r || 0) > 0) onlyGitlink = false
  }
  // flush last commit
  if (
    !isBotCommit(currentAuthor, currentEmail, currentSubject) &&
    !onlyGitlink
  ) {
    for (const name of commitModules) {
      const rec = byModule.get(name) || { added: 0, removed: 0, commits: 0 }
      rec.commits += 1
      byModule.set(name, rec)
    }
  }

  // 递归扫描子模块
  for (const moduleName of moduleConfig.allowed) {
    if (moduleName === 'root') continue
    const submodulePath = path.join(ROOT, moduleName)
    try {
      // 检查是否存在且是 git 仓库
      const gitDir = path.join(submodulePath, '.git')
      try {
        spawnSync('test', ['-e', gitDir], { shell: true })
      } catch {
        continue
      }

      // 在子模块中运行 git log
      const subOut = spawnSync(
        'git',
        [
          '-c',
          'core.quotepath=false',
          'log',
          s,
          '--no-merges',
          '--numstat',
          '--pretty=format:COMMIT:%H|%an|%ae|%s',
        ],
        {
          cwd: submodulePath,
          encoding: 'utf8',
        },
      )

      if (subOut.status !== 0) continue

      let subCommitModules = new Set()
      let subAuthor = '',
        subEmail = '',
        subSubject = ''
      let subOnlyGitlink = true

      for (const line of subOut.stdout.split(/\r?\n/)) {
        if (!line) continue
        if (line.startsWith('COMMIT:')) {
          // flush previous commit for this submodule
          if (
            !isBotCommit(subAuthor, subEmail, subSubject) &&
            !subOnlyGitlink
          ) {
            const rec = byModule.get(moduleName) || {
              added: 0,
              removed: 0,
              commits: 0,
            }
            rec.commits += 1
            byModule.set(moduleName, rec)
          }
          // reset
          subCommitModules = new Set()
          subOnlyGitlink = true
          const meta = line.replace('COMMIT:', '').split('|')
          subAuthor = meta[1] || ''
          subEmail = meta[2] || ''
          subSubject = meta.slice(3).join('|') || ''
          continue
        }
        const m = line.match(/^(\d+)\s+(\d+)\s+(.+)$/)
        if (!m) {
          const mb = line.match(/^[-]+\s+[-]+\s+(.+)$/)
          if (mb) continue
          continue
        }
        const a = Number(m[1] || 0)
        const r = Number(m[2] || 0)
        const rec = byModule.get(moduleName) || {
          added: 0,
          removed: 0,
          commits: 0,
        }
        rec.added += isNaN(a) ? 0 : a
        rec.removed += isNaN(r) ? 0 : r
        byModule.set(moduleName, rec)
        if ((a || 0) + (r || 0) > 0) subOnlyGitlink = false
      }
      // flush last commit for submodule
      if (!isBotCommit(subAuthor, subEmail, subSubject) && !subOnlyGitlink) {
        const rec = byModule.get(moduleName) || {
          added: 0,
          removed: 0,
          commits: 0,
        }
        rec.commits += 1
        byModule.set(moduleName, rec)
      }
    } catch (err) {
      // 子模块不存在或不是 git 仓库,跳过
      console.warn(
        `[collectTotalsByModule] Skip submodule ${moduleName}: ${err.message}`,
      )
    }
  }

  let totalAdded = 0
  let totalRemoved = 0
  let totalCommits = 0
  for (const rec of byModule.values()) {
    totalAdded += rec.added
    totalRemoved += rec.removed
    totalCommits += rec.commits
  }
  const activeModules = Array.from(byModule.keys()).length
  const files = 0 // not tracked per module in this method; keep 0 or compute separately if needed
  return {
    commits: totalCommits,
    added: totalAdded,
    removed: totalRemoved,
    files,
    activeModules,
    byModule: Object.fromEntries(byModule),
  }
}

function collectTotalsByModuleInRange(sinceISO, untilISO, moduleConfig) {
  const range = rangeArgs(sinceISO, untilISO)
  const out = runGit([
    'log',
    ...range,
    '--no-merges',
    '--numstat',
    '--pretty=format:COMMIT:%H|%an|%ae|%s',
  ])
  const allowed = new Set(moduleConfig.allowed)
  const byModule = new Map()
  const commitModules = new Set()
  let currentAuthor = '',
    currentEmail = '',
    currentSubject = ''
  let onlyGitlink = true
  const lines = out.split(/\r?\n/)
  for (const line of lines) {
    if (!line) continue
    if (line.startsWith('COMMIT:')) {
      if (
        !isBotCommit(currentAuthor, currentEmail, currentSubject) &&
        !onlyGitlink
      ) {
        for (const name of commitModules) {
          const rec = byModule.get(name) || { added: 0, removed: 0, commits: 0 }
          rec.commits += 1
          byModule.set(name, rec)
        }
      }
      commitModules.clear()
      onlyGitlink = true
      const meta = line.replace('COMMIT:', '').split('|')
      currentAuthor = meta[1] || ''
      currentEmail = meta[2] || ''
      currentSubject = meta.slice(3).join('|') || ''
      continue
    }
    const m = line.match(/^(\d+)\s+(\d+)\s+(.+)$/)
    if (!m) {
      const mb = line.match(/^[-]+\s+[-]+\s+(.+)$/)
      if (mb) {
        const file = mb[1]
        const seg = file.includes('/') ? file.split('/')[0] : ''
        const moduleName = seg === '' ? moduleConfig.alias[''] || 'root' : seg
        if (allowed.has(moduleName)) commitModules.add(moduleName)
        continue
      }
      continue
    }
    const a = Number(m[1] || 0)
    const r = Number(m[2] || 0)
    const file = m[3]
    const seg = file.includes('/') ? file.split('/')[0] : ''
    const moduleName = seg === '' ? moduleConfig.alias[''] || 'root' : seg
    if (!allowed.has(moduleName)) continue
    const rec = byModule.get(moduleName) || { added: 0, removed: 0, commits: 0 }
    rec.added += isNaN(a) ? 0 : a
    rec.removed += isNaN(r) ? 0 : r
    byModule.set(moduleName, rec)
    commitModules.add(moduleName)
    if ((a || 0) + (r || 0) > 0) onlyGitlink = false
  }
  if (
    !isBotCommit(currentAuthor, currentEmail, currentSubject) &&
    !onlyGitlink
  ) {
    for (const name of commitModules) {
      const rec = byModule.get(name) || { added: 0, removed: 0, commits: 0 }
      rec.commits += 1
      byModule.set(name, rec)
    }
  }

  // 递归扫描子模块
  for (const moduleName of moduleConfig.allowed) {
    if (moduleName === 'root') continue
    const submodulePath = path.join(ROOT, moduleName)
    try {
      const subOut = spawnSync(
        'git',
        [
          '-c',
          'core.quotepath=false',
          'log',
          ...range,
          '--no-merges',
          '--numstat',
          '--pretty=format:COMMIT:%H|%an|%ae|%s',
        ],
        {
          cwd: submodulePath,
          encoding: 'utf8',
        },
      )

      if (subOut.status !== 0) continue

      let subCommitModules = new Set()
      let subAuthor = '',
        subEmail = '',
        subSubject = ''
      let subOnlyGitlink = true

      for (const line of subOut.stdout.split(/\r?\n/)) {
        if (!line) continue
        if (line.startsWith('COMMIT:')) {
          if (
            !isBotCommit(subAuthor, subEmail, subSubject) &&
            !subOnlyGitlink
          ) {
            const rec = byModule.get(moduleName) || {
              added: 0,
              removed: 0,
              commits: 0,
            }
            rec.commits += 1
            byModule.set(moduleName, rec)
          }
          subCommitModules = new Set()
          subOnlyGitlink = true
          const meta = line.replace('COMMIT:', '').split('|')
          subAuthor = meta[1] || ''
          subEmail = meta[2] || ''
          subSubject = meta.slice(3).join('|') || ''
          continue
        }
        const m = line.match(/^(\d+)\s+(\d+)\s+(.+)$/)
        if (!m) continue
        const a = Number(m[1] || 0)
        const r = Number(m[2] || 0)
        const rec = byModule.get(moduleName) || {
          added: 0,
          removed: 0,
          commits: 0,
        }
        rec.added += isNaN(a) ? 0 : a
        rec.removed += isNaN(r) ? 0 : r
        byModule.set(moduleName, rec)
        if ((a || 0) + (r || 0) > 0) subOnlyGitlink = false
      }
      if (!isBotCommit(subAuthor, subEmail, subSubject) && !subOnlyGitlink) {
        const rec = byModule.get(moduleName) || {
          added: 0,
          removed: 0,
          commits: 0,
        }
        rec.commits += 1
        byModule.set(moduleName, rec)
      }
    } catch (err) {
      console.warn(
        `[collectTotalsByModuleInRange] Skip submodule ${moduleName}: ${err.message}`,
      )
    }
  }

  let totalAdded = 0
  let totalRemoved = 0
  let totalCommits = 0
  for (const rec of byModule.values()) {
    totalAdded += rec.added
    totalRemoved += rec.removed
    totalCommits += rec.commits
  }
  const activeModules = Array.from(byModule.keys()).length
  return {
    commits: totalCommits,
    added: totalAdded,
    removed: totalRemoved,
    files: 0,
    activeModules,
    byModule: Object.fromEntries(byModule),
  }
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
}
function fmtYMD(d) {
  return d.toISOString().slice(0, 10)
}
function fmtYM(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

async function countSloc(dir, options = {}) {
  const exts = new Set(
    options.exts || [
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.mjs',
      '.cjs',
      '.java',
      '.kt',
      '.go',
      '.py',
      '.rb',
      '.rs',
      '.php',
      '.cpp',
      '.c',
      '.h',
      '.cs',
      '.scss',
      '.sass',
      '.less',
      '.css',
      '.html',
    ],
  )
  const ignoreDirs = new Set(
    options.ignore || [
      '.git',
      'node_modules',
      'target',
      'build',
      'dist',
      'logs',
      'out',
      '.next',
      '.cache',
    ],
  )
  let total = 0
  async function walk(p) {
    const entries = await fs.readdir(p, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(p, e.name)
      if (e.isDirectory()) {
        if (ignoreDirs.has(e.name)) continue
        await walk(full)
      } else if (e.isFile()) {
        const ext = path.extname(e.name)
        if (!exts.has(ext)) continue
        const data = await fs.readFile(full, 'utf8').catch(() => '')
        if (!data) continue
        total += (data.match(/\n/g)?.length || 0) + 1
      }
    }
  }
  await walk(dir)
  return total
}

async function buildProjectStats() {
  const moduleConfig = await loadModuleConfig()
  const commitTrend = collectCommitTrend(TREND_DAYS)
  const commitTrend365 = collectCommitTrend(YEAR_DAYS)
  // 按模块的提交趋势（最近 TREND_DAYS 与最近一年）
  function collectCommitTrendByModule(days, moduleCfg) {
    const s = sinceArg(days)
    const out = runGit([
      'log',
      s,
      '--no-merges',
      '--name-only',
      '--pretty=format:COMMIT:%ad|%H|%an|%ae|%s',
      '--date=short',
    ])
    const allowed = new Set(moduleCfg.allowed)
    // module -> date -> count
    const modDateCount = new Map()
    let currentDate = null
    let currentMods = new Set()
    let currentAuthor = '',
      currentEmail = '',
      currentSubject = ''
    for (const line of out.split(/\r?\n/)) {
      if (!line) continue
      if (line.startsWith('COMMIT:')) {
        // flush previous
        if (
          currentDate &&
          currentMods.size &&
          !isBotCommit(currentAuthor, currentEmail, currentSubject)
        ) {
          for (const m of currentMods) {
            const dm = modDateCount.get(m) || new Map()
            dm.set(currentDate, (dm.get(currentDate) || 0) + 1)
            modDateCount.set(m, dm)
          }
        }
        // reset for new commit
        const parts = line.replace('COMMIT:', '').split('|')
        currentDate = (parts[0] || '').trim()
        currentAuthor = parts[2] || ''
        currentEmail = parts[3] || ''
        currentSubject = parts.slice(4).join('|') || ''
        currentMods = new Set()
        continue
      }
      const file = line.trim()
      if (!file || file === '---') continue
      const seg = file.includes('/') ? file.split('/')[0] : ''
      const moduleName = seg === '' ? moduleCfg.alias[''] || 'root' : seg
      if (allowed.has(moduleName)) currentMods.add(moduleName)
    }
    // flush last
    if (
      currentDate &&
      currentMods.size &&
      !isBotCommit(currentAuthor, currentEmail, currentSubject)
    ) {
      for (const m of currentMods) {
        const dm = modDateCount.get(m) || new Map()
        dm.set(currentDate, (dm.get(currentDate) || 0) + 1)
        modDateCount.set(m, dm)
      }
    }
    // build sequences for each allowed module for the past N days
    const today = new Date()
    const seqByModule = {}
    for (const name of moduleCfg.allowed) {
      const dm = modDateCount.get(name) || new Map()
      const seq = []
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        seq.push({ date: key, count: dm.get(key) || 0 })
      }
      seqByModule[name] = seq
    }
    return seqByModule
  }
  const trend30ByModule = collectCommitTrendByModule(TREND_DAYS, moduleConfig)
  const trend365ByModule = collectCommitTrendByModule(YEAR_DAYS, moduleConfig)

  // 为子模块单独收集提交趋势数据
  function collectSubmoduleTrend(moduleName, days) {
    if (moduleName === 'root') return []
    const submodulePath = path.join(ROOT, moduleName)
    try {
      const s = sinceArg(days)
      const subOut = spawnSync(
        'git',
        [
          '-c',
          'core.quotepath=false',
          'log',
          s,
          '--no-merges',
          '--pretty=format:%ad',
          '--date=short',
        ],
        {
          cwd: submodulePath,
          encoding: 'utf8',
        },
      )

      if (subOut.status !== 0) return []

      const dateCount = new Map()
      subOut.stdout
        .split(/\r?\n/)
        .filter(Boolean)
        .forEach((date) => {
          dateCount.set(date, (dateCount.get(date) || 0) + 1)
        })

      const today = new Date()
      const seq = []
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        seq.push({ date: key, count: dateCount.get(key) || 0 })
      }
      return seq
    } catch (err) {
      console.warn(`[collectSubmoduleTrend] Skip ${moduleName}: ${err.message}`)
      return []
    }
  }

  const commitTrendByModule = {}
  for (const name of moduleConfig.allowed) {
    if (name === 'root') {
      // 主仓库使用原有逻辑
      commitTrendByModule[name] = {
        last30: trend30ByModule[name] || [],
        year: trend365ByModule[name] || [],
      }
    } else {
      // 子模块从子仓库直接收集
      const sub30 = collectSubmoduleTrend(name, TREND_DAYS)
      const sub365 = collectSubmoduleTrend(name, YEAR_DAYS)
      commitTrendByModule[name] = {
        last30: sub30,
        year: sub365,
      }
    }
  }
  const moduleCommits = collectModuleCommits(MODULE_DAYS, moduleConfig)
  const weekTotals = collectTotalsByModule(WEEK_DAYS, moduleConfig)
  const monthTotals = collectTotalsByModule(MODULE_DAYS, moduleConfig)
  const yearTotals = collectTotalsByModule(YEAR_DAYS, moduleConfig)
  // Monthly buckets for last N months (calendar months)
  const months = []
  const now = new Date()
  for (let i = 0; i < MONTH_BUCKETS; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const s = startOfMonth(d)
    const e = endOfMonth(d)
    const totals = collectTotalsByModuleInRange(
      fmtYMD(s),
      fmtYMD(e),
      moduleConfig,
    )
    months.push({ month: fmtYM(d), totals, byModule: totals.byModule })
  }
  const slocTotal = await countSloc(ROOT)
  // 最近一年提交 + 按提交归属到模块（用于前端模块筛选最近提交）
  function collectRecentCommitsWithModules(days, moduleCfg) {
    const since = sinceArg(days)
    const allowed = new Set(moduleCfg.allowed)
    const allCommits = []

    // 1. 收集主仓库的非自动合并提交
    const meta = runGit([
      'log',
      since,
      '--no-merges',
      '--pretty=format:%H|%ad|%an|%ae|%s',
      '--date=iso',
    ])
    const names = runGit([
      'log',
      since,
      '--no-merges',
      '--name-only',
      '--pretty=format:COMMIT:%H',
    ])
    const modulesByHash = new Map()
    let currentHash = null
    let currentMods = new Set()
    for (const line of names.split(/\r?\n/)) {
      if (!line) continue
      if (line.startsWith('COMMIT:')) {
        if (currentHash && currentMods.size) {
          modulesByHash.set(currentHash, Array.from(currentMods))
        }
        currentHash = line.substring('COMMIT:'.length)
        currentMods = new Set()
        continue
      }
      const file = line.trim()
      if (!file || file === '---') continue
      const seg = file.includes('/') ? file.split('/')[0] : ''
      const moduleName = seg === '' ? moduleCfg.alias[''] || 'root' : seg
      if (allowed.has(moduleName)) currentMods.add(moduleName)
    }
    if (currentHash && currentMods.size) {
      modulesByHash.set(currentHash, Array.from(currentMods))
    }

    // 主仓库提交（过滤机器人/自动合并等噪声提交）
    meta
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach((l) => {
        const [hash, datetime, author, email, ...rest] = l.split('|')
        const subject = rest.join('|')
        if (isBotCommit(author, email, subject)) return
        allCommits.push({
          hash,
          datetime,
          author,
          email,
          subject,
          modules: modulesByHash.get(hash) || [],
        })
      })

    // 2. 收集所有子模块的全部提交
    for (const moduleName of moduleCfg.allowed) {
      if (moduleName === 'root') continue
      const submodulePath = path.join(ROOT, moduleName)
      try {
        const subMeta = spawnSync(
          'git',
          [
            '-c',
            'core.quotepath=false',
            'log',
            since,
            '--no-merges',
            '--pretty=format:%H|%ad|%an|%ae|%s',
            '--date=iso',
          ],
          {
            cwd: submodulePath,
            encoding: 'utf8',
          },
        )

        if (subMeta.status !== 0) continue

        subMeta.stdout
          .split(/\r?\n/)
          .filter(Boolean)
          .forEach((l) => {
            const [hash, datetime, author, email, ...rest] = l.split('|')
            const subject = rest.join('|')
            allCommits.push({
              hash: `${moduleName}-${hash}`,
              datetime,
              author,
              email,
              subject,
              modules: [moduleName],
            })
          })
      } catch (err) {
        console.warn(
          `[collectRecentCommitsWithModules] Skip ${moduleName}: ${err.message}`,
        )
      }
    }

    // 按时间排序并限制数量(增加到5000条)
    return allCommits
      .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
      .slice(0, 5000)
  }
  const recentCommits = collectRecentCommitsWithModules(YEAR_DAYS, moduleConfig)
  return {
    generatedAt: new Date().toISOString(),
    repo: path.basename(ROOT),
    modulesAllowed: moduleConfig.allowed,
    windows: {
      trendDays: TREND_DAYS,
      moduleDays: MODULE_DAYS,
      weekDays: WEEK_DAYS,
    },
    slocTotal,
    commitTrend,
    commitTrend365,
    commitTrendByModule,
    moduleCommits,
    weekTotals,
    monthTotals,
    yearTotals,
    months,
    recentCommits,
    source: 'local-git',
  }
}

async function main() {
  await ensureDir(REPORT_OUT)
  // Account stats
  let account = await fetchAccountStats().catch((err) => {
    console.error('[account] failed:', err.message)
    return {
      username: USERNAME,
      generatedAt: new Date().toISOString(),
      yearCommits: 0,
      weekCommits: 0,
      heatmap: {},
      source: 'error',
    }
  })
  await fs.writeFile(
    path.join(REPORT_OUT, 'account-stats.json'),
    JSON.stringify(account, null, 2),
  )

  // Project stats
  const project = await buildProjectStats().catch((err) => {
    console.error('[project] failed:', err.message)
    return {
      generatedAt: new Date().toISOString(),
      repo: path.basename(ROOT),
      slocTotal: 0,
      commitTrend: [],
      moduleCommits: [],
      weekTotals: { commits: 0, added: 0, removed: 0, files: 0 },
      recentCommits: [],
      source: 'error',
    }
  })
  await fs.writeFile(
    path.join(REPORT_OUT, 'project-stats.json'),
    JSON.stringify(project, null, 2),
  )

  console.log('Wrote:', path.join(REPORT_OUT, 'account-stats.json'))
  console.log('Wrote:', path.join(REPORT_OUT, 'project-stats.json'))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
