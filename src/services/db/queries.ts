export const QUERIES = {
  getUserByEmailQuery: `
    SELECT * FROM users WHERE email = $1;
  `,

  getDoctorByEmailQuery: `
    SELECT id, therapy_id, name, password, email, avatar_url, experience, 
           specialist_in, about, is_profile 
    FROM doctors WHERE email = $1;
  `,

  insertNewUserQuery: `
    INSERT INTO users (
      google_user_id, name, email, access_token, provider_token, 
      refresh_token, expires_at, avatar_url, phone, gender, dob, 
      created_at, last_sign_in_at
    ) 
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
    );
  `,

  getUserByGoogleUserIdQuery: `
    SELECT * FROM users WHERE google_user_id = $1;
  `,

  updateUserQuery: `
    UPDATE users 
    SET name = $2, email = $3, access_token = $4, provider_token = $5, 
        refresh_token = $6, expires_at = $7, avatar_url = $8, phone = $9, 
        gender = $10, dob = $11, created_at = $12, last_sign_in_at = $13 
    WHERE google_user_id = $1;
  `,

  getTherapiesQuery: `
    SELECT id, therapy_name FROM therapies;
  `,

  getAllDoctorsByTherapyIdQuery: `
    SELECT id, therapy_id, name, avatar_url, email 
    FROM doctors WHERE therapy_id = $1;
  `,

  getAvailableDatesQuery: `
    SELECT * FROM doctors_leave_date WHERE doctor_id = $1 AND status=upcoming;
  `,

  getAvailableTimesQuery: `
  SELECT * FROM doctors_default_available_time WHERE doctor_id=$1;`,

  getAllDoctorsQuery: `
    SELECT id, therapy_id, name, email, avatar_url, experience, 
           specialist_in, about, is_profile 
    FROM doctors;
  `,

  insertAppointmentEventQuery: `
    INSERT INTO appointments (
      user_id, summary, description, start_time, end_time, time_zone, 
      hangout_link, created_at, doctor_id, event_id, therapy_type
    ) 
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
    ) RETURNING id;
  `,

  insertAppointmentAttendeesQuery: `
    INSERT INTO appointments_attendees (appointment_id, email) 
    VALUES ($1, $2);
  `,

  getBookedAppointmentsQuery: `
    SELECT start_time 
    FROM appointments 
    WHERE doctor_id = $1 AND DATE(start_time) = $2;
  `,

  getAllAppointmentsQuery: `
    SELECT a.*, ca.cancel_reason, ca.cancelled_on 
    FROM appointments a 
    LEFT JOIN cancelled_appointments ca 
    ON a.id = ca.appointment_id 
    WHERE a.user_id = $1;
  `,

  getDoctorByIdQuery: `
    SELECT id, therapy_id, name, email, avatar_url, experience, 
           specialist_in, about, is_profile, age, gender, qualification
    FROM doctors WHERE id = $1;
  `,

  insertCancelAppointmentQuery: `
    INSERT INTO cancelled_appointments (appointment_id, cancel_reason, cancelled_on) 
    VALUES ($1, $2, $3);
  `,

  updateCancelStatusQuery: `
    UPDATE appointments 
    SET status = 'cancelled' 
    WHERE id = $1;
  `,

  updatePreviousStatusQuery: `
    UPDATE appointments
    SET status = 'previous'
    WHERE status='upcoming' AND start_time < NOW();
  `,

  addNewDoctorQuery: `
    INSERT INTO doctors (name, email, password) 
    VALUES ($1, $2, $3);
  `,

  doctorExistsQuery: `
    SELECT EXISTS (SELECT 1 FROM doctors WHERE id = $1);
  `,

  updateDoctorProfileQuery: `
    UPDATE doctors 
    SET name = $2, 
        avatar_url = $3, 
        therapy_id = $4, 
        experience = $5, 
        specialist_in = $6, 
        about = $7, 
        gender=$8, 
        age=$9, 
        qualification=$10,
        is_profile=true
    WHERE id = $1;
  `,

  insertingLeaveDateQuery: `
    INSERT INTO doctors_leave_date (title, description, leave_dates, doctor_id)
    VALUES($1, $2, $3, $4);
  `,

  getAllLeaveDatesByIdQuery: `
    SELECT * FROM doctors_leave_date WHERE doctor_id=$1;
  `,

  cancelLeaveDatesQuery: `
    UPDATE doctors_leave_date
    SET status='cancelled'
    WHERE 
      doctor_id = $1 and id=$2;
  `,
};
