# Seed Template 🌱

A minimal template for adding any repository to your digital forest using the `.seed` directory structure.

## Quick Start

1. Copy the `.seed` folder to any repository
2. Edit `.seed/meta.yml` with your project details
3. Push to GitHub
4. Your repository is now discoverable!

## Structure

```
your-repo/
├── .seed/
│   ├── meta.yml      # Required: Project metadata
│   └── README.md     # Optional: Overrides root README
└── ... (your files)
```

## Required Fields

Only 3 fields are required in `meta.yml`:

```yaml
title: Your Project Name
type: project        # project, experiment, note, or writing
stage: sapling       # sprout, sapling, mature, or ancient
```

## Content Types

- **project**: Full applications or libraries
- **experiment**: Proof of concepts, trials
- **note**: Quick thoughts, TILs
- **writing**: Blog posts, essays

## Growth Stages

- **sprout** 🌱: New growth, just emerging
- **sapling** 🌿: Young tree, establishing roots
- **mature** 🌳: Full grown, bearing fruit
- **ancient** 🌲: Timeless wisdom, deep roots

## Examples

See the `.seed` folder in this repository for examples:
- `meta.yml.minimal` - Just the required fields
- `meta.yml.complete` - All available fields
- `meta.yml.project` - Project-specific example
- `meta.yml.experiment` - Experiment-specific example