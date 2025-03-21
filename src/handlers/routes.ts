import { Router, Request, Response } from "express";
import { UserSchema } from "../schema/user.js";
import { getUserByGoogleId, insertUserDetails } from "../services/user.js";
import {
  AutoIncrementFailure,
  DoctorCreationError,
  NotFound,
  PasswordNotMatch,
  UniqueConstraintViolationError,
} from "../services/errors.js";
import {
  getAllDoctorsByTherapyId,
  getAllTherapies,
  getAvailableDates,
  insertEventInfo,
  getAllAppointments,
  cancelAppointment,
  getAvailableTimes,
  updateAttendedModalFlag,
  insertAppointmentFeedback,
  updateAbsentReason,
} from "../services/appointment.js";
import { eventSchema } from "../schema/appointment.schema.js";
import {
  addNewDoctor,
  cancelLeaveDates,
  getAllDoctors,
  getAllLeaveDatesById,
  getDoctorById,
  insertingLeaveDates,
  loginDoctor,
  updateDoctorProfile,
} from "../services/doctors.js";
import {
  doctorAuthenticationSchema,
  doctorSchema,
  doctorSignupSchema,
  leaveDatesSchema,
} from "../schema/doctor.schema.js";

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
      return res.status(500).json({ error: error });
    }
  })
);

router.use(
  "/user",
  router.get(
    "/profile-info/:googleUserId",
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
        return res.status(500).json({ error: error });
      }
    })
  ),

  router.use(
    "/appointment",
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

        if (!date || typeof date !== "string") {
          return res
            .status(400)
            .send({ message: "Invalid or missing date parameter." });
        }

        const response = await getAvailableTimes(Number(doctorId), date);
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
          return res.status(500).json({ error: error });
        }
      })
    ),

    router.post(
      "/cancel/:appointmentId",
      defineRoute(async (req, res) => {
        try {
          const { appointmentId } = req.params;
          const { cancelReason } = req.body;

          await cancelAppointment(parseInt(appointmentId), cancelReason);

          res.status(200).json({
            message: "Appointment cancelled successfully",
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: "Failed to cancel appointment" });
        }
      })
    ),

    router.post(
      "/:appointmentId/update-attended-modal-flag",
      defineRoute(async (req, res) => {
        try {
          const { appointmentId } = req.params;

          await updateAttendedModalFlag(parseInt(appointmentId));

          res.status(200).json({
            message: "Attended modal has be dismissed successfully",
          });
        } catch (error) {
          console.log(error);
          res
            .status(500)
            .json({ error: "Failed to update attended modal flag" });
        }
      })
    ),

    router.post(
      "/:appointmentId/submit-feedback",
      defineRoute(async (req, res) => {
        try {
          const { appointmentId } = req.params;
          const { doctorRating, doctorFeedback, meetFeedback } = req.body;

          await insertAppointmentFeedback(
            parseInt(appointmentId),
            doctorRating,
            doctorFeedback,
            meetFeedback
          );

          res.status(200).json({
            message: "Appointment feedback updated successfully",
          });
        } catch (error) {
          console.log(error);
          res
            .status(500)
            .json({ error: "Failed to post appointment feedback" });
        }
      })
    ),

    router.post(
      "/:appointmentId/submit-absent-reason",
      defineRoute(async (req, res) => {
        try {
          const { appointmentId } = req.params;
          const { absentReason } = req.body;

          await updateAbsentReason(parseInt(appointmentId), absentReason);

          res.status(200).json({
            message: "Absent reason updated successfully",
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({ error: "Failed to post absent reason" });
        }
      })
    )
  ),

  router.get(
    "/my-appointments/:googleUserId",
    defineRoute(async (req, res) => {
      try {
        const { googleUserId } = req.params;
        const response = await getAllAppointments(googleUserId);

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
  )
);

router.use(
  "/doctor-authentication",
  router.post(
    "/login",
    defineRoute(async (req, res) => {
      const doctorLogin = doctorAuthenticationSchema.parse(req.body);
      try {
        const response = await loginDoctor(
          doctorLogin.email,
          doctorLogin.password
        );
        res.status(200).send({
          message: "Login successful",
          token: response.token,
          doctor: response.doctor,
        });
      } catch (error) {
        if (error instanceof PasswordNotMatch) {
          res.status(400).send({
            error: "Invalid credentials.",
          });
        }
        if (error instanceof NotFound) {
          res.status(400).send({
            error: "Account doesn't exists.",
          });
        }
        console.log(error);
      }
    })
  ),

  router.post(
    "/signup",
    defineRoute(async (req, res) => {
      const doctorSignup = doctorSignupSchema.parse(req.body);
      try {
        await addNewDoctor(
          doctorSignup.fullName,
          doctorSignup.email,
          doctorSignup.password
        );
        res.status(200).send({
          message: "Doctor registered successfully.",
        });
      } catch (error) {
        if (error instanceof AutoIncrementFailure) {
          res.status(400).send({
            error: error.message,
          });
        }
        if (error instanceof UniqueConstraintViolationError) {
          res.status(400).send({
            error: error.message,
          });
        }
        if (error instanceof DoctorCreationError) {
          res.status(500).send({
            error: "Something went wrong.",
          });
        }
      }
    })
  )
);

router.get(
  "/doctors",
  defineRoute(async (req, res) => {
    const response = await getAllDoctors();
    res.status(200).send({
      message: "Successfully doctors retrived.",
      doctors: response,
    });
  })
);

router.get(
  "/doctor/:doctorId",
  defineRoute(async (req, res) => {
    const { doctorId } = req.params;
    const response = await getDoctorById(Number(doctorId));
    res.status(200).send({
      message: "Doctor successfully retrieved based on doctorId",
      doctor: response,
    });
  })
);

router.put(
  "/doctor/profile-details/:doctorId",
  defineRoute(async (req, res) => {
    const { doctorId } = req.params;
    const doctor = req.body;
    try {
      await updateDoctorProfile(doctor, Number(doctorId));
      res.status(200).send({ message: "Successfully updated." });
    } catch (error) {
      if (error instanceof NotFound) {
        res.status(400).send({ error: error.message });
      }
      res.status(500).send({ error: error });
    }
  })
);

router.post(
  "/doctor/:doctorId/leaves-dates",
  defineRoute(async (req, res) => {
    const { doctorId } = req.params;
    const calendarForm = leaveDatesSchema.parse(req.body);

    try {
      await insertingLeaveDates(Number(doctorId), calendarForm);
      res.status(200).send({ message: "Inserted successfully ." });
    } catch (e) {
      if (e instanceof NotFound) {
        res.status(400).send({ error: e.message });
      }
      res.status(500).send({ error: e });
    }
  })
);

router.get(
  "/doctor/:doctorId/leaves-dates",
  defineRoute(async (req, res) => {
    const { doctorId } = req.params;

    try {
      const response = await getAllLeaveDatesById(Number(doctorId));
      res
        .status(200)
        .send({ message: "Successfully fetched.", leaveDetails: response });
    } catch (e) {
      if (e instanceof NotFound) {
        res.status(400).send({ error: e.message });
      }
      res.status(500).send({ error: e });
    }
  })
);

router.put(
  "/doctor/:doctorId/cancel-leave-dates/:id",
  defineRoute(async (req, res) => {
    const { doctorId, id } = req.params;
    try {
      await cancelLeaveDates(Number(doctorId), Number(id));
      res.status(200).send({ message: "Cancelled successfully." });
    } catch (e) {
      res.status(500).send({ error: e });
    }
  })
);

export default router;
