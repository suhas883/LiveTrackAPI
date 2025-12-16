import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const result = await pool.query(
        'SELECT * FROM tracking_history ORDER BY searched_at DESC LIMIT 10'
      );
      return res.status(200).json(result.rows);
    }
    
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'ID required' });
      }
      await pool.query('DELETE FROM tracking_history WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[History API] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
