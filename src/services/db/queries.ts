export const QUERIES = {
  getUserByEmailQuery: "SELECT * FROM users WHERE email = $1;",
  insertNewUserQuery:
    "INSERT INTO users (google_user_id, name, email, access_token, provider_token, refresh_token, expires_at, avatar_url, phone, gender, dob, created_at, last_sign_in_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);",
  getUserByGoogleUserIdQuery: "SELECT * FROM users WHERE google_user_id = $1;",
  updateUserQuery:
    "UPDATE users SET name = $2, email = $3, access_token = $4, provider_token = $5, refresh_token = $6, expires_at = $7, avatar_url = $8, phone = $9, gender = $10, dob = $11, created_at = $12, last_sign_in_at = $13 WHERE google_user_id = $1;",
  getTherapiesQuery: "select id, therapy_name from therapies;",
  getAllDoctorsByTherapyIdQuery:
    "select id, therapy_id, name, avatar_url, email from doctors where therapy_id = $1;",
  getAvailableDatesQuery:
    "select * from doctors_datetime where doctor_id = $1;",
  getAllDoctosQuery: "Select * from doctors;",
  insertAppointmentEventQuery:
    "Insert into appointments(user_id, summary, description, start_time, end_time, time_zone, hangout_link, created_at, doctor_id, event_id) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning id;",
  insertAppoinmentAttendeesQuery:
    "Insert into appointments_attendees(appointment_id, email) values($1, $2);",
  getBookedAppointmentsQuery:
    "select start_time from appointments where doctor_id=$1 and DATE(start_time)=$2;",
  getAllAppointmentsQuery: "select * from appointments where user_id = $1;",
};
