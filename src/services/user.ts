import pool from "./db/client.js";
import { QUERIES } from "./db/queries.js";
import { UserType } from "../schema/user.js";
import { NotFound } from "./errors.js";

export const getUserByEmail = async (email: string) => {
  const response = await (
    await pool.query(QUERIES.getUserByEmailQuery, [email])
  ).rows[0];
  return response;
};

export const getUserById = async (googleUserId: string) => {
  const response = await (
    await pool.query(QUERIES.getUserByGoogleUserIdQuery, [googleUserId])
  ).rows[0];
  return response;
};

export const insertUserDetails = async (user: UserType) => {
  const {
    googleUserId,
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
    await pool.query(QUERIES.updateUserQuery, [
      googleUserId,
      name,
      email,
      accessToken,
      providerToken,
      refreshToken,
      expiresAt ? Number(expiresAt) : null,
      avatarUrl,
      phone,
      gender,
      dob,
      createdAt,
      lastSignInAt,
    ]);
  } else {
    await pool.query(QUERIES.insertNewUserQuery, [
      googleUserId,
      name,
      email,
      accessToken,
      providerToken,
      refreshToken,
      expiresAt ? Number(expiresAt) : null,
      avatarUrl,
      phone,
      gender,
      dob,
      createdAt,
      lastSignInAt,
    ]);
    return true;
  }
};

export const getUserByGoogleId = async (googleUserId: string) => {
  const user = await getUserById(googleUserId);

  if (!user) {
    throw new NotFound("Invalid google user id");
  }
  return {
    userInfo: {
      googleUserId: user.google_user_id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar_url,
      phone: user.phone,
      gender: user.gender,
      dob: user.dob,
    },
    userMeta: {
      providerToken: user.provider_token,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at,
      expiresAt: user.expires_at,
      refreshToken: user.refresh_token,
      accessToken: user.access_token,
    },
  };
};
