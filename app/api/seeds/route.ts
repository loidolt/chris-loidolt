import { NextResponse } from 'next/server';
import { DigitalForest } from '@/lib/forest';
import type { SearchOptions } from '@/lib/forest/search';
import type { ContentType, GrowthStage } from '@/lib/seed/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const stage = searchParams.get('stage');
    const featured = searchParams.get('featured');
    const query = searchParams.get('q');
    const tag = searchParams.get('tag');
    const limit = searchParams.get('limit');
    
    const forest = new DigitalForest();
    await forest.cultivate();
    
    // Use forest search method if query parameters are provided
    const searchOptions: SearchOptions = {};
    if (type) searchOptions.type = type as ContentType;
    if (stage) searchOptions.stage = stage as GrowthStage;
    if (featured === 'true') searchOptions.featured = true;
    if (query) searchOptions.query = query;
    if (tag) searchOptions.tags = [tag];
    
    let filteredSeeds = Object.keys(searchOptions).length > 0 
      ? forest.search(searchOptions)
      : forest.getAllSeeds();
    
    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        filteredSeeds = filteredSeeds.slice(0, limitNum);
      }
    }
    
    return NextResponse.json({
      seeds: filteredSeeds,
      count: filteredSeeds.length,
    });
  } catch (error) {
    console.error('Error fetching seeds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seeds' },
      { status: 500 }
    );
  }
}