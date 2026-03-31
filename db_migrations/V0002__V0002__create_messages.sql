CREATE TABLE IF NOT EXISTS t_p63910134_yarimpligram_project.messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES t_p63910134_yarimpligram_project.users(id),
  receiver_id INTEGER NOT NULL REFERENCES t_p63910134_yarimpligram_project.users(id),
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON t_p63910134_yarimpligram_project.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON t_p63910134_yarimpligram_project.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON t_p63910134_yarimpligram_project.messages(LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), created_at);
