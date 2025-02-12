import dotenv from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import z from "zod";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Load environment variables from .env file, mainly for the development environment
dotenv.config({ path: path.join(__dirname, "../.env") });
const baseConfigSchema = z.object({
    NODE_ENV: z.enum(["development", "production"]),
    CORS_ALLOWED_ORIGIN: z.string(),
    PORT: z.coerce.number().int().positive(),
    DBHOST: z.string().min(1),
    DBPORT: z.coerce.number().int().positive(),
    DBUSER: z.string().min(1),
    DBPASS: z.string().min(1),
    DBNAME: z.string().min(1),
    SECRET_KEY: z.string().min(1),
});
const env = baseConfigSchema.parse(process.env);
export default env;
