import { pool } from "../config/db.js";

export const sanitizeUser = (user) => {
  if (!user) return null;
  const { password_hash, ...sanitized } = user;
  return sanitized;
};

export const createUser = async (email, passwordHash, walletAddress) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO users (email, password_hash, wallet_address) VALUES ($1, $2, $3) RETURNING id, email, wallet_address, role, created_at`,
      [email, passwordHash, walletAddress],
    );
    return sanitizeUser(result.rows[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const findUserByEmail = async (email) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const findUserByWallet = async (walletAddress) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM users WHERE wallet_address = $1`,
      [walletAddress],
    );
    return sanitizeUser(result.rows[0]);
  } catch (error) {
    console.error("Error finding user by wallet address:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const findUserById = async (id) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`SELECT * FROM users WHERE id = $1`, [
      id,
    ]);
    return sanitizeUser(result.rows[0]);
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error;
  } finally {
    client.release();
  }
};
