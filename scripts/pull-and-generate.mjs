import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const {
  MAIN_REPO = 'skyhua0224/ProjectPrinting',
  MAIN_REPO_BRANCH = 'main',
  GITHUB_TOKEN,
  OUTPUT_DIR = 'out',
  MODE = 'daily', // 'daily' | 'weekly'
  SINCE_DAYS = '7', // generator window, default 7
  REPORT_LANG = 'both',
  INCLUDE_CAPS = 'false',
  PUBLISH_MD = 'false', // publish markdown to out/
  INIT_SUBMODULES = 'true', // init submodules in the main repo clone
} = process.env

if (!GITHUB_TOKEN) {
  console.error('[error] Missing GITHUB_TOKEN in env.')
  process.exit(1)
}

// temp working dirs
const work = mkdtempSync(join(tmpdir(), 'ppprogress-'))
const mainRepoDir = join(work, 'main')
const outDir = join(process.cwd(), OUTPUT_DIR)

try {
  console.log(`[pull] cloning ${MAIN_REPO}@${MAIN_REPO_BRANCH} ...`)
  const MODE_STR = String(process.env.MODE || MODE).toLowerCase()
  const isRetro = MODE_STR === 'retro'
  const cloneDepthFlag = isRetro ? '' : '--depth=1'
  execSync(
    `git clone ${cloneDepthFlag} -b ${MAIN_REPO_BRANCH} https://x-access-token:${GITHUB_TOKEN}@github.com/${MAIN_REPO}.git ${mainRepoDir}`.trim(),
    { stdio: 'inherit' },
  )
  try {
    const shallow = execSync('git rev-parse --is-shallow-repository', {
      cwd: mainRepoDir,
    })
      .toString()
      .trim()
    console.log(`[git] main repo shallow: ${shallow}`)
  } catch {}
  try {
    console.log('[git] recent commits (main repo):')
    execSync(
      'git --no-pager log -3 --pretty=oneline --abbrev-commit --date=iso',
      { stdio: 'inherit', cwd: mainRepoDir },
    )
  } catch {}

  // Try multiple generator locations. Prefer LOCAL scripts first for consistent behavior
  const LOCAL_GENERATOR = join(process.cwd(), 'scripts/pp-report.mjs')
  const GENERATOR_PATH_A = join(mainRepoDir, 'analysis/tools/pp-report.mjs')
  const GENERATOR_PATH_B = join(mainRepoDir, 'scripts/pp-report.mjs')
  const GENERATOR_PATH = [
    LOCAL_GENERATOR,
    GENERATOR_PATH_A,
    GENERATOR_PATH_B,
  ].find((p) => existsSync(p))
  const TMP_OUT = join(work, 'tmp-out')
  mkdirSync(TMP_OUT, { recursive: true })

  if (!existsSync(GENERATOR_PATH)) {
    console.error(`[error] Generator script not found: ${GENERATOR_PATH}`)
    process.exit(2)
  }

  // Optionally init submodules (private) to ensure complete stats
  if (INIT_SUBMODULES === 'true') {
    try {
      if (isRetro) {
        console.log('[pull] init submodules (recursive, full history) ...')
        execSync('git submodule update --init --recursive', {
          stdio: 'inherit',
          cwd: mainRepoDir,
        })
        // Try to unshallow submodules if any are shallow
        try {
          execSync(
            "git submodule foreach --recursive 'git rev-parse --is-shallow-repository >/dev/null 2>&1 && git fetch --unshallow || true'",
            {
              stdio: 'inherit',
              cwd: mainRepoDir,
            },
          )
        } catch {}
      } else {
        console.log('[pull] init submodules (recursive, depth=1) ...')
        execSync('git submodule update --init --recursive --depth 1', {
          stdio: 'inherit',
          cwd: mainRepoDir,
        })
      }
    } catch (e) {
      console.warn('[warn] submodule init skipped:', e?.message)
    }
  }

  // Build generator args based on MODE
  const args = []
  let shouldRunReport = true
  if (MODE_STR === 'retro') {
    const endISO = new Date().toISOString().slice(0, 10)
    const defaultStart = new Date()
    defaultStart.setFullYear(defaultStart.getFullYear() - 1)
    const startISO = defaultStart.toISOString().slice(0, 10)
    const RETRO_START = process.env.RETRO_START || startISO
    const RETRO_END = process.env.RETRO_END || endISO
    args.push('retro', `--start=${RETRO_START}`, `--end=${RETRO_END}`)
    args.push(
      `--lang=${REPORT_LANG}`,
      '--publish=true',
      `--includeCaps=${INCLUDE_CAPS}`,
      `--outDir=${TMP_OUT}`,
    )
    console.log(
      `[generate] MODE=${MODE_STR} -> node ${GENERATOR_PATH} ${args.join(' ')}`,
    )
  } else if (MODE_STR === 'weekly') {
    args.push('weekly', `--sinceDays=${SINCE_DAYS}`)
    args.push(
      `--lang=${REPORT_LANG}`,
      '--publish=true',
      `--includeCaps=${INCLUDE_CAPS}`,
      `--outDir=${TMP_OUT}`,
    )
    console.log(
      `[generate] MODE=${MODE_STR} -> node ${GENERATOR_PATH} ${args.join(' ')}`,
    )
  } else if (MODE_STR === 'dashboard' || MODE_STR === 'daily') {
    shouldRunReport = false
    console.log(
      `[generate] MODE=${MODE_STR}: skip weekly/retro generation; will only produce LIVE JSON...`,
    )
  } else {
    // Fallback to weekly if unknown mode
    args.push('weekly', `--sinceDays=${SINCE_DAYS}`)
    args.push(
      `--lang=${REPORT_LANG}`,
      '--publish=true',
      `--includeCaps=${INCLUDE_CAPS}`,
      `--outDir=${TMP_OUT}`,
    )
    console.log(
      `[generate] MODE=${MODE_STR} (fallback weekly) -> node ${GENERATOR_PATH} ${args.join(
        ' ',
      )}`,
    )
  }

  if (shouldRunReport) {
    execSync(`node ${GENERATOR_PATH} ${args.join(' ')}`, {
      stdio: 'inherit',
      // Always run with cwd=mainRepoDir so git operations happen in the cloned repo
      cwd: mainRepoDir,
      env: { ...process.env, GITHUB_TOKEN },
    })
  }

  // Optionally produce LIVE dashboard data (account-stats.json, project-stats.json)
  try {
    const GENERATE_LIVE = String(process.env.GENERATE_LIVE || 'true')
    if (GENERATE_LIVE === 'true') {
      const GEN_LIVE_PATHS = [
        join(process.cwd(), 'scripts/gen-dashboard-data.mjs'),
        join(mainRepoDir, 'scripts/gen-dashboard-data.mjs'),
      ]
      const GEN_LIVE = GEN_LIVE_PATHS.find((p) => existsSync(p))
      if (GEN_LIVE) {
        console.log(
          '[generate] running gen-dashboard-data to produce LIVE JSON ...',
        )
        execSync(`node ${GEN_LIVE} --outDir=${TMP_OUT}`.trim(), {
          stdio: 'inherit',
          cwd: mainRepoDir,
          env: { ...process.env, GITHUB_TOKEN },
        })
        // Outputs already in TMP_OUT when using --outDir, no copy required
      } else {
        console.log(
          '[info] gen-dashboard-data.mjs not found; skipping LIVE JSON generation',
        )
      }
    }
  } catch (e) {
    console.warn('[warn] LIVE JSON generation skipped:', e?.message)
  }

  console.log('[copy] syncing data files into repo out/...')
  mkdirSync(outDir, { recursive: true })
  // only copy data files and delete removed ones
  // Include markdown only when PUBLISH_MD=true
  const rsyncCmd =
    PUBLISH_MD === 'true'
      ? `rsync -a --delete --include='*/' --include='*.json' --include='*.md' --exclude='*' ${TMP_OUT}/ ${outDir}/`
      : `rsync -a --delete --include='*/' --include='*.json' --exclude='*' ${TMP_OUT}/ ${outDir}/`
  execSync(rsyncCmd, { stdio: 'inherit' })

  console.log('[done] Data generated and synced to out/.')
} catch (err) {
  console.error('[fatal]', err?.message || err)
  process.exit(3)
} finally {
  try {
    rmSync(work, { recursive: true, force: true })
  } catch {}
}
