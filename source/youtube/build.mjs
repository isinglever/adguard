import * as esbuild from 'esbuild'

const debug = false
const deploy = process.argv.includes('--deploy')
const banner = '// Generated from source/youtube. Do not edit the bundle directly.'
const responseOutput = deploy
  ? '../../js/youtube/youtube.response.js'
  : './dist/youtube.response.preview.js'
const umpOutput = './dist/youtube.ump.preview.js'

esbuild.buildSync({
  entryPoints: ['main-response.ts'],
  bundle: true,
  minify: !debug,
  banner: { js: banner },
  inject: ['./lib/text-polyfill.mjs'],
  sourcemap: false,
  outfile: responseOutput
})

esbuild.buildSync({
  entryPoints: ['./src/initplayback.ts'],
  bundle: true,
  minify: !debug,
  banner: { js: banner },
  inject: ['./lib/text-polyfill.mjs'],
  sourcemap: false,
  outfile: umpOutput
})
