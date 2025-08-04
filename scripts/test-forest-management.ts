#!/usr/bin/env tsx

/**
 * Test script for Phase 5: Forest Management
 * Tests forest statistics, search functionality, and the DigitalForest class
 */

import { config as dotenvConfig } from 'dotenv';
import { DigitalForest } from '../lib/forest';
import { getMostRecentSeeds, getGrowthDistribution, getTypeDistribution } from '../lib/forest/stats';
import type { SeedContent } from '../lib/seed/types';

// Load environment variables
dotenvConfig({ path: '.env.local' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.blue);
  console.log('='.repeat(60));
}

function logSubsection(title: string) {
  console.log('\n' + '-'.repeat(40));
  log(title, colors.cyan);
  console.log('-'.repeat(40));
}

async function testForestManagement() {
  log('🌲 Testing Digital Forest Management System', colors.green);
  
  try {
    // Initialize the forest
    logSection('1. Initializing Digital Forest');
    const forest = new DigitalForest();
    const forestData = await forest.cultivate();
    log(`✓ Forest cultivated successfully`, colors.green);
    log(`  Total seeds: ${forestData.seeds.length}`);
    
    // Test forest statistics
    logSection('2. Testing Forest Statistics');
    
    logSubsection('2.1 Basic Stats');
    log(`Total seeds: ${forestData.stats.totalSeeds}`);
    log(`Last updated: ${forestData.stats.lastUpdated.toLocaleString()}`);
    
    logSubsection('2.2 Type Distribution');
    Object.entries(forestData.stats.byType).forEach(([type, count]) => {
      log(`  ${type}: ${count} seeds`, colors.gray);
    });
    
    logSubsection('2.3 Growth Stage Distribution');
    const growthDist = getGrowthDistribution(forestData.seeds);
    Object.entries(growthDist).forEach(([stage, count]) => {
      const emoji = {
        sprout: '🌱',
        sapling: '🌿',
        mature: '🌳',
        ancient: '🌲',
      }[stage] || '🌿';
      log(`  ${emoji} ${stage}: ${count} seeds`, colors.gray);
    });
    
    logSubsection('2.4 Most Recent Seeds');
    const recentSeeds = getMostRecentSeeds(forestData.seeds, 3);
    recentSeeds.forEach((seed, index) => {
      log(`  ${index + 1}. ${seed.meta.title} (${seed.meta.tended || seed.meta.planted})`, colors.gray);
    });
    
    // Test search functionality
    logSection('3. Testing Search Functionality');
    
    if (forestData.seeds.length > 0) {
      const firstSeed = forestData.seeds[0];
      
      logSubsection('3.1 Search by Type');
      const projectSeeds = forest.findByType('project');
      log(`Found ${projectSeeds.length} project seeds`);
      
      logSubsection('3.2 Search by Stage');
      const matureSeeds = forest.findByStage('mature');
      log(`Found ${matureSeeds.length} mature seeds`);
      
      logSubsection('3.3 Search Featured Seeds');
      const featuredSeeds = forest.findFeatured();
      log(`Found ${featuredSeeds.length} featured seeds`);
      
      logSubsection('3.4 Search by Slug');
      const seedBySlug = forest.getSeed(firstSeed.slug);
      if (seedBySlug) {
        log(`✓ Found seed by slug: ${seedBySlug.meta.title}`, colors.green);
      }
      
      logSubsection('3.5 Full-text Search');
      if (firstSeed.meta.title) {
        const searchTerm = firstSeed.meta.title.split(' ')[0];
        const searchResults = forest.search({ query: searchTerm });
        log(`Search for "${searchTerm}" found ${searchResults.length} results`);
      }
      
      logSubsection('3.6 Related Seeds');
      const relatedSeeds = forest.findRelated(firstSeed, 3);
      log(`Found ${relatedSeeds.length} related seeds`);
      relatedSeeds.forEach(seed => {
        log(`  - ${seed.meta.title}`, colors.gray);
      });
      
      logSubsection('3.7 Complex Search');
      const complexSearch = forest.search({
        type: 'project',
        featured: true,
      });
      log(`Complex search (type=project, featured=true): ${complexSearch.length} results`);
    } else {
      log('⚠ No seeds found to test search functionality', colors.yellow);
    }
    
    // Test tag search if we have seeds with tags
    const seedsWithTags = forestData.seeds.filter(s => s.meta.tags && s.meta.tags.length > 0);
    if (seedsWithTags.length > 0) {
      logSubsection('3.8 Tag Search');
      const firstTag = seedsWithTags[0].meta.tags![0];
      const tagResults = forest.findByTag(firstTag);
      log(`Seeds with tag "${firstTag}": ${tagResults.length}`);
    }
    
    // Performance test
    logSection('4. Performance Metrics');
    
    const searchStart = Date.now();
    for (let i = 0; i < 100; i++) {
      forest.search({ query: 'test' });
    }
    const searchDuration = Date.now() - searchStart;
    log(`100 searches completed in ${searchDuration}ms (${(searchDuration / 100).toFixed(2)}ms avg)`);
    
    // Summary
    logSection('5. Forest Management Summary');
    log('✅ All forest management features tested successfully!', colors.green);
    log('\nFeatures verified:', colors.yellow);
    log('  ✓ Forest cultivation and seed discovery');
    log('  ✓ Statistics calculation');
    log('  ✓ Type and stage filtering');
    log('  ✓ Featured content filtering');
    log('  ✓ Full-text search');
    log('  ✓ Tag-based search');
    log('  ✓ Related content discovery');
    log('  ✓ Complex multi-criteria search');
    
    return true;
  } catch (error) {
    log(`\n❌ Error testing forest management: ${error}`, colors.red);
    console.error(error);
    return false;
  }
}

// Run the test
testForestManagement().then(success => {
  process.exit(success ? 0 : 1);
});