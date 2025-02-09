-- create role appuser with login password 'appuserpassword';


CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    google_user_id VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    access_token TEXT UNIQUE,
    provider_token TEXT UNIQUE,
    refresh_token TEXT UNIQUE,
    expires_at TIMESTAMP,
    avatar_url TEXT NOT NULL,
    phone VARCHAR(15) UNIQUE,
    gender VARCHAR(20),
    dob DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sign_in_at TIMESTAMP,

    CONSTRAINT phone_format_check CHECK (phone LIKE '[0-9]{10}'),
    CONSTRAINT gender_options_check CHECK (gender IN ('Male', 'Female', 'Other')),
    CONSTRAINT last_sign_in_at_format_check CHECK (last_sign_in_at IS NULL OR last_sign_in_at >= created_at)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- CREATE TABLE IF NOT EXISTS appointments (
--     id SERIAL PRIMARY KEY,
--     user_id INT REFERENCES users(id),
--     date TIMESTAMP NOT NULL,
--     status VARCHAR(50) DEFAULT 'pending',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
