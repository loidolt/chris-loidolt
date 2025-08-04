import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export class CacheManager {
  private cacheDir: string;
  private ttl: number;

  constructor(ttl = 3600000) { // 1 hour default
    this.cacheDir = path.join(process.cwd(), '.cache');
    this.ttl = ttl;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const hash = this.hash(key);
      const filePath = path.join(this.cacheDir, `${hash}.json`);
      
      const stats = await fs.stat(filePath);
      const age = Date.now() - stats.mtimeMs;
      
      if (age > this.ttl) {
        await fs.unlink(filePath);
        return null;
      }
      
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    await fs.mkdir(this.cacheDir, { recursive: true });
    
    const hash = this.hash(key);
    const filePath = path.join(this.cacheDir, `${hash}.json`);
    
    await fs.writeFile(filePath, JSON.stringify(value, null, 2));
  }

  async delete(key: string): Promise<void> {
    try {
      const hash = this.hash(key);
      const filePath = path.join(this.cacheDir, `${hash}.json`);
      await fs.unlink(filePath);
    } catch {
      // Ignore errors if file doesn't exist
    }
  }

  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files.map(file => 
          fs.unlink(path.join(this.cacheDir, file))
        )
      );
    } catch {
      // Ignore errors if directory doesn't exist
    }
  }

  private hash(key: string): string {
    return crypto.createHash('md5').update(key).digest('hex');
  }
}