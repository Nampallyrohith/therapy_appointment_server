import { client } from "./db/client.js";
import bcrypt from "bcrypt";
import { QUERIES } from "./db/queries.js";
import { DatabaseError, UserAlreadyExistsError } from "./errors.js";
export const getUserByEmail = async (email) => {
    const response = await client.query(QUERIES.getUserByEmail, [email]);
    return response.rows[0];
};
export const createUser = async (fullName, email, password) => {
    const userExists = await getUserByEmail(email);
    if (userExists) {
        throw new UserAlreadyExistsError("User already exists");
    }
    const hashedNewPassword = await bcrypt.hash(password, 10);
    try {
        await client.query("INSERT INTO users(full_name, email, password) VALUES ($1, $2, $3)", [fullName, email, hashedNewPassword]);
    }
    catch (error) {
        throw new DatabaseError("Error creating user");
    }
};
