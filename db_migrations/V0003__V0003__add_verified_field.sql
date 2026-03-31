ALTER TABLE t_p63910134_yarimpligram_project.users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
UPDATE t_p63910134_yarimpligram_project.users SET verified = TRUE WHERE username = 'yar1mple';
