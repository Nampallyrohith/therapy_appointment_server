import { client } from "./db/client.js";
import { QUERIES } from "./db/queries.js";
import bcrypt from "bcrypt";
import env from "../config.js";
import jwt from "jsonwebtoken";
import {
  DoctorAlreadyExistsError,
  DoctorCreationError,
  NotFound,
  PasswordNotMatch,
} from "./errors.js";
import { DoctorSchema } from "../schema/doctor.schema.js";

export const getDoctorByEmail = async (email: string) => {
  const response = await (
    await client.query(QUERIES.getDoctorByEmailQuery, [email])
  ).rows[0];
  console.log(response);
  return response;
};

// All doctors
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
  } catch (error) {
    throw new DoctorCreationError("Error creating new doctor");
  }
};

// Login
export const loginDoctor = async (email: string, password: string) => {
  const doctor = await getDoctorByEmail(email);
  if (!doctor) {
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
    ]);
  } catch (error) {
    throw error;
  }
};
