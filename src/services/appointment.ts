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

export const getAvailableDates = async (doctorIdStr: string, date?: string) => {
  const doctorId = Number(doctorIdStr);
  const datetime = (
    await client.query(QUERIES.getAvailableDatesQuery, [doctorId])
  ).rows[0];

  const leaveDates = datetime.leave_dates
    .replace(/[\[\]]/g, "")
    .split(", ")
    .map((date: string) => date.trim());

  if (date) {
    return getAvailableTimes(doctorId, date, datetime);
  }

  return {
    id: datetime.id,
    doctorId: datetime.doctor_id,
    leaveDates,
  };
};

export const getAvailableTimes = async (
  doctorId: number,
  date: string,
  datetime: { id: number; doctor_id: number; available_time: string | null }
) => {
  const bookedAppointments = await client.query(
    QUERIES.getBookedAppointmentsQuery,
    [doctorId, date]
  );

  const bookedTimes: string[] = bookedAppointments.rows.map((appointment) => {
    const utcDate = new Date(appointment.start_time);
    const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);

    let hours = istDate.getHours();
    const minutes = String(istDate.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;
    return `${hours}:${minutes}${ampm}`;
  });

  console.log("Raw booked slots time (IST):", bookedTimes);

  const availableTimeSlots: string[] = datetime.available_time
    ? datetime.available_time
        .replace(/[\[\]]/g, "")
        .split(", ")
        .map((t: string) => t.trim())
    : [];

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

  console.log("Filtered time slots in array:", filteredTimeSlots);

  return {
    id: datetime.id,
    doctorId: datetime.doctor_id,
    availableTimeSlots: filteredTimeSlots,
  };
};

// TODO:
export const insertEventInfo = async (
  googleUserId: string,
  event: EventSchema
) => {
  const isUserExists = getUserById(googleUserId);
  if (!isUserExists) {
    throw new NotFound("User does exists.");
  }

  const currentDateTime = new Date();
  const result = await client.query(QUERIES.insertAppointmentEventQuery, [
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
  ]);

  const appointmentId = result.rows[0].id;
  await Promise.all(
    event.attendees.map((attendee) =>
      client.query(QUERIES.insertAppoinmentAttendeesQuery, [
        appointmentId,
        attendee.email,
      ])
    )
  );

  return true;
};

export const getAllAppointments = async (userId: string) => {
  const isUserExisting = await getUserById(userId);
  if (!isUserExisting) {
    throw new NotFound("Invalid user id");
  }

  const appointments = (
    await client.query(QUERIES.getAllAppointmentsQuery, [userId])
  ).rows;

  return appointments.map(async (appointment) => {
    const doctorName = await client.query(QUERIES.getDoctorById, [
      appointment.doctor_id,
    ]);

    return {
      id: appointment.id,
      userId: appointment.user_id,
      doctorId: appointment.doctor_id,
      eventId: appointment.event_id,
      summary: appointment.summary,
      description: appointment.description,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      timeZone: appointment.time_zone,
      hangoutLink: appointment.hangout_link,
      status: appointment.status,
      createdAt: appointment.created_at,
      typeOfTherapy: appointment.therapy_type,
      doctorName,
      cancelledOn: appointment.cancelled_on,
      attended: appointment.attended,
    };
  });
};
