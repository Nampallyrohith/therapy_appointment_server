import { Router, Request, Response } from "express";
import {
  googleAuthSchema,
  loginSchema,
  signupSchema,
  UserSchema,
} from "../schema/user.js";
import { createUser, insertUserDetails, loginUser } from "../services/user.js";
import {
  DatabaseError,
  ExchangeTokenError,
  InvalidToken,
  NotFoundError,
  PasswordNotMatch,
  UserAlreadyExistsError,
} from "../services/errors.js";

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

router.post(
  "/auth/google/signin",
  defineRoute(async (req, res) => {
    try {
      const user = UserSchema.parse(req.body);
      console.log(user);
      await insertUserDetails(user);
      res.status(200).send({ message: "User created successfully" });
    } catch (error) {}
  })
);

// router.post(
//   "/auth/google/signin",
//   defineRoute(async (req, res) => {
//     try {
//       const { credentials } = googleAuthSchema.parse(req.body);
//       console.log("credentials", credentials);
//       const userDetails = await googleAuthentication(credentials);
//       res.json({ message: "Authentication successful", user: userDetails });
//     } catch (error) {
//       if (error instanceof InvalidToken) {
//         res.status(400).send({
//           message: "Invalid credential token while verifying with google.",
//         });
//       }
//       if (error instanceof ExchangeTokenError) {
//         res.status(400).send({ message: "Failed to exchange token" });
//       }
//       console.error("error:---",error);
//       res.status(500).send({ message: error });
//     }
//   })
// );

export default router;
