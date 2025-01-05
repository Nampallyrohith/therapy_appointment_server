import pkg from "pg";
const { Client } = pkg;
export const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "mysecretpassword",
    database: "postgres",
});
await client.connect();
export const connectAndQuery = () => {
    client.query(`SELECT NOW()`, (err, res) => {
        if (!err) {
            console.log("Connected to database");
        }
        else {
            console.log(err.message);
        }
    });
};
