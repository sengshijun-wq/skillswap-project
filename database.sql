-- SkillSwap Database — FYP Seng Shi Jun TP070062
-- Run: Get-Content database.sql | mysql -u root -p

DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS interests;
DROP TABLE IF EXISTS availability;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(100)  NOT NULL,
  email            VARCHAR(150)  NOT NULL UNIQUE,
  password_hash    VARCHAR(255)  NOT NULL,
  role             ENUM('learner','tutor','both','admin') NOT NULL DEFAULT 'both',
  year_of_study    ENUM('Year 1','Year 2','Year 3','Year 4 or above') DEFAULT NULL,
  field_of_study   VARCHAR(100)  DEFAULT NULL,
  bio              TEXT          DEFAULT NULL,
  avatar_initials  CHAR(2)       DEFAULT NULL,
  avatar_url       VARCHAR(255)  DEFAULT NULL,
  created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE skills (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT          NOT NULL,
  subject      VARCHAR(100) NOT NULL,
  subject_code VARCHAR(20)  DEFAULT NULL,
  skill_type   ENUM('teach','learn') NOT NULL,
  proficiency  ENUM('Beginner','Intermediate','Advanced') NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE availability (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  day     ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  slot    ENUM('Morning','Afternoon','Evening') NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE interests (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id  INT          NOT NULL,
  interest VARCHAR(100) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE matches (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  learner_id        INT NOT NULL,
  tutor_id          INT NOT NULL,
  subject           VARCHAR(100) NOT NULL,
  score             INT NOT NULL DEFAULT 0,
  score_subject     INT NOT NULL DEFAULT 0,
  score_proficiency INT NOT NULL DEFAULT 0,
  score_schedule    INT NOT NULL DEFAULT 0,
  score_interest    INT NOT NULL DEFAULT 0,
  status            ENUM('pending','accepted','active','completed','declined') DEFAULT 'pending',
  requested_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at       TIMESTAMP NULL,
  completed_at      TIMESTAMP NULL,
  FOREIGN KEY (learner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tutor_id)   REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  match_id   INT  NOT NULL,
  sender_id  INT  NOT NULL,
  content    TEXT NOT NULL,
  sent_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read    TINYINT(1) DEFAULT 0,
  FOREIGN KEY (match_id)  REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id)   ON DELETE CASCADE
);

-- Seed users (password = "password123" for all, "admin123" for admin)
INSERT INTO users (name, email, password_hash, role, year_of_study, field_of_study, bio, avatar_initials) VALUES
('Ahmad Faris',    'ahmad@apu.edu.my',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LjZdMqF/Pd2', 'both',    'Year 1', 'Computer Science / IT / Software Engineering', 'Year 1 student. Good at Python, struggling with OOP and Data Structures.', 'AF'),
('Sarah Lim',      'sarah@apu.edu.my',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LjZdMqF/Pd2', 'both',    'Year 3', 'Computer Science / IT / Software Engineering', 'Year 3. Distinction in Web Dev. Happy to tutor React and JavaScript.', 'SL'),
('Haziq Zulkifli', 'haziq@apu.edu.my',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LjZdMqF/Pd2', 'both',    'Year 2', 'Computer Science / IT / Software Engineering', 'Strong in Java OOP. Looking to improve in Data Science.', 'HZ'),
('Priya Menon',    'priya@apu.edu.my',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LjZdMqF/Pd2', 'tutor',   'Year 3', 'Computer Science / IT / Software Engineering', 'Top student in Data Structures. Can tutor Trees, Graphs and Sorting.', 'PM'),
('Tan Wei Jie',    'tan@apu.edu.my',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LjZdMqF/Pd2', 'both',    'Year 2', 'Computer Science / IT / Software Engineering', 'MySQL and database design specialist.', 'TW'),
('Amirah Suhada',  'amirah@apu.edu.my', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LjZdMqF/Pd2', 'tutor',   'Year 4 or above', 'Science / Mathematics', 'Final year. Can tutor Calculus, Statistics and Discrete Maths.', 'AS'),
('Nur Aisyah',     'aisyah@apu.edu.my', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LjZdMqF/Pd2', 'tutor',   'Year 4 or above', 'Computer Science / IT / Software Engineering', 'AI/ML researcher. Happy to tutor undergraduate AI and Machine Learning.', 'NA'),
('Raj Kumar',      'raj@apu.edu.my',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LjZdMqF/Pd2', 'both',    'Year 2', 'Computer Science / IT / Software Engineering', 'Good at Discrete Maths and Algorithms. Learning web dev.', 'RK'),
('Admin User',     'admin@apu.edu.my',  '$2b$10$YyN7t9g7N0AHGhq8vBKAyOX3D3Y3oYHFOXF0VHoMJE4ACKo7WuLaS', 'admin',   NULL, NULL, NULL, 'AU');

-- Teaching skills
INSERT INTO skills (user_id, subject, subject_code, skill_type, proficiency) VALUES
(1,'Python Programming',           'CT098-3-2','teach','Intermediate'),
(1,'HTML & CSS',                   'CT101-3-2','teach','Beginner'),
(2,'Web Development (React.js)',   'CT207-3-3','teach','Advanced'),
(2,'JavaScript',                   'CT102-3-2','teach','Advanced'),
(3,'Object-Oriented Programming',  'CT099-3-2','teach','Intermediate'),
(3,'Java',                         'CT099-3-2','teach','Intermediate'),
(4,'Data Structures & Algorithms', 'CT110-3-2','teach','Advanced'),
(4,'C++',                          'CT105-3-2','teach','Advanced'),
(5,'Database Management (MySQL)',  'CT115-3-2','teach','Intermediate'),
(6,'Calculus & Mathematics',       'MA101-3-1','teach','Advanced'),
(6,'Statistics',                   'MA102-3-1','teach','Advanced'),
(7,'Artificial Intelligence',      'CT201-3-3','teach','Advanced'),
(7,'Machine Learning',             'CT202-3-3','teach','Advanced'),
(8,'Data Structures & Algorithms', 'CT110-3-2','teach','Intermediate'),
(8,'Discrete Mathematics',         'MA103-3-1','teach','Intermediate');

-- Learning skills
INSERT INTO skills (user_id, subject, subject_code, skill_type, proficiency) VALUES
(1,'Object-Oriented Programming',  'CT099-3-2','learn','Beginner'),
(1,'Data Structures & Algorithms', 'CT110-3-2','learn','Beginner'),
(1,'Web Development (React.js)',   'CT207-3-3','learn','Beginner'),
(2,'Artificial Intelligence',      'CT201-3-3','learn','Intermediate'),
(3,'Data Structures & Algorithms', 'CT110-3-2','learn','Beginner'),
(8,'Web Development (React.js)',   'CT207-3-3','learn','Beginner'),
(8,'Machine Learning',             'CT202-3-3','learn','Beginner');

-- Availability
INSERT INTO availability (user_id, day, slot) VALUES
(1,'Monday','Evening'),(1,'Wednesday','Evening'),(1,'Friday','Afternoon'),(1,'Saturday','Morning'),
(2,'Tuesday','Morning'),(2,'Wednesday','Evening'),(2,'Saturday','Afternoon'),(2,'Sunday','Morning'),
(3,'Monday','Morning'),(3,'Tuesday','Evening'),(3,'Friday','Morning'),(3,'Saturday','Evening'),
(4,'Monday','Afternoon'),(4,'Wednesday','Morning'),(4,'Friday','Evening'),(4,'Saturday','Morning'),
(5,'Tuesday','Evening'),(5,'Thursday','Evening'),(5,'Saturday','Morning'),
(6,'Monday','Morning'),(6,'Tuesday','Morning'),(6,'Wednesday','Morning'),(6,'Thursday','Morning'),(6,'Friday','Morning'),
(7,'Monday','Evening'),(7,'Wednesday','Evening'),(7,'Friday','Evening'),(7,'Saturday','Evening'),
(8,'Monday','Afternoon'),(8,'Tuesday','Evening'),(8,'Wednesday','Afternoon');

-- Interests
INSERT INTO interests (user_id, interest) VALUES
(1,'Software Engineering'),(1,'AI & Machine Learning'),(1,'Web Development'),
(2,'Web Development'),(2,'Software Engineering'),(2,'UI/UX Design'),
(3,'Software Engineering'),(3,'Data Science'),
(4,'Data Science'),(4,'AI & Machine Learning'),(4,'Competitive Programming'),
(5,'Database Systems'),(5,'Data Science'),
(6,'Mathematics'),(6,'Data Science'),(6,'AI & Machine Learning'),
(7,'AI & Machine Learning'),(7,'Data Science'),(7,'Research'),
(8,'Software Engineering'),(8,'AI & Machine Learning'),(8,'Web Development');

-- Sample matches
INSERT INTO matches (learner_id, tutor_id, subject, score, score_subject, score_proficiency, score_schedule, score_interest, status, requested_at, accepted_at) VALUES
(1, 2, 'Web Development (React.js)',   90, 50, 20, 10, 10, 'active',    NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 2 DAY),
(1, 4, 'Data Structures & Algorithms', 90, 50, 20, 10, 10, 'active',    NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 4 DAY),
(1, 3, 'Object-Oriented Programming',  80, 50, 20, 10,  0, 'completed', NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 13 DAY);

-- Sample messages
INSERT INTO messages (match_id, sender_id, content, sent_at) VALUES
(1, 2, 'Hi Ahmad! I saw your match request for React.js. I finished the Web Dev module last semester with a distinction.',        NOW() - INTERVAL 2 DAY),
(1, 1, 'Hi Sarah! I am struggling with React hooks and useEffect specifically. Are you free this week?',                          NOW() - INTERVAL 2 DAY + INTERVAL 5 MINUTE),
(1, 2, 'Yes! Wednesday evening or Saturday afternoon works. I will walk you through useState and useEffect with a project.',       NOW() - INTERVAL 2 DAY + INTERVAL 10 MINUTE),
(1, 1, 'Wednesday evening at 8PM works perfectly!',                                                                               NOW() - INTERVAL 2 DAY + INTERVAL 15 MINUTE),
(1, 2, 'Great! I will prepare a mini todo app example so you can see the concepts in action.',                                    NOW() - INTERVAL 2 DAY + INTERVAL 20 MINUTE),
(2, 4, 'Hello Ahmad! I can help you with Trees and Graphs. Those are tricky but very important for interviews.',                   NOW() - INTERVAL 4 DAY),
(2, 1, 'Thank you Priya! I am mainly stuck on BST insertion and in-order traversal.',                                             NOW() - INTERVAL 4 DAY + INTERVAL 8 MINUTE),
(2, 4, 'Perfect. Let me prepare some visualisation examples. Saturday morning works for me.',                                     NOW() - INTERVAL 4 DAY + INTERVAL 15 MINUTE);

SELECT 'Database setup complete!' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_skills FROM skills;