# Gist Garden Guide

Using GitHub Gists for notes and writing in your digital garden.

## Overview

GitHub Gists are perfect for smaller content like notes and blog posts. They don't require a full repository and are easier to create and manage for short-form content.

## When to Use Gists vs Repositories

### Use Gists for:
- 📝 **Notes** - Quick thoughts, meeting notes, learning notes
- ✍️ **Writing** - Blog posts, articles, essays
- 📋 **Snippets** - Code examples, configuration files
- 💭 **Ideas** - Rough drafts, brainstorming

### Use Repositories for:
- 🚀 **Projects** - Applications, libraries, tools
- 🧪 **Experiments** - Prototypes with multiple files
- 📚 **Collections** - Multi-file documentation
- 🔧 **Complex content** - Content requiring assets, multiple files

## Creating Garden Gists

### Method 1: Using Gist Description Tags

Add `#garden` to your gist description along with type and stage tags:

```
My thoughts on productivity systems #garden #note #budding #productivity
```

**Required tags:**
- `#garden` - Marks this as garden content
- `#note` or `#writing` - Content type

**Optional tags:**
- `#seedling`, `#budding`, `#evergreen` - Growth stage
- `#featured` - Feature on homepage
- `#draft` - Mark as draft
- Any other tags for categorization

### Method 2: Using Frontmatter

Include frontmatter in your markdown file:

```markdown
---
type: note
stage: budding
tags: [productivity, systems, tools]
connections: [time-management, getting-things-done]
---

# My Productivity System

Content goes here...
```

## Gist File Naming

The processor looks for content files in this order:
1. `index.md` or `index.mdx`
2. `readme.md` or `readme.mdx`
3. `content.md` or `content.mdx`
4. `note.md` or `note.mdx`
5. `post.md` or `post.mdx`
6. Any `.md` or `.mdx` file

## Examples

### Simple Note

**Gist Description:**
```
Quick thoughts on React Server Components #garden #note #seedling #react
```

**note.md:**
```markdown
# React Server Components

Just started exploring RSC. Initial thoughts:

- Blurs the line between server and client
- Mental model shift from traditional React
- Performance benefits seem significant

Need to experiment more with [[next-app-router]].
```

### Blog Post with Frontmatter

**Gist Description:**
```
Understanding TypeScript Generics #garden #writing #evergreen #typescript
```

**post.md:**
```markdown
---
title: "Understanding TypeScript Generics: A Practical Guide"
stage: evergreen
tags: [typescript, programming, tutorial]
planted: 2024-01-15
featured: true
---

# Understanding TypeScript Generics

Generics are one of TypeScript's most powerful features, yet they often intimidate developers. Let's demystify them with practical examples.

## What Are Generics?

Think of generics as "type variables" - placeholders for types that get filled in when you use them...

[Rest of article content]
```

### Note with Connections

**Gist Description:**
```
PKM workflow experiments #garden #note #budding #pkm
```

**content.md:**
```markdown
---
type: note
connections: 
  - zettelkasten-method
  - obsidian-setup
  - readwise-integration
---

# Personal Knowledge Management Workflow

Been experimenting with different PKM approaches. Current setup:

1. **Capture**: Readwise for highlights → [[readwise-integration]]
2. **Process**: Weekly review in Obsidian using [[zettelkasten-method]]
3. **Connect**: Building knowledge graph with backlinks
4. **Create**: Transform notes into blog posts

## Tools I'm Using

- Obsidian for notes (see [[obsidian-setup]])
- Readwise for capture
- This digital garden for sharing

## Open Questions

- How to handle ephemeral vs permanent notes?
- Best way to surface old notes for review?
```

## MDX Support

Gists support MDX for interactive content:

**interactive-post.mdx:**
```markdown
---
type: writing
stage: evergreen
---

# Interactive Code Examples

Let's explore React hooks interactively:

<CodePlayground>
{`
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
`}
</CodePlayground>

Try clicking the button above!
```

## Multi-File Gists

You can include supporting files in your gist:

```
my-productivity-gist/
├── note.md          (main content)
├── daily-routine.md (linked content)
└── tools.json       (data file)
```

The processor will use `note.md` as the main content but other files can be referenced.

## Best Practices

1. **Use Clear Titles** - First H1 or frontmatter title
2. **Tag Appropriately** - Use description tags for quick categorization
3. **Keep It Focused** - One idea per gist
4. **Link Liberally** - Use `[[wiki-links]]` to connect ideas
5. **Update Regularly** - Keep the content fresh

## Creating Gists

### Via GitHub Web

1. Go to https://gist.github.com
2. Add your markdown content
3. Set description with `#garden` and other tags
4. Create secret or public gist

### Via GitHub CLI

```bash
# Create a note
echo "# My Note Content" | gh gist create - -d "#garden #note #seedling" -f "note.md"

# Create from file
gh gist create my-post.md -d "#garden #writing #evergreen #react" -p
```

### Via API

```javascript
const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({ auth: 'your-token' });

await octokit.gists.create({
  description: 'My productivity system #garden #note #budding',
  public: true,
  files: {
    'note.md': {
      content: '# My Productivity System\n\nContent here...'
    }
  }
});
```

## Discovery Rules

For a gist to appear in your garden:

1. Must have `#garden` in description OR
2. Must have `type: note` or `type: writing` in frontmatter
3. Must contain at least one markdown file
4. Must be public (for public gardens)

## Viewing in the Garden

Gists appear alongside repository content:
- **Notes** section shows all `type: note` gists
- **Writing** section shows all `type: writing` gists
- Gists can be featured with `#featured` tag
- Full-text search includes gist content

## Tips

- Use gists for content under 10 files
- Great for daily notes, meeting notes
- Perfect for blog post drafts
- Easy to share individual ideas
- Can be embedded anywhere

## Migration

To convert existing gists:

1. Edit gist description to add `#garden #note` (or `#writing`)
2. Or add frontmatter to the markdown file
3. The garden will discover it on next build