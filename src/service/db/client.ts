import pkg from "pg";
import env from "../../config.js";

const { Client } = pkg;

export const client = new Client({
  host: env.DBHOST,
  user: env.DBUSER,
  port: env.DBPORT,
  password: env.DBPASS,
  database: env.DBNAME,
});

await client.connect();

export const connectAndQuery = () => {
  client.query(`SELECT NOW()`, (err, res) => {
    if (!err) {
      console.log("Connected to database");
    } else {
      console.log(err.message);
    }
  });
};
