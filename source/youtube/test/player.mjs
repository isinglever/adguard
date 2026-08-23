import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

import {
  AdPlacement,
  AdPlacementRenderer,
  AdSlot,
  AdSlot_Render,
  BackgroundPlayer,
  BackgroundPlayerRender,
  MiniPlayer,
  MiniPlayerRender,
  PlaybackTracking,
  PlayabilityStatus,
  Player,
  Tracking
} from '../lib/protobuf/response/player_pb.js'
import { Content as WatchContent, Watch } from '../lib/protobuf/response/watch_pb.js'

function createPlayer () {
  return new Player({
    adPlacements: [
      new AdPlacement({
        adPlacementRenderer: new AdPlacementRenderer({ params: 'ad' })
      })
    ],
    adSlots: [new AdSlot({ render: new AdSlot_Render() })],
    playbackTracking: new PlaybackTracking({
      videostatsPlaybackUrl: new Tracking({ baseUrl: 'https://example/play' }),
      pageadViewthroughconversion: new Tracking({
        baseUrl: 'https://example/pagead'
      })
    }),
    playabilityStatus: new PlayabilityStatus({
      miniPlayer: new MiniPlayer({
        miniPlayerRender: new MiniPlayerRender({ active: false })
      }),
      backgroundPlayer: new BackgroundPlayer({
        backgroundPlayerRender: new BackgroundPlayerRender({ active: false })
      })
    })
  })
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

function assertAdsPresent (player, label) {
  assert.equal(player.adPlacements.length, 1, `${label}: ad placement`)
  assert.equal(player.adSlots.length, 1, `${label}: ad slot`)
  assert.ok(
    player.playbackTracking.pageadViewthroughconversion,
    `${label}: page-ad tracking`
  )
}

function assertAdsRemoved (player, label) {
  assert.equal(player.adPlacements.length, 0, `${label}: ad placement`)
  assert.equal(player.adSlots.length, 0, `${label}: ad slot`)
  assert.equal(
    player.playbackTracking.pageadViewthroughconversion,
    undefined,
    `${label}: page-ad tracking`
  )
}

const bundles = process.env.PREVIEW_ONLY
  ? ['./dist/youtube.response.preview.js']
  : [
      '../../js/youtube/youtube.response.js',
      './dist/youtube.response.preview.js'
    ]

for (const bundle of bundles) {
  const originalPlayer = createPlayer().toBinary()
  const premiumPlayer = await runBundle(bundle, 'player', originalPlayer, {
    blockAds: false,
    playbackEnhance: false,
    captionLang: 'off'
  })
  assert.deepEqual(
    premiumPlayer,
    originalPlayer,
    `${bundle}: pass through Premium player response byte-for-byte`
  )
  assertAdsPresent(Player.fromBinary(premiumPlayer), `${bundle}: Premium`)

  const filteredPlayer = Player.fromBinary(await runBundle(
    bundle,
    'player',
    originalPlayer,
    { blockAds: true, playbackEnhance: false, captionLang: 'off' }
  ))
  assertAdsRemoved(filteredPlayer, `${bundle}: ad filtering`)
  assert.equal(
    filteredPlayer.playabilityStatus.backgroundPlayer.backgroundPlayerRender.active,
    false,
    `${bundle}: ad filtering preserves background-player state`
  )

  const enhancedPlayer = Player.fromBinary(await runBundle(
    bundle,
    'player',
    originalPlayer,
    { blockAds: false, playbackEnhance: true, captionLang: 'off' }
  ))
  assertAdsPresent(enhancedPlayer, `${bundle}: playback enhancement`)
  assert.equal(
    enhancedPlayer.playabilityStatus.miniPlayer.miniPlayerRender.active,
    true,
    `${bundle}: mini player`
  )
  assert.equal(
    enhancedPlayer.playabilityStatus.backgroundPlayer.backgroundPlayerRender.active,
    true,
    `${bundle}: background player`
  )

  const originalWatch = new Watch({
    contents: [new WatchContent({ player: createPlayer() })]
  }).toBinary()
  const premiumWatch = await runBundle(bundle, 'get_watch', originalWatch, {
    blockAds: false,
    playbackEnhance: false,
    captionLang: 'off',
    blockShorts: false,
    lyricLang: 'off'
  })
  assert.deepEqual(
    premiumWatch,
    originalWatch,
    `${bundle}: pass through Premium Watch response byte-for-byte`
  )

  const filteredWatch = Watch.fromBinary(await runBundle(
    bundle,
    'get_watch',
    originalWatch,
    {
      blockAds: true,
      playbackEnhance: false,
      captionLang: 'off',
      blockShorts: false,
      lyricLang: 'off'
    }
  ))
  assertAdsRemoved(filteredWatch.contents[0].player, `${bundle}: Watch filtering`)
}

console.log(
  process.env.PREVIEW_ONLY
    ? 'Player safety and ad controls match for the preview bundle.'
    : 'Player safety and ad controls match for deployed and preview bundles.'
)
