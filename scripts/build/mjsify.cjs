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

function appendExt(spec) {
  return spec.endsWith('.mjs') || spec.endsWith('.js') ? spec : spec + '.mjs'
}

function mjsify(file) {
  if (!file.endsWith('.js')) return
  let code = fs.readFileSync(file, 'utf-8')
  // Replace relative .js with .mjs
  code = code.replace(/(from\s+['"]\.\/?[^'"\n]+)\.js(['"];?)/g, '$1.mjs$2')
  code = code.replace(/(import\(\s*['"]\.\/?[^'"\n]+)\.js(['"]\s*\))/g, '$1.mjs$2')
  // Append .mjs to relative specifiers missing extension
  code = code.replace(/from\s+(['"])(\.\/?[^'"\n]+)(['"])/g, (_, q1, spec, q3) => `from ${q1}${appendExt(spec)}${q3}`)
  code = code.replace(/import\(\s*(['"])(\.\/?[^'"\n]+)(['"])\s*\)/g, (_, q1, spec, q3) => `import(${q1}${appendExt(spec)}${q3})`)
  fs.writeFileSync(file, code)
  const mjs = file.slice(0, -3) + '.mjs'
  fs.renameSync(file, mjs)
}

if (!fs.existsSync(root)) process.exit(0)
const files = walk(root)
files.forEach(mjsify)

