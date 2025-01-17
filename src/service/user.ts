import { client } from "./db/client.js";
import bcrypt from "bcrypt";
import { QUERIES } from "./db/queries.js";
import {
  DatabaseError,
  NotFoundError,
  PasswordNotMatch,
  UserAlreadyExistsError,
} from "./errors.js";
import env from "../config.js";
import jwt from "jsonwebtoken";

export interface User {
  id: number;
  email: string;
  full_name: string;
  password: string;
}

export const getUserByEmail = async (email: string) => {
  const response = await (
    await client.query(QUERIES.getUserByEmail, [email])
  ).rows[0];
  console.log(response);
  return response;
};

export const createUser = async (
  fullName: string,
  email: string,
  password: string
) => {
  const userExists = await getUserByEmail(email);
  if (userExists) {
    throw new UserAlreadyExistsError("User already exists");
  }

  const hashedNewPassword = await bcrypt.hash(password, 10);
  try {
    await client.query(
      "INSERT INTO users(full_name, email, password) VALUES ($1, $2, $3)",
      [fullName, email, hashedNewPassword]
    );
  } catch (error) {
    throw new DatabaseError("Error creating user");
  }
};

export const loginUser = async (email: string, password: string) => {
  const user: User = await getUserByEmail(email);
  if (!user) {
    throw new NotFoundError("User doesn't exist. Please create an account.");
  }

  const response = await bcrypt.compare(password, user.password);
  if (!response) {
    throw new PasswordNotMatch("Password doesn't match");
  }
  const token = jwt.sign({ id: user.id, email: user.email }, env.SECRET_KEY, {
    expiresIn: "1h",
  });

  return {
    token,
    user: { id: user.id, email: user.email, fullName: user.full_name },
  };
};
