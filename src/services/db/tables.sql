-- create role appuser with login password 'appuserpassword';


CREATE TABLE IF NOT EXISTS users (
    id SERIAL ,
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
    id INTEGER PRIMARY KEY,
    therapy_id VARCHAR(100) not null,
    name TEXT NOT NULL,
    email VARCHAR(100) UNIQUE,
    avatar_url TEXT,
    experience INTEGER not null,
    specialist_in TEXT not null,
    leave_dates DATE[]
);
