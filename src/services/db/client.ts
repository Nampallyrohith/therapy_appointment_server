import pg from "pg";
import env from "../../config.js";

export const client = new pg.Client({
  host: env.DBHOST,
  port: env.DBPORT,
  user: env.DBUSER,
  password: env.DBPASS,
  database: env.DBNAME,
});

await client.connect();

export const connectAndQuery = () => {
  client.query(`SELECT NOW()`, (err, res) => {
    if (!err) {
      console.log("Connected to supabase database.");
    } else {
      console.log(err.message);
    }
  });
};
