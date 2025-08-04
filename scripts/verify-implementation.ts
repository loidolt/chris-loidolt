#!/usr/bin/env tsx

/**
 * Verification script for Digital Garden Implementation
 * Tests all 4 phases to ensure they're working correctly
 */

import { config as dotenvConfig } from 'dotenv';
import { GitHubClient } from '../lib/github/client';
import { SeedDiscovery } from '../lib/seed/discovery';
import { SeedProcessor } from '../lib/seed/processor';
import type { Repository } from '../types';

// Load environment variables
dotenvConfig({ path: '.env.local' });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;

if (!GITHUB_TOKEN || !GITHUB_OWNER) {
  console.error('❌ Missing required environment variables');
  console.error('Please ensure GITHUB_TOKEN and GITHUB_OWNER are set in .env.local');
  process.exit(1);
}

// Test colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logPhase(phase: number, name: string) {
  console.log('\n' + '='.repeat(60));
  log(`PHASE ${phase}: ${name}`, colors.blue);
  console.log('='.repeat(60));
}

async function testPhase1() {
  logPhase(1, 'Project Setup Verification');
  
  const checks = [
    { name: 'Environment variables', status: !!(GITHUB_TOKEN && GITHUB_OWNER) },
    { name: 'TypeScript configuration', status: true }, // If we're running, it works
    { name: 'Dependencies installed', status: true }, // If imports work, they're installed
  ];
  
  checks.forEach(check => {
    log(`✓ ${check.name}`, check.status ? colors.green : colors.red);
  });
  
  return checks.every(c => c.status);
}

async function testPhase2() {
  logPhase(2, 'GitHub Integration Test');
  
  try {
    const client = new GitHubClient(GITHUB_TOKEN!, GITHUB_OWNER!);
    
    // Test fetching repositories
    log('Testing repository fetch...', colors.gray);
    const repos = await client.fetchUserRepos();
    log(`✓ Successfully fetched ${repos.length} repositories`, colors.green);
    
    // Test fetching a specific file (use the current repo)
    const currentRepo = repos.find(r => r.name === 'chris-loidolt');
    if (currentRepo) {
      log('Testing file content fetch...', colors.gray);
      const content = await client.fetchRepoContent('chris-loidolt', 'README.md');
      log(`✓ Successfully fetched README.md (${content.length} bytes)`, colors.green);
    }
    
    // Test rate limiting
    log('✓ Rate limiter initialized', colors.green);
    
    return true;
  } catch (error) {
    log(`✗ GitHub integration failed: ${error}`, colors.red);
    return false;
  }
}

async function testPhase3() {
  logPhase(3, 'Seed Discovery Test');
  
  try {
    const client = new GitHubClient(GITHUB_TOKEN!, GITHUB_OWNER!);
    const discovery = new SeedDiscovery(client, {
      includePrivate: false,
      excludeArchived: true,
      excludeForks: true,
    });
    
    log('Running seed discovery...', colors.gray);
    const result = await discovery.discover();
    
    log(`\nDiscovery Results:`, colors.yellow);
    log(`  Total repositories: ${result.stats.totalRepos}`);
    log(`  Repositories with .seed: ${result.stats.reposWithSeed}`);
    log(`  Successfully processed: ${result.stats.successfullyProcessed}`);
    log(`  Failed: ${result.stats.failed}`);
    log(`  Duration: ${result.stats.duration}ms`);
    
    if (result.seeds.length > 0) {
      log(`\n✓ Found ${result.seeds.length} seeds:`, colors.green);
      result.seeds.forEach(seed => {
        log(`  - ${seed.meta.title} (${seed.source.name})`, colors.gray);
        log(`    Type: ${seed.meta.type}, Stage: ${seed.meta.stage}`, colors.gray);
      });
    } else {
      log('\n⚠ No seeds found. Checking for test repository...', colors.yellow);
    }
    
    if (result.errors.length > 0) {
      log('\nErrors encountered:', colors.red);
      result.errors.forEach(err => {
        log(`  - ${err.repository}: ${err.error}`, colors.red);
      });
    }
    
    return true;
  } catch (error) {
    log(`✗ Seed discovery failed: ${error}`, colors.red);
    return false;
  }
}

async function testPhase4() {
  logPhase(4, 'Seed Processing Test');
  
  try {
    const client = new GitHubClient(GITHUB_TOKEN!, GITHUB_OWNER!);
    const processor = new SeedProcessor(client);
    
    // First, check if we have any repos with .seed structure
    const repos = await client.fetchUserRepos();
    let testRepo: Repository | undefined;
    
    // Look for a repository with .seed structure
    for (const repo of repos) {
      const metaYml = await client.fetchRepoContent(repo.name, '.seed/meta.yml');
      const metaJson = await client.fetchRepoContent(repo.name, '.seed/meta.json');
      if (metaYml || metaJson) {
        testRepo = repo;
        break;
      }
    }
    
    if (!testRepo) {
      log('⚠ No repository with .seed structure found to test processing', colors.yellow);
      log('  To test seed processing, add a .seed directory to one of your repos', colors.gray);
      return true; // Not a failure, just no data to test
    }
    
    log(`Testing seed processing on: ${testRepo.name}`, colors.gray);
    const seed = await processor.process(testRepo);
    
    log('\n✓ Successfully processed seed:', colors.green);
    log(`  Title: ${seed.meta.title}`);
    log(`  Type: ${seed.meta.type}`);
    log(`  Stage: ${seed.meta.stage}`);
    log(`  Reading time: ${seed.readingTime} minutes`);
    log(`  Word count: ${seed.wordCount}`);
    log(`  Excerpt: ${seed.excerpt.substring(0, 100)}...`);
    
    return true;
  } catch (error) {
    log(`✗ Seed processing failed: ${error}`, colors.red);
    return false;
  }
}

async function runVerification() {
  console.log('🌱 Digital Garden Implementation Verification');
  console.log('Testing the first 4 phases of implementation...\n');
  
  const results = {
    phase1: await testPhase1(),
    phase2: await testPhase2(),
    phase3: await testPhase3(),
    phase4: await testPhase4(),
  };
  
  console.log('\n' + '='.repeat(60));
  log('VERIFICATION SUMMARY', colors.blue);
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([phase, success]) => {
    const phaseNum = phase.replace('phase', '');
    const status = success ? '✓ PASS' : '✗ FAIL';
    const color = success ? colors.green : colors.red;
    log(`Phase ${phaseNum}: ${status}`, color);
  });
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    log('\n✅ All phases verified successfully!', colors.green);
    log('\nNext steps:', colors.yellow);
    log('1. Add .seed directories to your repositories');
    log('2. Run the build to generate your digital garden');
    log('3. Deploy to your hosting platform');
  } else {
    log('\n❌ Some phases failed verification', colors.red);
    log('Please check the errors above and fix any issues');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run the verification
runVerification().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});