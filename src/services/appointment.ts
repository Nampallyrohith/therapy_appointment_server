import { date } from "zod";
import { client } from "./db/client.js";
import { QUERIES } from "./db/queries.js";

export const getAllTherapies = async () => {
  const therapies = (await client.query(QUERIES.getTherapiesQuery)).rows;
  return therapies.map((therapy) => ({
    id: therapy.id,
    therapyName: therapy.therapy_name,
  }));
};

export const getAllDoctorsByTherapyId = async (therapyId: string) => {
  const doctors = (
    await client.query(QUERIES.getAllDoctorsByTherapyIdQuery, [therapyId])
  ).rows;
  console.log(doctors);
  return doctors.map((doctor) => ({
    id: doctor.id,
    therapyId: doctor.therapy_id,
    name: doctor.name,
    email: doctor.email,
    avatarUrl: doctor.avatar_url,
    experience: doctor.experience,
    specialistIn: doctor.specialist_in,
    leaveDates: doctor.leave_dates
      .replace(/[\[\]]/g, "")
      .split(", ")
      .map((date: string) => date.trim()),
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
