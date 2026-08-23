import { $ } from './lib/env'
import { rewriteChartsRegion } from './src/chartsRegion'

function run (): void {
  const argument = $.decodeParams({
    chartsRegion: 'ZZ',
    debug: false
  })
  $.isDebug = Boolean(argument.debug)

  const targetRegion = String(argument.chartsRegion ?? 'ZZ').trim().toUpperCase()
  if (targetRegion === 'OFF') {
    $.exit()
    return
  }

  if (!/^(ZZ|US)$/.test(targetRegion)) {
    $.log(`Unsupported YouTube Music charts region: ${targetRegion}`)
    $.exit()
    return
  }

  const body = $.request.bodyBytes
  if (!(body instanceof Uint8Array)) {
    $.log('YouTube Music charts request has no binary body')
    $.exit()
    return
  }

  const result = rewriteChartsRegion(body, targetRegion)
  if (!result.matched || !result.changed) {
    $.exit()
    return
  }

  $.debug(`YouTube Music charts default region: server default -> ${targetRegion}`)
  $.done({ bodyBytes: result.body })
}

try {
  run()
} catch (error) {
  $.log(error.toString())
  $.exit()
}
