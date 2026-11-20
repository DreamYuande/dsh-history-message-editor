import { mkdir, readFile, writeFile } from 'node:fs/promises'

const load = (path) => readFile(new URL(path, import.meta.url), 'utf8')
const [manifest, history, client, css] = await Promise.all([
  load('./package.json'), load('./src/history.js'), load('./src/client.js'), load('./src/editor.css'),
])
const { name } = JSON.parse(manifest)
const wrapped = `window.__ModuleLoader__.load({
  id: ${JSON.stringify(name)},
  factory: () => {
    'use strict'
    const stylesheet = ${JSON.stringify(css)}
    ${history.replace(/^export /gm, '')}
    ${client}
    return { apply, inject }
  },
})
`
await mkdir(new URL('./dist/', import.meta.url), { recursive: true })
await writeFile(new URL('./dist/client.js', import.meta.url), wrapped)
