import { Router, Request, Response } from "express";
import { UserSchema } from "../schema/user.js";
import { getUserByGoogleId, insertUserDetails } from "../services/user.js";
import { NotFound } from "../services/errors.js";
import { getAllTherapies } from "../services/appointment.js";

type RouteHandler = (req: Request, res: Response) => void;
export const defineRoute = (handler: RouteHandler) => handler;

const router = Router();

// Define routes
router.get(
  "/health",
  defineRoute((req, res) => {
    res.json({ status: "OK" });
  })
);

router.post(
  "/auth/google/signin",
  defineRoute(async (req, res) => {
    try {
      const user = UserSchema.parse(req.body);
      await insertUserDetails(user);
      return res.status(200).json({ message: "User created successfully" });
    } catch (error) {
      console.log("error:", error);
      return res.status(500).json({ error: error });
    }
  })
);

router.get(
  "/user/profile-info/:googleUserId",
  defineRoute(async (req, res) => {
    try {
      const { googleUserId } = req.params;
      const user = await getUserByGoogleId(googleUserId);
      return res.status(200).send({
        message: "User Successfully retrived.",
        userDetails: user.userInfo,
        userMeta: user.userMeta,
      });
    } catch (error) {
      if (error instanceof NotFound) {
        return res.status(400).json("User doesn't exists.");
      }
      console.log("error:", error);
      return res.status(500).json({ error: error });
    }
  })
);

router.use(
  "/user",
  router.get(
    "/appointment/therapies",
    defineRoute(async (req, res) => {
      const response = await getAllTherapies();
      console.log("Response", response);
      res.status(200).send({ message: response });
    })
  )
);

export default router;
