
CREATE TABLE t_p63910134_yarimpligram_project.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(32) UNIQUE NOT NULL,
  display_name VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  bio TEXT DEFAULT '',
  avatar_gradient INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p63910134_yarimpligram_project.sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p63910134_yarimpligram_project.users(id),
  token VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE TABLE t_p63910134_yarimpligram_project.friendships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p63910134_yarimpligram_project.users(id),
  friend_id INTEGER NOT NULL REFERENCES t_p63910134_yarimpligram_project.users(id),
  status VARCHAR(16) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_sessions_token ON t_p63910134_yarimpligram_project.sessions(token);
CREATE INDEX idx_friendships_user ON t_p63910134_yarimpligram_project.friendships(user_id);
CREATE INDEX idx_friendships_friend ON t_p63910134_yarimpligram_project.friendships(friend_id);
