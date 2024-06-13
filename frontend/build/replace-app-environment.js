/* eslint-disable */

// this script takes as argument the type of build (spa, pwa, ssr...)
// working directory has to be the project root

const fs = require('fs')

function loadEnvs(allowedEnvs) {
  try {
    // see if there is anything to do
    const encoding = 'utf8'

    let loadFrom = process.env

    target = {}

    for (const key of allowedEnvs) {
      if (Object.prototype.hasOwnProperty.call(loadFrom, key)) {
        target[key] = loadFrom[key]
      }
    }
    return target
  } catch (e) {
    console.error(`Error '${e}'`)
    process.exit(1)
  }
}

let envs = loadEnvs([
    'KEYCLOAK_REALM',
    'KEYCLOAK_URL',
    'KEYCLOAK_CLIENT_ID',
])

const originalFile = fs.readFileSync(`dist/${process.argv[2]}/index.html`, { encoding: 'utf-8' })
const modifiedFile = originalFile.replace('window.APP_ENVIRONMENT = {}', `window.APP_ENVIRONMENT = JSON.parse('${JSON.stringify(envs).replace("'", "\\''")}')`)
fs.writeFileSync(`dist/${process.argv[2]}/index.html`, modifiedFile)
