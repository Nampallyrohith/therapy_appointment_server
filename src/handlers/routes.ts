import { Router, Request, Response } from "express";
import { loginSchema, signupSchema } from "../schema/user.js";
import { createUser, loginUser } from "../service/user.js";
import {
  DatabaseError,
  NotFoundError,
  PasswordNotMatch,
  UserAlreadyExistsError,
} from "../service/errors.js";

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
  "/signup",
  defineRoute(async (req, res) => {
    try {
      const { fullName, email, password } = signupSchema.parse(req.body);
      await createUser(fullName, email, password);
      res.status(201).send({ message: "User created successfully" });
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        res.status(400).send({ message: "User already exists" });
      } else if (error instanceof DatabaseError) {
        res.status(500).send({ message: "Database error" });
      }
      res.status(500).send({ message: "Internal Server Error" });
    }
  })
);

router.post(
  "/login",
  defineRoute(async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const response = await loginUser(email, password);
      res.status(200).send({
        message: "Logged in successfully",
        token: response.token,
        user: response.user,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).send({ message: "User doesn't exist" });
      }
      if (error instanceof PasswordNotMatch) {
        res.status(400).send({ message: "Invalid Credentials" });
      }
      res.status(500).send({ message: "Internal Server Error" });
    }
  })
);

export default router;
