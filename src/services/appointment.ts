import { EventSchema } from "../schema/appointment.schema.js";
import { client } from "./db/client.js";
import { QUERIES } from "./db/queries.js";
import { NotFound } from "./errors.js";
import { getUserById } from "./user.js";

export const getAllTherapies = async () => {
  const therapies = (await client.query(QUERIES.getTherapiesQuery)).rows;
  return therapies.map((therapy) => ({
    id: therapy.id,
    therapyName: therapy.therapy_name,
  }));
};

export const getAllDoctors = async () => {
  const doctors = (await client.query(QUERIES.getAllDoctosQuery)).rows;
  return doctors.map((doctor) => ({
    id: doctor.id,
    therapyId: doctor.therapy_id,
    name: doctor.name,
    email: doctor.email,
    avatarUrl: doctor.avatar_url,
    experience: doctor.experience,
    specialistIn: doctor.specialist_in,
    about: doctor.about,
  }));
};

export const getAllDoctorsByTherapyId = async (therapyId: string) => {
  const doctors = (
    await client.query(QUERIES.getAllDoctorsByTherapyIdQuery, [therapyId])
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
  const datetime = (
    await client.query(QUERIES.getAvailableDatesQuery, [doctorId])
  ).rows[0];

  return {
    id: datetime.id,
    doctorId: datetime.doctor_id,
    leaveDates: datetime.leave_dates
      .replace(/[\[\]]/g, "")
      .split(", ")
      .map((date: string) => date.trim()),
    availableTime: datetime.available_time,
  };
};

// TODO:
export const insertEventInfo = async (
  googleUserId: string,
  event: EventSchema
) => {};

export const getAllAppointments = async (userId: string) => {
  const isUserExisting = await getUserById(userId);
  if (!isUserExisting) {
    throw new NotFound("Invalid user id");
  }

  const appointments = (
    await client.query(QUERIES.getAllAppointmentsQuery, [userId])
  ).rows;

  return appointments.map((appointment) => ({
    id: appointment.id,
    userId: appointment.user_id,
    summary: appointment.summary,
    description: appointment.description,
    startTime: appointment.start_time,
    endTime: appointment.end_time,
    timeZone: appointment.time_zone,
    hangoutLink: appointment.hangout_link,
    status: appointment.status,
    feedback: appointment.feedback,
  }));
};
