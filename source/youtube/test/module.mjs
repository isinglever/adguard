import assert from 'node:assert/strict'
import fs from 'node:fs'

const moduleText = fs.readFileSync('../../module/youtube.module', 'utf8')
const chartsModuleText = fs.readFileSync(
  '../../module/youtube-music-charts.module',
  'utf8'
)

const responseRule = moduleText
  .split('\n')
  .find(line => line.startsWith('youtube.response = '))

assert.ok(responseRule, 'The YouTube response rule must exist.')

const requestRule = moduleText
  .split('\n')
  .find(line => line.startsWith('youtube.request = '))

assert.ok(requestRule, 'The YouTube request rule must exist.')
assert.ok(requestRule.includes('youtubei\\/v1\\/browse'))
assert.ok(requestRule.includes('binary-body-mode=1'))
assert.ok(requestRule.includes('youtube.request.js'))
assert.ok(moduleText.includes('排行榜默认地区:ZZ'))
assert.ok(moduleText.includes('去广告:false'))
assert.ok(moduleText.includes('播放能力增强:false'))
assert.ok(responseRule.includes('"blockAds":{{{去广告}}}'))
assert.ok(responseRule.includes('"playbackEnhance":{{{播放能力增强}}}'))

for (const endpoint of [
  'browse',
  'next',
  'player',
  'search',
  'reel\\/reel_watch_sequence',
  'guide',
  'account\\/get_setting',
  'get_watch'
]) {
  assert.ok(responseRule.includes(endpoint), `Missing endpoint: ${endpoint}`)
}

assert.ok(!moduleText.includes('[Map Local]'))
assert.ok(!moduleText.includes('googlevideo.com'))
assert.ok(moduleText.includes('hostname = %APPEND% youtubei.googleapis.com'))

const chartsRequestRule = chartsModuleText
  .split('\n')
  .find(line => line.startsWith('youtube.music.charts.request = '))

assert.ok(chartsRequestRule, 'The charts-only request rule must exist.')
assert.ok(chartsRequestRule.includes('type=http-request'))
assert.ok(chartsRequestRule.includes('youtubei\\/v1\\/browse'))
assert.ok(chartsRequestRule.includes('binary-body-mode=1'))
assert.ok(chartsRequestRule.includes('youtube.request.js'))
assert.ok(chartsModuleText.includes('charts_region:ZZ'))
assert.ok(!chartsModuleText.includes('type=http-response'))
assert.ok(!chartsModuleText.includes('[Map Local]'))
assert.ok(!chartsModuleText.includes('googlevideo.com'))
assert.ok(
  chartsModuleText.includes('hostname = %APPEND% youtubei.googleapis.com')
)

console.log('YouTube modules separate charts requests from playback responses.')
