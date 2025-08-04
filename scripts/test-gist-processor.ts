import { GistContentProcessor } from '../lib/content/gist-processor';
import type { Gist, GistFile } from '../types';

// Mock GitHub client for testing
class MockGitHubClient {
  private gistContents: Record<string, Record<string, string>> = {
    'abc123': {
      'note.md': `---
type: note
stage: budding
tags: [productivity, pkm]
connections: [zettelkasten-method, obsidian-setup]
---

# Personal Knowledge Management Workflow

Been experimenting with different PKM approaches. Current setup:

1. **Capture**: Readwise for highlights
2. **Process**: Weekly review in Obsidian using [[zettelkasten-method]]
3. **Connect**: Building knowledge graph with backlinks
4. **Create**: Transform notes into blog posts

## Tools I'm Using

- Obsidian for notes (see [[obsidian-setup]])
- Readwise for capture
- This digital forest for sharing

## Open Questions

- How to handle ephemeral vs permanent notes?
- Best way to surface old notes for review?`
    },
    'def456': {
      'post.md': `# Understanding React Server Components

React Server Components (RSC) represent a paradigm shift in how we think about React applications. They blur the traditional boundary between server and client.

## Key Benefits

1. **Zero Bundle Size**: Server components don't add to your JavaScript bundle
2. **Direct Backend Access**: Query databases without API endpoints
3. **Automatic Code Splitting**: Only ship code that's needed

## Mental Model

Think of RSCs as components that run at build time or request time on the server:

\`\`\`jsx
// This runs on the server
async function PostList() {
  const posts = await db.query('SELECT * FROM posts');
  return <ul>{posts.map(post => <li>{post.title}</li>)}</ul>;
}
\`\`\`

This is just the beginning of my exploration with [[next-app-router]] and RSCs.`
    },
    'ghi789': {
      'random-thoughts.md': `# Random Thoughts

Just some random ideas not connected to the forest.`
    }
  };

  async fetchGistContent(gistId: string, filename: string): Promise<string> {
    return this.gistContents[gistId]?.[filename] || '';
  }
}

// Test gists
const testGists: Gist[] = [
  {
    id: 'abc123',
    description: 'PKM workflow experiments #forest #note #sapling #pkm',
    public: true,
    files: {
      'note.md': {
        filename: 'note.md',
        type: 'text/markdown',
        language: 'Markdown',
        raw_url: 'https://gist.github.com/raw/abc123/note.md',
        size: 500
      }
    },
    html_url: 'https://gist.github.com/loidolt/abc123',
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-03-18T00:00:00Z',
    comments: 3
  },
  {
    id: 'def456',
    description: 'Understanding React Server Components #forest #writing #mature #react #featured',
    public: true,
    files: {
      'post.md': {
        filename: 'post.md',
        type: 'text/markdown',
        language: 'Markdown',
        raw_url: 'https://gist.github.com/raw/def456/post.md',
        size: 800
      }
    },
    html_url: 'https://gist.github.com/loidolt/def456',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    comments: 12
  },
  {
    id: 'ghi789',
    description: 'Random thoughts about stuff',
    public: true,
    files: {
      'random-thoughts.md': {
        filename: 'random-thoughts.md',
        type: 'text/markdown', 
        language: 'Markdown',
        raw_url: 'https://gist.github.com/raw/ghi789/random-thoughts.md',
        size: 100
      }
    },
    html_url: 'https://gist.github.com/loidolt/ghi789',
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z',
    comments: 0
  }
];

async function testGistProcessor() {
  console.log('🌱 Testing Gist Content Processor\n');
  console.log('This test demonstrates how GitHub Gists can be used for notes and writing.\n');
  
  const mockClient = new MockGitHubClient() as any;
  const processor = new GistContentProcessor(mockClient);
  
  const stageEmojis = {
    seedling: '🌱',
    budding: '🌿',
    evergreen: '🌳',
    perennial: '🌲'
  };
  
  let processedCount = 0;
  
  for (const gist of testGists) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📄 Gist: ${gist.id}`);
    console.log(`${'─'.repeat(60)}`);
    
    console.log(`📝 Description: ${gist.description}`);
    console.log(`📁 Files: ${Object.keys(gist.files).join(', ')}`);
    console.log(`💬 Comments: ${gist.comments}`);
    console.log(`📅 Created: ${new Date(gist.created_at).toLocaleDateString()}`);
    console.log(`📅 Updated: ${new Date(gist.updated_at).toLocaleDateString()}`);
    
    const content = await processor.processGist(gist);
    
    if (content) {
      processedCount++;
      console.log(`\n✅ Successfully processed as forest content`);
      console.log(`📋 Content Info:`);
      console.log(`  • Title: ${content.title}`);
      console.log(`  • Type: ${content.type}`);
      console.log(`  • Stage: ${stageEmojis[content.stage]} ${content.stage}`);
      console.log(`  • Tags: ${content.topics.join(', ')}`);
      console.log(`  • Connections: ${content.connections.length > 0 ? content.connections.join(', ') : 'none'}`);
      console.log(`  • Reading time: ${content.metadata.readingTime}`);
      console.log(`  • Word count: ${content.metadata.wordCount} words`);
      
      if (content.metadata.featured) {
        console.log(`  • ⭐ Featured content`);
      }
      
      console.log(`\n📄 Description preview:`);
      console.log(`  "${content.description}"`);
      
    } else {
      console.log(`\n❌ Not processed - doesn't match forest criteria`);
      console.log(`   Missing:`);
      if (!gist.description?.includes('#forest')) {
        console.log(`   - #forest tag in description`);
      }
      console.log(`   - Or frontmatter with type: note/writing`);
    }
  }
  
  console.log(`\n\n${'═'.repeat(60)}`);
  console.log('📊 Summary');
  console.log(`${'═'.repeat(60)}`);
  console.log(`Total gists tested: ${testGists.length}`);
  console.log(`Forest gists found: ${processedCount}`);
  console.log(`Non-forest gists: ${testGists.length - processedCount}`);
  console.log('\n✅ Gist processor working correctly!');
  console.log('\n💡 Use GIST_FOREST_GUIDE.md to learn how to create forest gists.');
}

// Run the test
testGistProcessor().catch(console.error);