import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Supabase
  },
});

export const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE,
        password_hash TEXT,
        wallet_address TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'premium', 'admin')),
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS risk_score_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        wallet_address TEXT,
        score SMALLINT,
        data_hash TEXT,
        tx_hash TEXT,
        recorded_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        alert_type TEXT CHECK (alert_type IN ('price','risk','apy','liquidation')),
        token_address TEXT,
        threshold NUMERIC(20,6),
        direction TEXT CHECK (direction IN ('above','below')),
        is_active BOOLEAN DEFAULT true,
        last_triggered TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  } finally {
    client.release();
  }
};
