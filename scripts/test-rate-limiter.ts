import { RateLimiter } from '../lib/github/rate-limiter';

async function testRateLimiter() {
  console.log('🧪 Testing Rate Limiter...\n');
  
  const rateLimiter = new RateLimiter();
  const startTime = Date.now();
  
  // Create multiple async tasks
  const tasks = Array.from({ length: 5 }, (_, i) => async () => {
    const taskStart = Date.now();
    console.log(`Task ${i + 1}: Started at ${taskStart - startTime}ms`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const taskEnd = Date.now();
    console.log(`Task ${i + 1}: Completed at ${taskEnd - startTime}ms (duration: ${taskEnd - taskStart}ms)`);
    return i + 1;
  });
  
  console.log('Executing 5 tasks through rate limiter...\n');
  
  // Execute all tasks through rate limiter
  const results = await Promise.all(
    tasks.map(task => rateLimiter.execute(task))
  );
  
  const endTime = Date.now();
  console.log('\n✅ All tasks completed!');
  console.log(`Results: ${results.join(', ')}`);
  console.log(`Total time: ${endTime - startTime}ms`);
  
  // Calculate expected time with rate limiting
  const expectedDelay = (3600000 / 5000) * 4; // 4 delays between 5 tasks
  console.log(`\nRate limiter adds ~${Math.round(3600000 / 5000)}ms delay between requests`);
  console.log(`Expected minimum time: ~${expectedDelay + 500}ms (with 100ms per task)`);
}

testRateLimiter();