-- ENUM
create type status_enum as enum('upcoming', 'cancelled', 'previous');   


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

-- TODO: Make it not null to email and avatar_url
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    therapy_id VARCHAR(100),
    name TEXT NOT NULL,
    email VARCHAR(100) UNIQUE not null,
    avatar_url TEXT,
    experience INTEGER,
    specialist_in TEXT,
    about text
    password text,
    is_profile BOOLEAN default false
);

CREATE TABLE IF NOT EXISTS doctors_datetime (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER not null references doctors(id) on delete cascade,
    leave_dates TEXT,
    available_time TEXT
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
    cancelled_on TIMESTAMP,
    attended BOOLEAN
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
    rating INTEGER not null,
    review TEXT not null
)