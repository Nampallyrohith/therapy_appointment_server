import { EventSchema } from "../schema/appointment.schema.js";
import { doctorType } from "../schema/doctor.schema.js";
import pool from "./db/client.js";
import { QUERIES } from "./db/queries.js";
import { NotFound } from "./errors.js";
import { getUserById } from "./user.js";
import cron from "node-cron";

export const getAllTherapies = async () => {
  const therapies = (await pool.query(QUERIES.getTherapiesQuery)).rows;
  return therapies.map((therapy) => ({
    id: therapy.id,
    therapyName: therapy.therapy_name,
  }));
};

export const getAllDoctorsByTherapyId = async (therapyId: string) => {
  const doctors = (
    await pool.query(QUERIES.getAllDoctorsByTherapyIdQuery, [therapyId])
  ).rows;
  return doctors.map((doctor) => ({
    id: doctor.id,
    therapyId: doctor.therapy_id,
    name: doctor.name,
    email: doctor.email,
    avatarUrl: doctor.avatar_url,
    // experience: doctor.experience,
    // specialistIn: doctor.specialist_in,
  }));
};

export const getAvailableDates = async (doctorIdStr: string) => {
  const doctorId = Number(doctorIdStr);
  const date = (await pool.query(QUERIES.getAvailableDatesQuery, [doctorId]))
    .rows[0];

  if (!date || !date.leave_dates) {
    console.error("date.leave_dates is missing");
    return [];
  }

  const leaveDates = date.leave_dates
    .replace(/[\[\]]/g, "")
    .split(", ")
    .map((date: string) => date.trim());

  return {
    id: date.id,
    doctorId: date.doctor_id,
    leaveDates,
  };
};

const convertUTCToIST = (date: string) => {
  const utcDate = new Date(date);
  const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);

  let hours = istDate.getHours();
  const minutes = String(istDate.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;
  return `${hours}:${minutes}${ampm}`;
};

export const getAvailableTimes = async (doctorId: number, date: string) => {
  const time = (await pool.query(QUERIES.getAvailableTimesQuery, [doctorId]))
    .rows[0];

  const bookedAppointments = await pool.query(
    QUERIES.getBookedAppointmentsQuery,
    [doctorId, date]
  );

  const bookedTimes: string[] = bookedAppointments.rows
    .map((appointment) =>
      appointment.start_time ? convertUTCToIST(appointment.start_time) : null
    )
    .filter((time) => time !== null) as string[];

  const availableTimeSlots: string[] = time.available_time
    ? time.available_time
        .replace(/[\[\]]/g, "")
        .split(", ")
        .map((t: string) => t.trim())
    : ["10:00AM", "11:30AM", "2:30PM", "4:00PM"];

  const now = new Date();
  const todayDate = now.toISOString().split("T")[0];
  const isToday = date === todayDate;

  const filteredTimeSlots: string[] = availableTimeSlots.filter((time) => {
    if (bookedTimes.includes(time)) return false;

    if (isToday) {
      const match = time.match(/(\d+):(\d+)(AM|PM)/);
      if (!match) return false;

      let [_, hoursStr, minutesStr, ampm] = match;
      let hours = parseInt(hoursStr, 10);
      let minutes = parseInt(minutesStr, 10);

      let slotTime = new Date();
      slotTime.setHours(ampm === "PM" && hours !== 12 ? hours + 12 : hours);
      slotTime.setMinutes(minutes);
      slotTime.setSeconds(0);
      slotTime.setMilliseconds(0);

      return slotTime > now;
    }
    return true;
  });

  return {
    id: time.id,
    doctorId: time.doctor_id,
    availableTimeSlots: filteredTimeSlots,
  };
};

export const insertEventInfo = async (
  googleUserId: string,
  event: EventSchema
) => {
  const isUserExists = getUserById(googleUserId);
  if (!isUserExists) {
    throw new NotFound("User does exists.");
  }

  const currentDateTime = new Date();
  const result = await pool.query(QUERIES.insertAppointmentEventQuery, [
    googleUserId,
    event.summary,
    event.description,
    event.start.dateTime,
    event.end.dateTime,
    event.start.timeZone,
    event.hangoutLink,
    currentDateTime,
    event.doctorId,
    event.eventId,
    event.therapyType,
  ]);

  const appointmentId = result.rows[0].id;
  await Promise.all(
    event.attendees.map((attendee) =>
      pool.query(QUERIES.insertAppointmentAttendeesQuery, [
        appointmentId,
        attendee.email,
      ])
    )
  );

  const appointmentEndTime = new Date(result.rows[0].end_time);
  const now = new Date();
  // FIXME: It's updating the status at start_time instead of end_time for some reason,
  // So I manually added 1 hour in delay to get it right :(
  const delay = appointmentEndTime.getTime() + 60 * 60 * 1000 - now.getTime();

  if (delay > 0) {
    setTimeout(
      async () =>
        await pool.query(QUERIES.updateAppointmentPreviousStatusQuery),
      delay
    );
  } else {
    await pool.query(QUERIES.updateAppointmentPreviousStatusQuery);
  }
  return true;
};

export const getAllAppointments = async (userId: string) => {
  const isUserExisting = await getUserById(userId);
  if (!isUserExisting) {
    throw new NotFound("Invalid user id");
  }

  const appointments = (
    await pool.query(QUERIES.getAllAppointmentsQuery, [userId])
  ).rows;

  return Promise.all(
    appointments.map(async (appointment) => {
      const doctorResult = await pool.query(QUERIES.getDoctorByIdQuery, [
        appointment.doctor_id,
      ]);
      const doctor: doctorType = doctorResult.rows[0];

      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB");
      };

      return {
        id: appointment.id,
        userId: appointment.user_id,
        doctorId: appointment.doctor_id,
        eventId: appointment.event_id,
        summary: appointment.summary,
        description: appointment.description,
        startTime: `${formatDate(appointment.start_time)} ${convertUTCToIST(
          appointment.start_time
        )}`,
        endTime: `${formatDate(appointment.end_time)} ${convertUTCToIST(
          appointment.end_time
        )}`,
        timeZone: appointment.time_zone,
        hangoutLink: appointment.hangout_link,
        status: appointment.status,
        createdAt: `${formatDate(appointment.created_at)} ${convertUTCToIST(
          appointment.created_at
        )}`,
        typeOfTherapy: appointment.therapy_type,
        doctorName: doctor?.name,
        cancelledOn:
          appointment.cancelled_on !== null &&
          new Date(appointment.cancelled_on).toLocaleString(),
        cancelReason:
          appointment.cancel_reason !== null && appointment.cancel_reason,
        attended: appointment.attended,
        attendedModalDismissed: appointment.attended_modal_dismissed,
        absentReason: appointment.absent_reason,
        doctorRating: appointment.doctor_rating,
      };
    })
  );
};

export const cancelAppointment = async (
  appointmentId: number,
  cancelReason: string
) => {
  const cancelledOn = new Date();

  await pool.query(QUERIES.insertCancelAppointmentQuery, [
    appointmentId,
    cancelReason,
    cancelledOn,
  ]);

  await pool.query(QUERIES.updateCancelStatusQuery, [appointmentId]);
};

export const CancelAppointmentFromUpcoming = async (eventId: string) => {
  await pool.query(QUERIES.CancelAppointmentFromUpcomingQuery, [eventId]);
};

// Automatically upating status from upcoming to status
// cron.schedule("*/10 * * * *", async () => {
//   try {
//     await pool.query(QUERIES.updateAppointmentPreviousStatusQuery);
//     console.log("Appointments updated successfully.");
//   } catch (error) {
//     console.log("Error updating appointment status:", error);
//   }
// });

export const updateAttendedModalFlag = async (appointmentId: number) => {
  await pool.query(QUERIES.updateAttendedFlagQuery, [appointmentId]);
};

export const insertAppointmentFeedback = async (
  appointmentId: number,
  doctorRating: number,
  doctorFeedback: string,
  meetFeedback: string
) => {
  await pool.query(QUERIES.insertAppointmentFeedbackQuery, [
    appointmentId,
    doctorRating,
    doctorFeedback,
    meetFeedback,
  ]);

  await pool.query(QUERIES.updateAppointmentAttendedQuery, [appointmentId]);
};

export const updateAbsentReason = async (
  appointmentId: number,
  absentReason: string
) => {
  await pool.query(QUERIES.updateAbsentReasonQuery, [
    appointmentId,
    absentReason,
  ]);
};
