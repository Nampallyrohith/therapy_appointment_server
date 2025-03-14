import { client } from "./db/client.js";
import { QUERIES } from "./db/queries.js";
import bcrypt from "bcrypt";
import env from "../config.js";
import jwt from "jsonwebtoken";
import {
  AutoIncrementFailure,
  DatabaseError,
  DoctorAlreadyExistsError,
  DoctorCreationError,
  NotFound,
  PasswordNotMatch,
  UniqueConstraintViolationError,
} from "./errors.js";
import { DoctorSchema, LeaveDatesSchema } from "../schema/doctor.schema.js";
import cron from "node-cron";

export const getDoctorByEmail = async (email: string) => {
  const response = await (
    await client.query(QUERIES.getDoctorByEmailQuery, [email])
  ).rows[0];
  return response;
};

// All doctors
export const getAllDoctors = async () => {
  const doctors = (await client.query(QUERIES.getAllDoctorsQuery)).rows;
  return doctors
    .filter((doctor) => doctor.is_profile)
    .map((doctor) => ({
      id: doctor.id,
      therapyId: doctor.therapy_id,
      name: doctor.name,
      email: doctor.email,
      avatarUrl: doctor.avatar_url,
      experience: doctor.experience,
      specialistIn: doctor.specialist_in,
      about: doctor.about,
      isProfile: doctor.is_profile,
    }));
};

// Sign up
export const addNewDoctor = async (
  fullName: string,
  email: string,
  password: string
) => {
  const doctorExists = await getDoctorByEmail(email);
  if (doctorExists) {
    throw new DoctorAlreadyExistsError("Doctor already exists");
  }
  const hashedNewPassword = await bcrypt.hash(password, 10);
  try {
    await client.query(QUERIES.addNewDoctorQuery, [
      fullName,
      email,
      hashedNewPassword,
    ]);
  } catch (e) {
    if (e instanceof DatabaseError) {
      if (e.code === "23502") {
        throw new AutoIncrementFailure(
          "null value in column id of relation doctors violates not-null constraint"
        );
      }
      if (e.code === "23505" && e.constraint === "doctors_pkey") {
        throw new UniqueConstraintViolationError(
          "A doctor with this ID already exists. Please try again."
        );
      }
    }
    console.log(e);
    throw new DoctorCreationError("Error creating new doctor");
  }
};

// Login
export const loginDoctor = async (email: string, password: string) => {
  const doctor = await getDoctorByEmail(email);
  if (!doctor) {
    console.log("Doctor doesn't exist.");
    throw new NotFound("Doctor doesn't exist. Please create an account.");
  }
  const response = await bcrypt.compare(password, doctor.password);
  if (!response) {
    throw new PasswordNotMatch("Password doesn't match");
  }
  const token = jwt.sign(
    { id: doctor.id, email: doctor.email },
    env.SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );
  return {
    token,
    doctor: { id: doctor.id, email: doctor.email, fullName: doctor.full_name },
  };
};

// Doctor by Id
export const getDoctorById = async (doctorId: number) => {
  const doctorExists = await client.query(QUERIES.doctorExistsQuery, [
    doctorId,
  ]);
  if (!doctorExists) {
    throw new NotFound("Doctor doesn't exists");
  }

  const result = (await client.query(QUERIES.getDoctorByIdQuery, [doctorId]))
    .rows[0];
  return {
    id: result.id,
    therapyId: result.therapy_id,
    name: result.name,
    email: result.email,
    avatarUrl: result.avatar_url,
    experience: result.experience,
    specialistIn: result.specialist_in,
    about: result.about,
    isProfile: result.is_profile,
    age: result.age,
    qualification: result.qualification,
    gender: result.gender,
  };
};

export const updateDoctorProfile = async (
  doctor: DoctorSchema,
  doctorId: number
) => {
  const doctorExists = await client.query(QUERIES.doctorExistsQuery, [
    doctorId,
  ]);
  if (!doctorExists) {
    throw new NotFound("Doctor doesn't exists");
  }

  try {
    await client.query(QUERIES.updateDoctorProfileQuery, [
      doctorId,
      doctor.name,
      doctor.avatarUrl,
      doctor.therapyId,
      doctor.experience,
      doctor.specialistIn,
      doctor.about,
      doctor.gender,
      doctor.age,
      doctor.qualification,
    ]);
  } catch (error) {
    throw error;
  }
};

export const insertingLeaveDates = async (
  doctorId: number,
  calendarForm: LeaveDatesSchema
) => {
  const doctorExists = await client.query(QUERIES.doctorExistsQuery, [
    doctorId,
  ]);
  if (!doctorExists) {
    throw new NotFound("Doctor doesn't exists");
  }

  try {
    await client.query(QUERIES.insertingLeaveDateQuery, [
      calendarForm.title,
      calendarForm.description,
      calendarForm.dates,
      doctorId,
    ]);
  } catch (error) {
    if (error instanceof DatabaseError) {
      if (error.code === "23502") {
        throw new AutoIncrementFailure(
          "null value in column id of relation doctors violates not-null constraint"
        );
      }
    }
    console.log(error);
  }
};

export const getAllLeaveDatesById = async (doctorId: number) => {
  const doctorExists = await client.query(QUERIES.doctorExistsQuery, [
    doctorId,
  ]);
  if (!doctorExists) {
    throw new NotFound("Doctor doesn't exists");
  }

  const response = (
    await client.query(QUERIES.getAllLeaveDatesByIdQuery, [doctorId])
  ).rows;
  return response.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    dates: item.leave_dates,
    createdAt: item.created_at,
    status: item.status,
    doctorId: item.doctor_id,
  }));
};

export const cancelLeaveDates = async (doctorId: number, id: number) => {
  const doctorExists = await client.query(QUERIES.doctorExistsQuery, [
    doctorId,
  ]);
  if (!doctorExists) {
    throw new NotFound("Doctor doesn't exists");
  }

  try {
    await client.query(QUERIES.cancelLeaveDatesQuery, [doctorId, id]);
  } catch (error) {
    console.log(error);
  }
};

// Automatically upating status from upcoming to status
cron.schedule("*/10 * * * *", async () => {
  try {
    await client.query(QUERIES.updatePreviousStatusQuery);
    console.log("Leave dates updated successfully.");
  } catch (error) {
    console.log("Error updating leave dates status:", error);
  }
});
