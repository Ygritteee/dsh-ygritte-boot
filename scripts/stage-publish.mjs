/**
 * Stage a publish-ready copy of this plugin for its public GitHub/npm repo.
 *
 * The working checkout stays installable as the local `link:` package; this
 * script writes a sibling directory whose `package.json` carries a public npm
 * name, the repository mapping npm needs, and a `cordis.patch.yml` that points
 * at that same name. The caller then runs the staged copy's build + check.
 *
 * Usage:
 *   node scripts/stage-publish.mjs --owner <github-owner> [--name dsh-ygritte-boot] [--out <dir>]
 *
 * With no --owner the staged manifest uses a `<your-github>` placeholder and the
 * script prints a reminder; nothing is published by this script.
 */
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function arg(flag, fallback) {
  const index = process.argv.indexOf(flag)
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1]
  return fallback
}

const owner = arg('--owner', 'your-github')
const repoName = arg('--name', 'dsh-ygritte-boot')
const out = resolve(arg('--out', join(ROOT, '..', repoName)))
const placeholder = owner === 'your-github'

if (resolve(out) === ROOT) {
  console.error('refusing to stage over the working checkout')
  process.exit(2)
}
if (existsSync(out)) rmSync(out, { recursive: true, force: true })

cpSync(ROOT, out, {
  recursive: true,
  filter(source) {
    const rel = source.slice(ROOT.length + 1)
    return !rel.startsWith('node_modules') && rel !== '.git' && !rel.startsWith('.git/') && !rel.endsWith('.tgz')
  },
})

const manifestPath = join(out, 'package.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
manifest.name = repoName
delete manifest.private
manifest.description =
  'Full-screen ice-and-fire boot intro + Ygritte identity authorization for DeepSeek Harness (DSH): a host-injected first frame, typed bilingual boot log, five-step identity verification, Esc to skip, and a settings page with off/quick/full modes.'
manifest.license = 'MIT'
manifest.repository = { type: 'git', url: `git+https://github.com/${owner}/${repoName}.git` }
manifest.homepage = `https://github.com/${owner}/${repoName}#readme`
manifest.bugs = { url: `https://github.com/${owner}/${repoName}/issues` }
manifest.keywords = ['dsh', 'dsh-plugin', 'dsh-boot', 'boot-animation', 'splash', 'ui']
manifest.publishConfig = { access: 'public' }
if (!placeholder) manifest.author = { name: owner }
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')

const patchPath = join(out, 'cordis.patch.yml')
const patch = readFileSync(patchPath, 'utf8')
const next = patch.replace(/name:\s*'[^']+'\s*$/m, `name: '${repoName}'`)
if (next === patch) {
  console.error('cordis.patch.yml did not contain a quoted name line to rewrite')
  process.exit(2)
}
writeFileSync(patchPath, next)

console.log('staged release directory:', out)
console.log('  package.json name     :', manifest.name)
console.log('  cordis.patch.yml name :', repoName)
if (placeholder) {
  console.log('\n[!] repository URL is still the <your-github> placeholder.')
  console.log('    Re-run with --owner <your-github-username> once the account/repo name is fixed,')
  console.log('    or edit repository/homepage/bugs in the staged package.json before npm publish.')
}
console.log('\nnext:')
console.log('  cd <staged dir>')
console.log('  node scripts/build.mjs')
console.log('  node scripts/check.mjs')
console.log('  pnpm pack   # or npm pack')
