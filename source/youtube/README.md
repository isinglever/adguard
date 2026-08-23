# YouTube Enhance source

This directory contains the editable TypeScript and protobuf source for the
deployed scripts in `../../js/youtube/`. It was imported from the
`deserialize_initplayback` branch of `isinglever/sgmodule` at commit `4a7a785`
and reconciled with the current `/guide` behavior from `master`.

The source is based on the original
[Maasea/sgmodule](https://github.com/Maasea/sgmodule) project. Credit belongs to
Maasea and its contributors; modifications in this repository retain the
Apache License 2.0 terms documented in `LICENSE`.

The init-playback/UMP implementation remains experimental and is not enabled by
`../../module/youtube.module`.

## Guide navigation options

- `blockUpload` removes the upload/create entry (`FEuploads`).
- `blockShorts` removes the YouTube Shorts entry (`FEshorts`).
- `blockImmersive` removes the YouTube Music Explore and Immersive entries.

## YouTube Music charts region

The request script forces `FEmusic_charts` requests to include an explicit
country selector. `chartsRegion` defaults to `ZZ` (Global), accepts `US`, and
can be disabled with `off`. Other `/browse` requests are left unchanged.

## Install

```
npm ci
```

## Build locally

This writes preview bundles under `dist/` without changing deployed files.

```
npm run build
```

After validating the preview bundle, deploy `youtube.response.js` to
`../../js/youtube/` with:

```
npm run deploy
```

Regenerate the protobuf bindings with:

```
npm run build:proto
```
