import assert from 'node:assert/strict'
import fs from 'node:fs'

const moduleText = fs.readFileSync('../../module/youtube.module', 'utf8')

const responseRule = moduleText
  .split('\n')
  .find(line => line.startsWith('youtube.response = '))

assert.ok(responseRule, 'The YouTube response rule must exist.')

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

const mapLocalRule = moduleText
  .split('\n')
  .find(line => line.startsWith('^https?:'))

assert.equal(
  mapLocalRule,
  '^https?:\\/\\/[\\w-]+\\.googlevideo\\.com\\/initplayback.+&oad data-type=text data="" status-code=502'
)

console.log('YouTube module routes playback metadata through the response script.')
