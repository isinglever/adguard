# Adguard Scripts Collection

This repository contains a personal collection of configuration files and scripts for AdGuard and similar network-filtering tools. It includes:

- **conf/** – Configuration files for various network filtering and proxy services
- **js/** – JavaScript snippets for ad blocking and app modifications
- **list/** – Custom blocklists and allowlists for filtering rules
- **module/** – Modular rule sets and configurations for specific applications
- **source/** – Editable source projects and build pipelines for generated scripts
- **files/** – Supporting data files and resources
- **icon/** – Icons and visual assets referenced by configurations

## Structure

```
adguard/
├── conf/          # Configuration files
├── js/            # JavaScript modules
├── list/          # Filter lists
├── module/        # Modular configurations  
├── source/        # Source code and build pipelines
├── files/         # Data files
└── icon/          # Icon resources
```

## Usage

These resources are intended for personal experimentation with network filtering and ad blocking tools. Configure your AdGuard or compatible filtering software to reference the appropriate files from this collection.

## Attribution

The YouTube Enhance implementation under `source/youtube/` is based on
[Maasea/sgmodule](https://github.com/Maasea/sgmodule). It was imported through
the `deserialize_initplayback` branch of `isinglever/sgmodule` and adapted for
this repository. See `source/youtube/LICENSE` for the Apache License 2.0 terms.

**Disclaimer**: Use these configurations at your own risk. Always review scripts and rules before implementation.
