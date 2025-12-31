-- 1. ACADEMIES (The Tenant & The User)
CREATE TABLE IF NOT EXISTS academies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL, -- Login Username
    password VARCHAR(255) NOT NULL,     -- Login Password (Hashed)
    phone VARCHAR(15),
    subscription_plan VARCHAR(20) DEFAULT 'FREE', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. BATCHES (Scheduling)
CREATE TABLE IF NOT EXISTS batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    academy_id INTEGER NOT NULL,
    name VARCHAR(50), 
    schedule_time VARCHAR(50),
    coach_name VARCHAR(100),
    FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE
);

-- 3. STUDENTS (The Players)
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    academy_id INTEGER NOT NULL,
    batch_id INTEGER, 
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    dob DATE,
    batting_style VARCHAR(50), 
    bowling_style VARCHAR(50),
    parent_phone VARCHAR(15) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL
);

-- 4. FEE PAYMENTS (Revenue)
CREATE TABLE IF NOT EXISTS fee_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    academy_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    payment_mode VARCHAR(20), -- 'UPI', 'CASH'
    status VARCHAR(20) DEFAULT 'PENDING',
    FOREIGN KEY (academy_id) REFERENCES academies(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- 5. MATCHES (Scoring Header)
CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    academy_id INTEGER NOT NULL,
    team_a_name VARCHAR(100),
    team_b_name VARCHAR(100),
    match_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    venue VARCHAR(100),
    status VARCHAR(20) DEFAULT 'SCHEDULED', -- 'LIVE', 'COMPLETED'
    result VARCHAR(255),                    -- e.g., "Team A won by 20 runs"
    FOREIGN KEY (academy_id) REFERENCES academies(id) ON DELETE CASCADE
);

-- 6. MATCH BALLS (Live Data)
CREATE TABLE IF NOT EXISTS match_balls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    inning_number INT NOT NULL, -- 1 or 2
    over_number INT NOT NULL,
    ball_number INT NOT NULL,
    striker_name VARCHAR(100),
    non_striker_name VARCHAR(100),
    bowler_name VARCHAR(100),
    runs_scored INT DEFAULT 0,
    extras INT DEFAULT 0,
    extra_type VARCHAR(20),     -- 'WIDE', 'NO_BALL', 'NONE'
    is_wicket BOOLEAN DEFAULT 0, -- SQLite uses 0/1 for BOOLEAN
    wicket_type VARCHAR(20),
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

-- 7. ATTENDANCE (Monitoring)
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    batch_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'PRESENT', 'ABSENT', 'LATE'
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    UNIQUE(student_id, date)
);
