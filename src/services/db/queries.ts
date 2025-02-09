export const QUERIES = {
  getUserByEmail: "SELECT * FROM users WHERE email = $1;",
  insertNewUser:
    "INSERT INTO users (google_user_id, name, email, access_token, provider_token, refresh_token, expires_at, avatar_url, phone, gender, dob, created_at, last_sign_in_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);",
};

