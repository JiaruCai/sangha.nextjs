import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDb(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

export async function initializeDatabase(): Promise<void> {
  const db = getDb();
  
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_stats (
        id SERIAL PRIMARY KEY,
        post_id VARCHAR(255) UNIQUE NOT NULL,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_blog_stats_post_id ON blog_stats(post_id);
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export async function getBlogStats(postId?: string): Promise<Record<string, { views: number; likes: number }>> {
  const db = getDb();
  
  try {
    let query = 'SELECT post_id, views, likes FROM blog_stats';
    let params: string[] = [];
    
    if (postId) {
      query += ' WHERE post_id = $1';
      params = [postId];
    }
    
    const result = await db.query(query, params);
    
    const stats: Record<string, { views: number; likes: number }> = {};
    result.rows.forEach(row => {
      stats[row.post_id] = {
        views: parseInt(row.views),
        likes: parseInt(row.likes)
      };
    });
    
    return stats;
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    throw error;
  }
}

export async function updateBlogStats(
  postId: string, 
  type: 'view' | 'like' | 'unlike',
  increment: number = 1
): Promise<{ views: number; likes: number }> {
  const db = getDb();
  
  try {
    await db.query(`
      INSERT INTO blog_stats (post_id, views, likes)
      VALUES ($1, 0, 0)
      ON CONFLICT (post_id) DO NOTHING
    `, [postId]);
    
    let updateQuery: string;
    let params: (string | number)[];
    
    if (type === 'view') {
      updateQuery = `
        UPDATE blog_stats 
        SET views = views + $2, updated_at = CURRENT_TIMESTAMP
        WHERE post_id = $1
        RETURNING views, likes
      `;
      params = [postId, increment];
    } else if (type === 'like') {
      updateQuery = `
        UPDATE blog_stats 
        SET likes = likes + $2, updated_at = CURRENT_TIMESTAMP
        WHERE post_id = $1
        RETURNING views, likes
      `;
      params = [postId, increment];
    } else { // unlike
      updateQuery = `
        UPDATE blog_stats 
        SET likes = GREATEST(0, likes - $2), updated_at = CURRENT_TIMESTAMP
        WHERE post_id = $1
        RETURNING views, likes
      `;
      params = [postId, increment];
    }
    
    const result = await db.query(updateQuery, params);
    
    if (result.rows.length === 0) {
      throw new Error(`Post ${postId} not found`);
    }
    
    return {
      views: parseInt(result.rows[0].views),
      likes: parseInt(result.rows[0].likes)
    };
  } catch (error) {
    console.error('Error updating blog stats:', error);
    throw error;
  }
}