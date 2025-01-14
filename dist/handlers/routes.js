import { Router } from "express";
import { signupSchema } from "../schema/user.js";
import { createUser } from "../service/user.js";
import { DatabaseError, UserAlreadyExistsError } from "../service/errors.js";
export const defineRoute = (handler) => handler;
const router = Router();
// Define routes
router.get("/health", defineRoute((req, res) => {
    res.json({ status: "OK" });
}));
router.post("/signup", defineRoute(async (req, res) => {
    try {
        const { fullName, email, password } = signupSchema.parse(req.body);
        await createUser(fullName, email, password);
        res.status(201).send({ message: "User created successfully" });
    }
    catch (error) {
        if (error instanceof UserAlreadyExistsError) {
            res.status(400).send({ message: "User already exists" });
        }
        else if (error instanceof DatabaseError) {
            res.status(500).send({ message: "Database error" });
        }
    }
}));
export default router;
