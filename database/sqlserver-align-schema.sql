IF OBJECT_ID('users', 'U') IS NULL
BEGIN
  CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(255) NULL,
    avatar_url NVARCHAR(MAX) NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(500) NULL,
    password NVARCHAR(500) NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'user',
    is_verified BIT NOT NULL DEFAULT 0,
    verification_code NVARCHAR(10) NULL,
    code_expires_at DATETIME NULL,
    reset_code NVARCHAR(10) NULL,
    reset_code_expires DATETIME NULL,
    twofa_secret NVARCHAR(255) NULL,
    twofa_enabled BIT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT GETDATE()
  );
END;

IF COL_LENGTH('users', 'avatar_url') IS NULL
BEGIN
  ALTER TABLE users ADD avatar_url NVARCHAR(MAX) NULL;
END;

IF COL_LENGTH('users', 'password_hash') IS NULL
BEGIN
  ALTER TABLE users ADD password_hash NVARCHAR(500) NULL;
END;

IF COL_LENGTH('users', 'password') IS NULL
BEGIN
  ALTER TABLE users ADD password NVARCHAR(500) NULL;
END;

IF COL_LENGTH('users', 'is_verified') IS NULL
BEGIN
  ALTER TABLE users ADD is_verified BIT NOT NULL CONSTRAINT DF_users_is_verified_align DEFAULT 0;
END;

IF COL_LENGTH('users', 'verification_code') IS NULL
BEGIN
  ALTER TABLE users ADD verification_code NVARCHAR(10) NULL;
END;

IF COL_LENGTH('users', 'code_expires_at') IS NULL
BEGIN
  ALTER TABLE users ADD code_expires_at DATETIME NULL;
END;

IF COL_LENGTH('users', 'reset_code') IS NULL
BEGIN
  ALTER TABLE users ADD reset_code NVARCHAR(10) NULL;
END;

IF COL_LENGTH('users', 'reset_code_expires') IS NULL
BEGIN
  ALTER TABLE users ADD reset_code_expires DATETIME NULL;
END;

IF COL_LENGTH('users', 'twofa_secret') IS NULL
BEGIN
  ALTER TABLE users ADD twofa_secret NVARCHAR(255) NULL;
END;

IF COL_LENGTH('users', 'twofa_enabled') IS NULL
BEGIN
  ALTER TABLE users ADD twofa_enabled BIT NOT NULL CONSTRAINT DF_users_twofa_enabled_align DEFAULT 0;
END;

IF OBJECT_ID('documents', 'U') IS NULL
BEGIN
  CREATE TABLE documents (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NULL,
    title NVARCHAR(255) NOT NULL,
    category NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    filename NVARCHAR(500) NOT NULL,
    original_name NVARCHAR(500) NULL,
    mime_type NVARCHAR(255) NULL,
    file_size INT NULL,
    file_data VARBINARY(MAX) NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE()
  );
END;

IF COL_LENGTH('documents', 'category') IS NULL
BEGIN
  ALTER TABLE documents ADD category NVARCHAR(255) NULL;
END;

IF COL_LENGTH('documents', 'filename') IS NULL
BEGIN
  ALTER TABLE documents ADD filename NVARCHAR(500) NULL;
END;

IF COL_LENGTH('documents', 'original_name') IS NULL
BEGIN
  ALTER TABLE documents ADD original_name NVARCHAR(500) NULL;
END;

IF COL_LENGTH('documents', 'mime_type') IS NULL
BEGIN
  ALTER TABLE documents ADD mime_type NVARCHAR(255) NULL;
END;

IF COL_LENGTH('documents', 'file_size') IS NULL
BEGIN
  ALTER TABLE documents ADD file_size INT NULL;
END;

IF COL_LENGTH('documents', 'file_data') IS NULL
BEGIN
  ALTER TABLE documents ADD file_data VARBINARY(MAX) NULL;
END;

IF OBJECT_ID('shared_links', 'U') IS NULL
BEGIN
  CREATE TABLE shared_links (
    id INT IDENTITY(1,1) PRIMARY KEY,
    document_id INT NOT NULL,
    token NVARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_by INT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE()
  );
END;

IF COL_LENGTH('shared_links', 'created_by') IS NULL
BEGIN
  ALTER TABLE shared_links ADD created_by INT NULL;
END;

IF COL_LENGTH('shared_links', 'created_at') IS NULL
BEGIN
  ALTER TABLE shared_links ADD created_at DATETIME NOT NULL CONSTRAINT DF_shared_links_created_at_align DEFAULT GETDATE();
END;

IF OBJECT_ID('activity_logs', 'U') IS NULL
BEGIN
  CREATE TABLE activity_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NULL,
    action_type NVARCHAR(100) NULL,
    action_details NVARCHAR(MAX) NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE()
  );
END;

IF OBJECT_ID('biometric_credentials', 'U') IS NULL
BEGIN
  CREATE TABLE biometric_credentials (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    credential_id NVARCHAR(500) NOT NULL UNIQUE,
    public_key NVARCHAR(MAX) NOT NULL,
    sign_count BIGINT NOT NULL DEFAULT 0,
    device_name NVARCHAR(255) NULL,
    aaguid NVARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    last_used_at DATETIME NOT NULL DEFAULT GETDATE()
  );
END;

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_documents_users'
) AND COL_LENGTH('documents', 'user_id') IS NOT NULL
BEGIN
  ALTER TABLE documents
  ADD CONSTRAINT FK_documents_users
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
END;

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_shared_links_documents'
) AND COL_LENGTH('shared_links', 'document_id') IS NOT NULL
BEGIN
  ALTER TABLE shared_links
  ADD CONSTRAINT FK_shared_links_documents
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;
END;

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_shared_links_users'
) AND COL_LENGTH('shared_links', 'created_by') IS NOT NULL
BEGIN
  ALTER TABLE shared_links
  ADD CONSTRAINT FK_shared_links_users
  FOREIGN KEY (created_by) REFERENCES users(id);
END;

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_activity_logs_users'
) AND COL_LENGTH('activity_logs', 'user_id') IS NOT NULL
BEGIN
  ALTER TABLE activity_logs
  ADD CONSTRAINT FK_activity_logs_users
  FOREIGN KEY (user_id) REFERENCES users(id);
END;

-- Optional manual cleanup for old unused tables seen in the diagram:
-- DROP TABLE dbo.notes;
-- DROP TABLE dbo.userss;
-- DROP TABLE dbo.usersss;
