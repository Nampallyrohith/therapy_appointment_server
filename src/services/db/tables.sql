-- ENUM
create type status_enum as enum('upcoming', 'cancelled', 'previous'); 
create type gender_enum as enum("Male", "Female");  


-- Tables

CREATE TABLE IF NOT EXISTS users (
    id SERIAL,
    google_user_id VARCHAR(50) PRIMARY KEY UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    access_token TEXT UNIQUE,
    provider_token TEXT UNIQUE,
    refresh_token TEXT UNIQUE,
    expires_at INTEGER,
    avatar_url TEXT NOT NULL,
    phone VARCHAR(15) UNIQUE,
    gender VARCHAR(20),
    dob VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sign_in_at TIMESTAMP,


    CONSTRAINT phone_format_check CHECK (phone ~ '^[0-9]{10}$'),
    CONSTRAINT gender_options_check CHECK (gender IN ('Male', 'Female', 'Other')),
    CONSTRAINT last_sign_in_at_format_check CHECK (last_sign_in_at IS NULL OR last_sign_in_at >= created_at)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);


CREATE TABLE IF NOT EXISTS therapies (
    id VARCHAR(100) PRIMARY KEY,
    therapy_name TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    therapy_id VARCHAR(100),
    name TEXT NOT NULL,
    email VARCHAR(100) UNIQUE not null,
    password text not null,
    avatar_url TEXT,
    experience INTEGER,
    specialist_in TEXT,
    about text,
    is_profile BOOLEAN default false
    age text, 
    qualification text, 
    gender gender_enum
);

CREATE TABLE IF NOT EXISTS doctors_default_available_time (
    id SERIAL primary key,
    doctor_id INTEGER not null references doctors(id) on delete cascade,
    available_time text
);


CREATE TABLE IF NOT EXISTS doctors_leave_date (
    id SERIAL primary key,
    doctor_id INTEGER not null references doctors(id) on delete cascade,
    title text,
    description text,
    leave_dates text,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status status_enum default 'upcoming'
);

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) not null references users(google_user_id) on delete cascade,
    doctor_id INTEGER not null references doctors(id) on delete cascade,
    event_id VARCHAR(100) not null,
    summary TEXT not null,
    description TEXT not null,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    time_zone TEXT not null,
    hangout_link TEXT not null,
    status status_enum not null default 'upcoming',
    created_at TIMESTAMP not null,
    therapy_type TEXT not null,
    attended BOOLEAN,
    attended_modal_dismissed BOOLEAN default false,
    absent_reason TEXT
);

CREATE TABLE IF NOT EXISTS cancelled_appointments(
    id SERIAL PRIMARY KEY,
    cancelled_on TIMESTAMP,
    appointment_id INTEGER NOT NULL references appointments(id) on delete cascade,
    cancel_reason TEXT
);

CREATE TABLE IF NOT EXISTS appointments_attendees(
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL references appointments(id) on delete cascade,
    email TEXT not null,
    UNIQUE (appointment_id, email)
);

CREATE TABLE IF NOT EXISTS appointment_feedback (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER not null references appointments(id) on delete cascade,
    doctor_rating INTEGER not null,
    doctor_feedback TEXT not null,
    meet_feedback TEXT not null
)