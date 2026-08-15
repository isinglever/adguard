import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

import {
  Guide,
  GuideSectionRenderer,
  Item,
  RendererItem,
  guideEntryRenderer
} from '../lib/protobuf/response/guide_pb.js'

const browseIds = [
  'SPunlimited',
  'FEuploads',
  'FEmusic_explore',
  'FEmusic_immersive',
  'FEshorts',
  'FEhome'
]
const retainedId = 'FEsubscriptions'

function createFixture () {
  const rendererItems = [...browseIds, retainedId].map((browseId, index) => {
    const entry = new guideEntryRenderer({ browseId })
    return index % 2 === 0
      ? new RendererItem({ iconRender: entry })
      : new RendererItem({ labelRender: entry })
  })

  return new Guide({
    items4: [
      new Item({
        guideSectionRenderer: new GuideSectionRenderer({ rendererItems })
      })
    ]
  }).toBinary()
}

function readBrowseIds (body) {
  const guide = Guide.fromBinary(body)
  return guide.items4[0].guideSectionRenderer.rendererItems.map(item =>
    item.iconRender?.browseId || item.labelRender?.browseId
  )
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
      url: 'https://youtubei.googleapis.com/youtubei/v1/guide'
    }
    globalThis.$response = { body }
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

const bundles = [
  '../../js/youtube/youtube.response.js',
  './dist/youtube.response.preview.js'
]

for (const bundle of bundles) {
  const blocked = await runBundle(bundle, createFixture(), {
    blockUpload: true,
    blockImmersive: true
  })
  assert.deepEqual(
    readBrowseIds(blocked),
    ['FEshorts', 'FEhome', retainedId],
    bundle
  )

  const allowed = await runBundle(bundle, createFixture(), {
    blockUpload: false,
    blockImmersive: false
  })
  assert.deepEqual(
    readBrowseIds(allowed),
    [...browseIds.slice(1), retainedId],
    bundle
  )
}

console.log('Guide behavior matches for deployed and preview bundles.')
