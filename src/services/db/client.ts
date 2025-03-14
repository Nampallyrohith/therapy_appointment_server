import pg from "pg";
import env from "../../config.js";

const pool = new pg.Pool({
  host: env.DBHOST,
  port: env.DBPORT,
  user: env.DBUSER,
  password: env.DBPASS,
  database: env.DBNAME,
  max: 10, // Allow up to 10 connections
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Wait 5 seconds before timing out
});

// Function to test the database connection
export const connectAndQuery = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query(`SELECT NOW()`);
    console.log("Connected to Supabase database at:", res.rows[0].now);
    client.release(); // Release connection back to the pool
  } catch (err) {
    console.error("Database Connection Error:", err);
  }
};

export default pool; // Export the pool for querying
