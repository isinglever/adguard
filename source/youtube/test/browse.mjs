import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

import {
  Browse,
  Contents,
  LayoutRender,
  RenderInfo,
  ReelShelfRenderer,
  RichGridContent,
  RichGridRenderer,
  RichItemContent,
  RichSectionContent,
  RichSectionRenderer,
  VideoRendererContent,
  VideoWithContextRenderer
} from '../lib/protobuf/response/browse_pb.js'
import {
  Contents as NextContents,
  Next,
  NextResults
} from '../lib/protobuf/response/next_pb.js'

function createVideoContent (eml) {
  return new RichItemContent({
    videoWithContextRenderer: new VideoWithContextRenderer({
      videoRendererContent: new VideoRendererContent({
        renderInfo: new RenderInfo({
          layoutRender: new LayoutRender({ eml })
        })
      })
    })
  })
}

function createBrowseContents () {
  return new Contents({
    richGridRenderer: new RichGridRenderer({
      richGridContents: [
        new RichGridContent({
          richSectionRenderer: new RichSectionRenderer({
            richSectionContent: new RichSectionContent({
              reelShelfRenderer: new ReelShelfRenderer({
                richItemContent: [createVideoContent('shorts_shelf.eml-fe|fixture')]
              })
            })
          })
        }),
        new RichGridContent({
          richSectionRenderer: new RichSectionRenderer({
            richSectionContent: new RichSectionContent({
              reelShelfRenderer: new ReelShelfRenderer({
                richItemContent: [createVideoContent('video_shelf.eml-fe|fixture')]
              })
            })
          })
        })
      ]
    })
  })
}

function createFixture (endpoint) {
  if (endpoint === 'next') {
    return new Next({
      Contents: new NextContents({
        NextResults: new NextResults({ Contents: createBrowseContents() })
      })
    }).toBinary()
  }
  return new Browse({ contents: createBrowseContents() }).toBinary()
}

function readSectionCount (endpoint, body) {
  const message = endpoint === 'next'
    ? Next.fromBinary(body)
    : Browse.fromBinary(body)
  const contents = endpoint === 'next'
    ? message.Contents.NextResults.Contents
    : message.contents
  return contents.richGridRenderer.richGridContents.length
}

async function runBundle (path, endpoint, body, argument) {
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
      url: `https://youtubei.googleapis.com/youtubei/v1/${endpoint}`
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

const bundles = process.env.PREVIEW_ONLY
  ? ['./dist/youtube.response.preview.js']
  : [
      '../../js/youtube/youtube.response.js',
      './dist/youtube.response.preview.js'
    ]

for (const bundle of bundles) {
  for (const endpoint of ['browse', 'next']) {
    const blocked = await runBundle(bundle, endpoint, createFixture(endpoint), {
      blockShorts: true,
      lyricLang: 'off'
    })
    assert.equal(readSectionCount(endpoint, blocked), 1, `${bundle}: ${endpoint}`)

    const allowed = await runBundle(bundle, endpoint, createFixture(endpoint), {
      blockShorts: false,
      lyricLang: 'off'
    })
    assert.equal(readSectionCount(endpoint, allowed), 2, `${bundle}: ${endpoint}`)
  }
}

console.log(
  process.env.PREVIEW_ONLY
    ? 'Browse and Next Shorts behavior matches for the preview bundle.'
    : 'Browse and Next Shorts behavior matches for deployed and preview bundles.'
)
