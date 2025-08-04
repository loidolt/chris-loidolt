import dotenv from 'dotenv';
import { GitHubClient } from '../lib/github/client';
import { ContentProcessor } from '../lib/content/processor';
import { EnhancedContentProcessor } from '../lib/content/enhanced-processor';
import { DiscoveryEngine } from '../lib/discovery/engine';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testContentProcessing() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;

  if (!token || !owner) {
    console.error('❌ Missing GITHUB_TOKEN or GITHUB_OWNER environment variables');
    process.exit(1);
  }

  console.log('🚀 Testing Content Processing');
  console.log(`👤 Owner: ${owner}`);
  console.log('');

  try {
    // Initialize clients
    const client = new GitHubClient(token, owner);
    const discovery = new DiscoveryEngine(client);
    const basicProcessor = new ContentProcessor(client);
    const enhancedProcessor = new EnhancedContentProcessor(client);

    // Discover repositories
    console.log('🔍 Discovering repositories...');
    const repos = await discovery.discover();
    console.log(`📚 Found ${repos.length} repositories`);

    // Test with first few repos
    const testRepos = repos.slice(0, 3);
    
    for (const repo of testRepos) {
      console.log(`\n📁 Processing: ${repo.name}`);
      console.log(`  📝 Description: ${repo.description || 'No description'}`);
      console.log(`  🏷️  Topics: ${repo.topics.join(', ') || 'No topics'}`);
      
      // Test basic processor
      console.log('\n  🔧 Basic Processor:');
      const basicContent = await basicProcessor.processRepository(repo);
      
      if (basicContent) {
        console.log(`    ✅ Title: ${basicContent.title}`);
        console.log(`    📊 Type: ${basicContent.type}`);
        console.log(`    🌱 Stage: ${basicContent.stage}`);
        console.log(`    📖 Reading time: ${basicContent.metadata.readingTime}`);
        console.log(`    🔗 Connections: ${basicContent.connections.length}`);
      } else {
        console.log('    ❌ Failed to process');
      }
      
      // Test enhanced processor
      console.log('\n  🔧 Enhanced Processor:');
      const enhancedContent = await enhancedProcessor.processRepository(repo);
      
      if (enhancedContent) {
        console.log(`    ✅ Title: ${enhancedContent.title}`);
        console.log(`    📊 Type: ${enhancedContent.type}`);
        console.log(`    🌱 Stage: ${enhancedContent.stage}`);
        console.log(`    📖 Reading time: ${enhancedContent.metadata.readingTime}`);
        console.log(`    📝 Word count: ${enhancedContent.metadata.wordCount}`);
        console.log(`    🔗 Connections: ${enhancedContent.connections.length}`);
        console.log(`    📚 References: ${enhancedContent.metadata.references?.length || 0}`);
        console.log(`    🖼️  Images: ${enhancedContent.metadata.images?.length || 0}`);
        console.log(`    💫 Is MDX: ${enhancedContent.metadata.isMDX ? 'Yes' : 'No'}`);
        
        // Show extracted description
        if (enhancedContent.description) {
          console.log(`    📄 Description: ${enhancedContent.description.slice(0, 100)}...`);
        }
      } else {
        console.log('    ❌ Failed to process');
      }
    }

    // Test specific content features
    console.log('\n\n🧪 Testing Content Features:');
    
    // Create a test markdown content
    const testMarkdown = `---
title: Test Content
description: This is a test
type: note
stage: budding
tags: [test, demo]
---

# Test Content

This is a test paragraph with a [[connection]] to another note.

## Features

- Wiki-style links: [[Another Note]]
- Obsidian links: [[Some Topic|Custom Text]]
- Regular links: [GitHub](https://github.com)
- Images: ![Test Image](https://example.com/image.png)

[reference-link]: https://example.com/reference

### Code Example

\`\`\`javascript
console.log('Hello, World!');
\`\`\`
`;

    console.log('\n📝 Processing test markdown...');
    const { data: frontmatter, content } = await import('gray-matter').then(m => m.default(testMarkdown));
    
    console.log('  📋 Extracted frontmatter:');
    console.log(`    - Title: ${frontmatter.title}`);
    console.log(`    - Type: ${frontmatter.type}`);
    console.log(`    - Stage: ${frontmatter.stage}`);
    console.log(`    - Tags: ${frontmatter.tags.join(', ')}`);

    console.log('\n✅ Content processing tests completed!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
    process.exit(1);
  }
}

// Run the test
testContentProcessing();