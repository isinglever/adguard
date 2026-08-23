import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const textEncoder = new TextEncoder()

function encodeVarint (value) {
  const bytes = []
  while (value > 0x7f) {
    bytes.push((value & 0x7f) | 0x80)
    value >>>= 7
  }
  bytes.push(value)
  return bytes
}

function lengthDelimited (fieldNumber, value) {
  return [
    ...encodeVarint((fieldNumber << 3) | 2),
    ...encodeVarint(value.length),
    ...value
  ]
}

function createFixture ({ browseId = 'FEmusic_charts', region } = {}) {
  const bytes = [
    ...lengthDelimited(1, []),
    ...lengthDelimited(2, textEncoder.encode(browseId))
  ]
  if (region) {
    bytes.push(...lengthDelimited(18, lengthDelimited(1, textEncoder.encode(region))))
  }
  bytes.push(...encodeVarint(99 << 3), 1)
  return new Uint8Array(bytes)
}

function readRegion (body) {
  const marker = new Uint8Array([0x92, 0x01, 0x04, 0x0a, 0x02])
  for (let index = 0; index <= body.length - marker.length - 2; index++) {
    if (marker.every((byte, offset) => body[index + offset] === byte)) {
      return String.fromCharCode(
        body[index + marker.length],
        body[index + marker.length + 1]
      )
    }
  }
  return undefined
}

async function runBundle (path, body, argument) {
  const code = fs.readFileSync(path, 'utf8')
  const globals = [
    '$argument',
    '$done',
    '$httpClient',
    '$notification',
    '$persistentStore',
    '$request',
    '$response'
  ]
  const previous = new Map(globals.map(key => [
    key,
    Object.prototype.hasOwnProperty.call(globalThis, key)
      ? { exists: true, value: globalThis[key] }
      : { exists: false }
  ]))

  return await new Promise((resolve, reject) => {
    let settled = false
    const timeout = setTimeout(() => {
      restoreGlobals()
      reject(new Error(`Bundle did not call $done: ${path}`))
    }, 2000)

    function restoreGlobals () {
      clearTimeout(timeout)
      for (const [key, prior] of previous) {
        if (prior.exists) globalThis[key] = prior.value
        else delete globalThis[key]
      }
    }

    globalThis.$argument = JSON.stringify(argument)
    globalThis.$httpClient = {}
    globalThis.$notification = { post () {} }
    globalThis.$persistentStore = {
      read () { return null },
      write () { return true }
    }
    globalThis.$request = {
      url: 'https://youtubei.googleapis.com/youtubei/v1/browse',
      body
    }
    globalThis.$response = undefined
    globalThis.$done = result => {
      if (settled) return
      settled = true
      const output = result?.response?.body ?? result?.body ?? body
      queueMicrotask(() => {
        restoreGlobals()
        resolve(output instanceof Uint8Array ? output : new Uint8Array(output))
      })
    }

    try {
      vm.runInThisContext(code, { filename: path })
    } catch (error) {
      restoreGlobals()
      reject(error)
    }
  })
}

const previewOnly = process.env.PREVIEW_ONLY === '1'
const bundles = previewOnly
  ? ['./dist/youtube.request.preview.js']
  : [
      '../../js/youtube/youtube.request.js',
      './dist/youtube.request.preview.js'
    ]

for (const bundle of bundles) {
  const implicit = createFixture()
  const global = await runBundle(bundle, implicit, { chartsRegion: 'ZZ' })
  assert.equal(readRegion(global), 'ZZ', `${bundle}: inject Global`)
  assert.equal(global.length, implicit.length + 7, `${bundle}: append field 18`)

  const nigeria = await runBundle(bundle, createFixture({ region: 'NG' }), {
    chartsRegion: 'ZZ'
  })
  assert.equal(readRegion(nigeria), 'ZZ', `${bundle}: replace Nigeria`)

  const usa = await runBundle(bundle, createFixture(), { chartsRegion: 'US' })
  assert.equal(readRegion(usa), 'US', `${bundle}: inject United States`)

  const otherBrowse = createFixture({ browseId: 'FEhome', region: 'NG' })
  assert.deepEqual(
    await runBundle(bundle, otherBrowse, { chartsRegion: 'ZZ' }),
    otherBrowse,
    `${bundle}: leave other browse requests unchanged`
  )

  const disabled = createFixture({ region: 'NG' })
  assert.deepEqual(
    await runBundle(bundle, disabled, { chartsRegion: 'off' }),
    disabled,
    `${bundle}: allow disabling the override`
  )
}

console.log(
  previewOnly
    ? 'Charts region behavior matches for the preview request bundle.'
    : 'Charts region behavior matches for deployed and preview request bundles.'
)
