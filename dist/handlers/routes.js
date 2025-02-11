import { Router } from "express";
import { UserSchema } from "../schema/user.js";
import { getUserByGoogleId, insertUserDetails } from "../services/user.js";
import { NotFound } from "../services/errors.js";
export const defineRoute = (handler) => handler;
const router = Router();
// Define routes
router.get("/health", defineRoute((req, res) => {
    res.json({ status: "OK" });
}));
router.post("/auth/google/signin", defineRoute(async (req, res) => {
    try {
        const user = UserSchema.parse(req.body);
        await insertUserDetails(user);
        return res.status(200).json({ message: "User created successfully" });
    }
    catch (error) {
        console.log("error:", error);
        return res.status(500).json({ error: error });
    }
}));
router.get("/user/profile-info/:googleUserId", defineRoute(async (req, res) => {
    try {
        const { googleUserId } = req.params;
        const user = await getUserByGoogleId(googleUserId);
        return res.status(200).send({
            message: "User Successfully retrived.",
            userDetails: user.userInfo,
            userMeta: user.userMeta,
        });
    }
    catch (error) {
        if (error instanceof NotFound) {
            return res.status(400).json("User doesn't exists.");
        }
        console.log("error:", error);
        return res.status(500).json({ error: error });
    }
}));
export default router;
