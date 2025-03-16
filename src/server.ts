import express from "express";
import { connectAndQuery } from "./services/db/client.js";
import env from "./config.js";
import cors from "cors";
import routes from "./handlers/routes.js";
import morgan from "morgan";

const app = express();

const PORT = env.PORT;
const allowedOrigins = env.CORS_ALLOWED_ORIGIN.split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));


// Use the imported routes
app.use("/api", routes);

// Start the server after initializing tables
(async () => {
  try {
    connectAndQuery();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize tables or start the server:", error);
    process.exit(1);
  }
})();
