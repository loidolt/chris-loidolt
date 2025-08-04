# Seed System Setup Guide 🌱

The Seed system is a clean, simple way to mark repositories for inclusion in your digital garden.

## Key Benefits

- **No GitHub topics required** - Keep your topics for their intended public purpose
- **Simple structure** - Just a `.seed` directory with metadata
- **Flexible content** - Use your existing README or provide custom content
- **Clean discovery** - Only repositories you explicitly mark are included

## Quick Start

### 1. Add to Any Repository

```bash
# Clone the seed template
git clone https://github.com/yourusername/seed-template

# Copy .seed to your repository
cp -r seed-template/.seed your-repo/

# Edit the metadata
cd your-repo
open .seed/meta.yml
```

### 2. Configure Metadata

Edit `.seed/meta.yml` with just 3 required fields:

```yaml
title: Your Project Name
type: project      # or: experiment, note, writing
stage: budding     # or: seedling, evergreen, perennial
```

### 3. Push and Done!

```bash
git add .seed
git commit -m "Add seed metadata for digital garden"
git push
```

Your repository is now discoverable by the garden system!

## Content Types Explained

### Projects 🛠️
Full applications, libraries, or tools
```yaml
type: project
status: active  # optional: maintenance, complete, abandoned
technologies: [React, TypeScript]  # optional
```

### Experiments 🧪
Proofs of concept, trials, research
```yaml
type: experiment
hypothesis: Can we render 1M particles at 60fps?
findings:
  - WebGL handles up to 500k smoothly
  - WebGPU achieves full 1M target
```

### Notes 📝
Quick thoughts, TILs, documentation
```yaml
type: note
tags: [learning, javascript, performance]
```

### Writing ✍️
Blog posts, essays, tutorials
```yaml
type: writing
tags: [tutorial, react, hooks]
```

## Growth Stages

- **seedling** 🌱 - Just planted, rough ideas
- **budding** 🌿 - Growing, active development  
- **evergreen** 🌳 - Mature, well-maintained
- **perennial** 🌲 - Complete, archived

## Advanced Features

### Custom Content

By default, your repository's root `README.md` is used. To provide custom garden content:

```bash
# Create custom content for your garden
echo "# Garden-specific content" > .seed/README.md
```

### Connections

Link related projects using connections:

```yaml
connections:
  - another-project
  - shared-library
  - inspiration-source
```

In your content, use wiki-style links:
```markdown
This project extends [[another-project]] with AI features.
```

### Featured Content

```yaml
featured: true  # Shows on garden homepage
```

### Draft Mode

```yaml
draft: true  # Hides from public listings
```

## Implementation Details

### Discovery Process

1. Fetches all your GitHub repositories
2. Checks each for `.seed/meta.yml` or `.seed/meta.json`
3. Validates required fields
4. Processes content and metadata
5. No topics or special naming required!

### File Priority

Content is loaded in this order:
1. `.seed/README.md` (if exists)
2. `.seed/content.md` (alternate name)
3. `README.md` (root - fallback)

### Metadata Priority

1. `.seed/meta.yml` (preferred - supports comments)
2. `.seed/meta.json` (alternative)

## Examples

### Minimal Setup
```yaml
# .seed/meta.yml
title: My Cool Project
type: project
stage: budding
```

### Full Featured
```yaml
# .seed/meta.yml
title: Advanced Task Manager
type: project
stage: evergreen

description: AI-powered task management with natural language input
tags: [productivity, ai, react]
featured: true

status: active
technologies:
  - React 18
  - OpenAI GPT-4
  - Supabase
  
demoUrl: https://tasks.ai

connections:
  - gpt-prompt-library
  - react-ui-components
```

## FAQ

**Q: Why .seed instead of .garden?**  
A: Seeds grow into gardens! It's also shorter and implies the start of something.

**Q: Can I use both .seed and GitHub topics?**  
A: The seed system ignores topics entirely. Use topics for their intended purpose.

**Q: What if I already have a .garden directory?**  
A: The systems are separate. You can migrate by copying your meta.yml.

**Q: Do private repos work?**  
A: Yes, if your GitHub token has access. Configure with `includePrivate: true`.

**Q: Can I exclude certain repos?**  
A: Yes, use `excludeRepos` and `excludePatterns` in the discovery config.

## Next Steps

1. Copy the `seed-template/.seed` folder to your first repository
2. Edit the metadata
3. Push to GitHub
4. Run the garden discovery to see your content!

Happy planting! 🌱