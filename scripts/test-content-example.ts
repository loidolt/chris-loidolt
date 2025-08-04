import { ContentProcessor } from '../lib/content/processor';
import { EnhancedContentProcessor } from '../lib/content/enhanced-processor';
import type { Repository } from '../types';

// Example repository configurations
const exampleRepos: Repository[] = [
  {
    name: 'my-react-portfolio',
    full_name: 'loidolt/my-react-portfolio',
    description: 'A modern portfolio built with React and Next.js',
    topics: ['project', 'portfolio', 'evergreen'],
    html_url: 'https://github.com/loidolt/my-react-portfolio',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
    pushed_at: '2024-03-20T00:00:00Z',
    stargazers_count: 42,
    language: 'TypeScript',
    default_branch: 'main'
  },
  {
    name: 'understanding-react-hooks',
    full_name: 'loidolt/understanding-react-hooks',
    description: 'A comprehensive guide to React Hooks with examples',
    topics: ['writing', 'evergreen', 'featured'],
    html_url: 'https://github.com/loidolt/understanding-react-hooks',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    pushed_at: '2024-03-15T00:00:00Z',
    stargazers_count: 128,
    language: 'Markdown',
    default_branch: 'main'
  },
  {
    name: 'productivity-systems',
    full_name: 'loidolt/productivity-systems',
    description: 'My evolving thoughts on productivity and time management',
    topics: ['note', 'garden', 'budding'],
    html_url: 'https://github.com/loidolt/productivity-systems',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z',
    pushed_at: '2024-03-10T00:00:00Z',
    stargazers_count: 15,
    language: null,
    default_branch: 'main'
  },
  {
    name: 'webgl-experiments',
    full_name: 'loidolt/webgl-experiments',
    description: 'Exploring 3D graphics in the browser',
    topics: ['experiment', 'project', 'seedling'],
    html_url: 'https://github.com/loidolt/webgl-experiments',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-18T00:00:00Z',
    pushed_at: '2024-03-18T00:00:00Z',
    stargazers_count: 8,
    language: 'JavaScript',
    default_branch: 'main'
  }
];

// Example README contents
const exampleReadmes: Record<string, string> = {
  'my-react-portfolio': `---
title: My React Portfolio
type: project
stage: evergreen
tags: [react, nextjs, typescript, portfolio]
featured: true
---

# My React Portfolio

A modern, responsive portfolio website built with React and Next.js, showcasing my projects and skills.

## 🚀 Features

- **Responsive Design**: Looks great on all devices
- **Dark Mode**: Toggle between light and dark themes
- **Performance**: Optimized with Next.js static generation
- **SEO Friendly**: Built-in SEO optimization
- **Accessible**: WCAG compliant

## 🛠️ Tech Stack

- React 18
- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion

## 📸 Screenshots

![Portfolio Homepage](./screenshots/home.png)
![Project Gallery](./screenshots/projects.png)

## 🏃‍♂️ Running Locally

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit http://localhost:3000 to see the portfolio.

## 📝 License

MIT License - feel free to use this as a template for your own portfolio!`,

  'understanding-react-hooks': `---
title: Understanding React Hooks - A Comprehensive Guide
description: Master React Hooks with practical examples and best practices
type: writing
stage: evergreen
tags: [react, javascript, hooks, tutorial, frontend]
planted: 2024-01-01
tended: 2024-03-15
---

# Understanding React Hooks

React Hooks have revolutionized how we write React components, enabling state and lifecycle features in functional components. This guide covers everything you need to know about [[react-hooks-fundamentals]].

## Table of Contents

1. Introduction to Hooks
2. The Rules of Hooks
3. Built-in Hooks Deep Dive
4. Custom Hooks Patterns
5. Performance Optimization
6. Common Pitfalls

## Why Hooks?

Before Hooks, component logic was scattered between lifecycle methods. Hooks allow us to organize logic by feature rather than lifecycle timing. They work seamlessly with [[functional-programming-react]].

## Core Hooks

### useState

The most fundamental hook for managing component state:

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

### useEffect

Handle side effects in your components:

\`\`\`javascript
useEffect(() => {
  // Effect logic
  return () => {
    // Cleanup
  };
}, [dependencies]);
\`\`\`

[Continue reading for advanced patterns and examples...]

## Related Topics

- [[react-performance-optimization]]
- [[custom-hooks-library]]
- [[state-management-patterns]]`,

  'productivity-systems': `---
title: Building Personal Productivity Systems
stage: budding
type: note
connections:
  - time-management-matrix
  - deep-work-principles
  - getting-things-done
tags: [productivity, systems, personal-development]
---

# Building Personal Productivity Systems

These are my evolving thoughts on creating sustainable productivity systems that actually work in real life. Unlike prescriptive methodologies, I believe in [[adaptive-systems]] that grow with you.

## Core Principles

### 1. Systems Over Goals

Goals are destinations, but systems are the vehicle. I've found that focusing on building good systems leads to achieving goals naturally. This connects with [[atomic-habits-implementation]].

### 2. Energy Management > Time Management

Traditional time management assumes all hours are equal. They're not. Understanding your [[energy-rhythms]] is crucial for sustainable productivity.

### 3. Capture Everything, Process Regularly

Inspired by [[getting-things-done]], but simplified:
- One capture point for all inputs
- Weekly review to process and organize
- Daily check-in for priorities

## My Current Stack

- **Task Management**: Todoist with custom labels
- **Knowledge Base**: Obsidian with [[zettelkasten-method]]
- **Time Tracking**: Toggl for reality checks
- **Focus Sessions**: Pomodoro technique variations

## Experiments in Progress

Currently testing:
- Morning pages for clarity
- Time-boxing for deep work sessions
- Digital minimalism practices

## Open Questions

- How to balance structure with flexibility?
- What's the minimum viable productivity system?
- How to handle context switching in modern work?

*Last updated: March 2024*`,

  'webgl-experiments': `# WebGL Particle System Experiments

Exploring real-time particle physics and rendering techniques in the browser using WebGL and Three.js.

## 🧪 Current Experiments

### Particle Storm
- 100,000+ particles rendered at 60fps
- GPU-based physics calculations
- Interactive mouse controls

### Fluid Simulation
- SPH (Smoothed Particle Hydrodynamics) implementation
- Real-time fluid dynamics
- Work in progress - some stability issues

## 🔧 Technical Details

Using WebGL 2.0 features:
- Transform feedback for GPU physics
- Instanced rendering for performance
- Custom shaders for particle effects

## 🚀 Demo

[Live Demo](https://webgl-particles.example.com)

**Controls:**
- Click and drag to create forces
- Scroll to zoom
- Space to pause/resume

## 📚 Learnings

1. **Particle Pooling**: Pre-allocating particles is crucial for performance
2. **GPU Memory**: Careful management prevents crashes
3. **Mobile Optimization**: Reduce particle count on mobile devices

## 🔗 Resources

- [[webgl-fundamentals]]
- [[gpu-programming-patterns]]
- [Three.js Documentation](https://threejs.org/docs/)

## Next Steps

- [ ] Add collision detection
- [ ] Implement particle trails
- [ ] Create preset animations
- [ ] Build interactive playground

*Status: Proof of concept - not production ready*`
};

// Mock GitHub client for testing
class MockGitHubClient {
  async fetchRepoContent(repo: string, path: string): Promise<string> {
    if (path.includes('README')) {
      return exampleReadmes[repo] || '';
    }
    
    if (path === 'metadata.json' && repo === 'my-react-portfolio') {
      return JSON.stringify({
        showcase: true,
        deployUrl: 'https://portfolio.example.com',
        technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS']
      });
    }
    
    return '';
  }
}

async function testExampleContent() {
  console.log('🧪 Testing Content Processing with Example Repositories\n');
  
  const mockClient = new MockGitHubClient() as any;
  const processor = new ContentProcessor(mockClient);
  const enhancedProcessor = new EnhancedContentProcessor(mockClient);
  
  for (const repo of exampleRepos) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📁 Repository: ${repo.name}`);
    console.log(`${'='.repeat(60)}`);
    
    console.log(`\n📋 Repository Info:`);
    console.log(`  • Full Name: ${repo.full_name}`);
    console.log(`  • Description: ${repo.description}`);
    console.log(`  • Topics: ${repo.topics.join(', ')}`);
    console.log(`  • Language: ${repo.language || 'Not specified'}`);
    console.log(`  • Stars: ⭐ ${repo.stargazers_count}`);
    console.log(`  • Created: ${new Date(repo.created_at).toLocaleDateString()}`);
    console.log(`  • Last Updated: ${new Date(repo.pushed_at).toLocaleDateString()}`);
    
    const content = await enhancedProcessor.processRepository(repo);
    
    if (content) {
      console.log(`\n✅ Successfully Processed:`);
      console.log(`  • Title: ${content.title}`);
      console.log(`  • Type: ${content.type}`);
      console.log(`  • Stage: ${content.stage} ${getStageEmoji(content.stage)}`);
      console.log(`  • Description: ${content.description.slice(0, 80)}...`);
      console.log(`  • Word Count: ${content.metadata.wordCount} words`);
      console.log(`  • Reading Time: ${content.metadata.readingTime}`);
      console.log(`  • Connections: ${content.connections.length > 0 ? content.connections.join(', ') : 'None'}`);
      console.log(`  • All Tags: ${content.topics.join(', ')}`);
      
      if (content.metadata.references?.length > 0) {
        console.log(`  • External References: ${content.metadata.references.length}`);
      }
      
      if (content.metadata.images?.length > 0) {
        console.log(`  • Images: ${content.metadata.images.length}`);
      }
      
      // Show how it would be categorized
      console.log(`\n📂 Categorization:`);
      if (repo.topics.includes('featured')) {
        console.log(`  • Would appear in: Featured Section`);
      }
      if (repo.topics.includes('portfolio')) {
        console.log(`  • Would appear in: Portfolio`);
      }
      console.log(`  • Would appear in: ${capitalize(content.type)} Section`);
      console.log(`  • Growth Stage: ${capitalize(content.stage)} Collection`);
      
    } else {
      console.log(`\n❌ Failed to process repository`);
    }
  }
  
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('📊 Summary');
  console.log(`${'='.repeat(60)}`);
  console.log(`Total repositories: ${exampleRepos.length}`);
  console.log(`Types: ${[...new Set(exampleRepos.map(r => r.topics).flat())].join(', ')}`);
  console.log('\n✅ All example repositories processed successfully!');
  console.log('\n💡 Use the REPO_CONFIGURATION_GUIDE.md to configure your repositories similarly.');
}

function getStageEmoji(stage: string): string {
  const emojis: Record<string, string> = {
    seedling: '🌱',
    budding: '🌿',
    evergreen: '🌳'
  };
  return emojis[stage] || '🌱';
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Run the test
testExampleContent().catch(console.error);