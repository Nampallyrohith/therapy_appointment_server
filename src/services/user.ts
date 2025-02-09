import { client } from "./db/client.js";
import bcrypt from "bcrypt";
import { QUERIES } from "./db/queries.js";
import {
  DatabaseError,
  ExchangeTokenError,
  InvalidToken,
  NotFoundError,
  PasswordNotMatch,
  UserAlreadyExistsError,
} from "./errors.js";
import env from "../config.js";
import jwt from "jsonwebtoken";
import { UserType } from "../schema/user.js";

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
  console.log("get user by email", response);
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

// export const googleAuthentication = async (authCode: string) => {
//   // Exchange auth code for tokens
//   const { tokens } = await oauth2Client.getToken(authCode);
//   oauth2Client.setCredentials(tokens);

//   console.log("Exchange tokens", tokens);

//   if (!tokens.id_token) {
//     throw new Error("ID token missing in the token response.");
//   }

//   // Verify the ID token
//   const googleUser = await verifyGoogleToken(tokens.id_token);
//   if (!googleUser) {
//     throw new InvalidToken("Invalid ID token.");
//   }

//   return { user: googleUser, tokens };
// };

export const insertUserDetails = async (user: UserType) => {
  const {
    id,
    name,
    email,
    providerToken,
    avatarUrl,
    phone,
    gender,
    dob,
    refreshToken,
    accessToken,
    expiresAt,
    createdAt,
    lastSignInAt,
  } = user;
  const userExists = await getUserByEmail(email);

  if (userExists) {
  } else {
    console.log("hello");
    const response = await client.query(QUERIES.insertNewUser, [
      id,
      name,
      email,
      accessToken,
      providerToken,
      refreshToken,
      expiresAt,
      avatarUrl,
      phone,
      gender,
      dob,
      createdAt,
      lastSignInAt,
    ]);
    console.log("Res:", response);
    console.log("rohith");
    return true;
  }
};
