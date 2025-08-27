/* Convert ESM build .js files to .mjs and fix internal import specifiers */
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '../../build/module')

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(p, files)
    else files.push(p)
  }
  return files
}

function mjsify(file) {
  if (!file.endsWith('.js')) return
  let code = fs.readFileSync(file, 'utf-8')
  // Replace only bare relative .js specifiers in import/export
  code = code.replace(/(from\s+['"]\.\/?[^'"\n]+)\.js(['"];?)/g, '$1.mjs$2')
  code = code.replace(/(import\(\s*['"]\.\/?[^'"\n]+)\.js(['"]\s*\))/g, '$1.mjs$2')
  fs.writeFileSync(file, code)
  const mjs = file.slice(0, -3) + '.mjs'
  fs.renameSync(file, mjs)
}

if (!fs.existsSync(root)) process.exit(0)
const files = walk(root)
files.forEach(mjsify)

