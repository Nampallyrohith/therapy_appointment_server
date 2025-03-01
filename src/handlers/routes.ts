import { Router, Request, Response } from "express";
import { UserSchema } from "../schema/user.js";
import { getUserByGoogleId, insertUserDetails } from "../services/user.js";
import { NotFound } from "../services/errors.js";
import {
  getAllDoctors,
  getAllDoctorsByTherapyId,
  getAllTherapies,
  getAvailableDates,
  insertEventInfo,
  getAllAppointments,
} from "../services/appointment.js";
import { eventSchema } from "../schema/appointment.schema.js";

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
  "/user/appointment",
  router.get(
    "/therapies",
    defineRoute(async (req, res) => {
      const response = await getAllTherapies();
      res.status(200).send({
        message: "Successfully therapies retrived.",
        therapies: response,
      });
    })
  ),

  router.get(
    "/doctors",
    defineRoute(async (req, res) => {
      const response = await getAllDoctors();
      res.status(200).send({
        message: "Successfully doctors retrived.",
        doctors: response,
      });
    })
  ),

  router.get(
    "/:therapyId/doctors",
    defineRoute(async (req, res) => {
      const { therapyId } = req.params;
      const response = await getAllDoctorsByTherapyId(therapyId);
      res.status(200).send({
        message: "Successfully doctor's retrived.",
        doctors: response,
      });
    })
  ),

  router.get(
    "/:doctorId/available_date",
    defineRoute(async (req, res) => {
      const { doctorId } = req.params;

      const response = await getAvailableDates(doctorId);
      res.status(200).send({
        message: "Successfully retrieved doctor's date and time",
        date: response,
      });
    })
  ),

  router.get(
    "/:doctorId/available_time",
    defineRoute(async (req, res) => {
      const { doctorId } = req.params;
      const date = Array.isArray(req.query.date)
        ? req.query.date[0]
        : req.query.date;

      console.log(date);
      if (!date || typeof date !== "string") {
        return res
          .status(400)
          .send({ message: "Invalid or missing date parameter." });
      }

      const response = await getAvailableDates(doctorId, date);
      res.status(200).send({
        message: "Successfully retrieved doctor's time",
        time: response,
      });
    })
  ),
  router.post(
    "/create-event/:googleUserId",
    defineRoute(async (req, res) => {
      try {
        const { googleUserId } = req.params;
        const event = eventSchema.parse(req.body);
        await insertEventInfo(googleUserId, event);
        res
          .status(201)
          .send({ ok: true, message: "Event inserted successfully" });
      } catch (error) {
        if (error instanceof NotFound) {
          return res.status(400).json({ error: "User doesn't exists." });
        }
        console.log("error:", error);
        return res.status(500).json({ error: error });
      }
    })
  )
);

router.get(
  "/user/my-appointments/:userId",
  defineRoute(async (req, res) => {
    try {
      const { userId } = req.params;
      const response = await getAllAppointments(userId);
      console.log(response);

      res.status(200).send({
        message: "Successfully retrieved appointments",
        appointments: response,
      });
    } catch (err) {
      if (err instanceof NotFound) {
        res.status(400).send({
          error: "User doesn't exist",
        });
      }
      res.status(500).send({
        error: err,
      });
    }
  })
);

export default router;
