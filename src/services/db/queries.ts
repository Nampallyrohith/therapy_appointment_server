export const QUERIES = {
  getUserByEmail: "SELECT * FROM users WHERE email = $1;",
  insertNewUser:
    "INSERT INTO users (google_user_id, name, email, access_token, provider_token, refresh_token, expires_at, avatar_url, phone, gender, dob, created_at, last_sign_in_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);",
  getUserByGoogleUserId: "SELECT * FROM users WHERE google_user_id = $1;",
  updateUser:
    "UPDATE users SET name = $2, email = $3, access_token = $4, provider_token = $5, refresh_token = $6, expires_at = $7, avatar_url = $8, phone = $9, gender = $10, dob = $11, created_at = $12, last_sign_in_at = $13 WHERE google_user_id = $1;",
  getTherapies: "select id, therapy_name from therapies;",
};
