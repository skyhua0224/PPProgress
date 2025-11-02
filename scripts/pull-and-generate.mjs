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
  // Ensure final outDir exists for direct writes
  mkdirSync(outDir, { recursive: true })

  if (!existsSync(GENERATOR_PATH)) {
    console.error(`[error] Generator script not found: ${GENERATOR_PATH}`)
    process.exit(2)
  }

  // Optionally init submodules (private) to ensure complete stats
  if (INIT_SUBMODULES === 'true') {
    try {
      // Ensure GitHub HTTPS URLs use the provided token for any submodule fetches
      try {
        execSync(
          `git config --local url."https://x-access-token:${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"`,
          { stdio: 'inherit', cwd: mainRepoDir },
        )
        console.log(
          '[git] configured https://github.com -> token rewrite (local)',
        )
        // Also set as global to ensure nested git processes (spawned by submodule) inherit the rewrite
        try {
          execSync(
            `git config --global url."https://x-access-token:${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"`,
            { stdio: 'inherit' },
          )
          console.log('[git] configured token rewrite (global)')
        } catch (e) {
          console.warn('[warn] failed to set global token rewrite:', e?.message)
        }
        // Proactively rewrite .gitmodules URLs to embed the token for HTTPS submodules, then sync
        try {
          const listing = execSync(
            'git config -f .gitmodules --get-regexp ^submodule\\..*\\.url',
            { cwd: mainRepoDir },
          )
            .toString()
            .trim()
          if (listing) {
            const lines = listing.split(/\r?\n/)
            for (const line of lines) {
              const idx = line.indexOf(' ')
              if (idx <= 0) continue
              const key = line.slice(0, idx).trim()
              const url = line.slice(idx + 1).trim()
              if (url.startsWith('https://github.com/')) {
                const rest = url.replace('https://github.com/', '')
                const newUrl = `https://x-access-token:${GITHUB_TOKEN}@github.com/${rest}`
                execSync(
                  `git config -f .gitmodules ${JSON.stringify(
                    key,
                  )} ${JSON.stringify(newUrl)}`,
                  { cwd: mainRepoDir, stdio: 'inherit' },
                )
              }
            }
            // sync updated .gitmodules into local git config
            execSync('git submodule sync --recursive', {
              cwd: mainRepoDir,
              stdio: 'inherit',
            })
            console.log('[git] .gitmodules rewritten (if needed) and synced')
          }
        } catch (e) {
          console.warn('[warn] .gitmodules rewrite/sync skipped:', e?.message)
        }
      } catch (e) {
        console.warn(
          '[warn] failed to set url.insteadOf for token rewrite:',
          e?.message,
        )
      }
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
      `--outDir=${outDir}`,
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
      `--outDir=${outDir}`,
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
      `--outDir=${outDir}`,
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
        execSync(`node ${GEN_LIVE} --outDir=${outDir}`.trim(), {
          stdio: 'inherit',
          cwd: mainRepoDir,
          env: { ...process.env, GITHUB_TOKEN },
        })
        // Outputs already in outDir when using --outDir, no copy required
      } else {
        console.log(
          '[info] gen-dashboard-data.mjs not found; skipping LIVE JSON generation',
        )
      }
    }
  } catch (e) {
    console.warn('[warn] LIVE JSON generation skipped:', e?.message)
  }

  console.log('[done] Data generated directly into out/.')
} catch (err) {
  console.error('[fatal]', err?.message || err)
  process.exit(3)
} finally {
  try {
    rmSync(work, { recursive: true, force: true })
  } catch {}
}
