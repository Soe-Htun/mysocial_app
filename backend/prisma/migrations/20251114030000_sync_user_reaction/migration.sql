-- Add missing columns from updated Prisma schema
-- Add coverUrl if it doesn't exist
SET @cover_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'User'
    AND COLUMN_NAME = 'coverUrl'
);

SET @cover_stmt = IF(
  @cover_exists = 0,
  'ALTER TABLE `User` ADD COLUMN `coverUrl` LONGTEXT NULL',
  'SELECT 1'
);

PREPARE add_cover FROM @cover_stmt;
EXECUTE add_cover;
DEALLOCATE PREPARE add_cover;

-- Add location if it doesn't exist
SET @location_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'User'
    AND COLUMN_NAME = 'location'
);

SET @location_stmt = IF(
  @location_exists = 0,
  'ALTER TABLE `User` ADD COLUMN `location` VARCHAR(191) NULL',
  'SELECT 1'
);

PREPARE add_location FROM @location_stmt;
EXECUTE add_location;
DEALLOCATE PREPARE add_location;

-- Ensure updatedAt column matches Prisma definition
ALTER TABLE `User`
  MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

-- Backfill updatedAt for existing rows to satisfy NOT NULL constraint
UPDATE `User` SET `updatedAt` = NOW(3) WHERE `updatedAt` IS NULL;

-- Align reactions enum + unique constraint with Prisma schema
ALTER TABLE `Reaction`
  MODIFY `type` ENUM('LIKE', 'LOVE', 'CARE', 'HAHA', 'WOW', 'ANGRY', 'CELEBRATE') NOT NULL DEFAULT 'LIKE';

-- Drop existing FK + index only if they are still present
SET @reaction_user_fk_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND CONSTRAINT_NAME = 'Reaction_userId_fkey'
    AND TABLE_NAME = 'Reaction'
);

SET @drop_reaction_user_fk = IF(
  @reaction_user_fk_exists > 0,
  'ALTER TABLE `Reaction` DROP FOREIGN KEY `Reaction_userId_fkey`',
  'SELECT 1'
);

PREPARE drop_reaction_user_fk_stmt FROM @drop_reaction_user_fk;
EXECUTE drop_reaction_user_fk_stmt;
DEALLOCATE PREPARE drop_reaction_user_fk_stmt;

SET @reaction_post_fk_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND CONSTRAINT_NAME = 'Reaction_postId_fkey'
    AND TABLE_NAME = 'Reaction'
);

SET @drop_reaction_post_fk = IF(
  @reaction_post_fk_exists > 0,
  'ALTER TABLE `Reaction` DROP FOREIGN KEY `Reaction_postId_fkey`',
  'SELECT 1'
);

PREPARE drop_reaction_post_fk_stmt FROM @drop_reaction_post_fk;
EXECUTE drop_reaction_post_fk_stmt;
DEALLOCATE PREPARE drop_reaction_post_fk_stmt;

SET @reaction_old_index_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Reaction'
    AND INDEX_NAME = 'Reaction_userId_postId_type_key'
);

SET @drop_reaction_old_index = IF(
  @reaction_old_index_exists > 0,
  'ALTER TABLE `Reaction` DROP INDEX `Reaction_userId_postId_type_key`',
  'SELECT 1'
);

PREPARE drop_reaction_old_index_stmt FROM @drop_reaction_old_index;
EXECUTE drop_reaction_old_index_stmt;
DEALLOCATE PREPARE drop_reaction_old_index_stmt;

-- Recreate foreign keys if missing
SET @reaction_user_fk_new_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND CONSTRAINT_NAME = 'Reaction_userId_fkey'
    AND TABLE_NAME = 'Reaction'
);

SET @add_reaction_user_fk = IF(
  @reaction_user_fk_new_exists = 0,
  'ALTER TABLE `Reaction` ADD CONSTRAINT `Reaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE',
  'SELECT 1'
);

PREPARE add_reaction_user_fk_stmt FROM @add_reaction_user_fk;
EXECUTE add_reaction_user_fk_stmt;
DEALLOCATE PREPARE add_reaction_user_fk_stmt;

SET @reaction_post_fk_new_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND CONSTRAINT_NAME = 'Reaction_postId_fkey'
    AND TABLE_NAME = 'Reaction'
);

SET @add_reaction_post_fk = IF(
  @reaction_post_fk_new_exists = 0,
  'ALTER TABLE `Reaction` ADD CONSTRAINT `Reaction_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE',
  'SELECT 1'
);

PREPARE add_reaction_post_fk_stmt FROM @add_reaction_post_fk;
EXECUTE add_reaction_post_fk_stmt;
DEALLOCATE PREPARE add_reaction_post_fk_stmt;

-- Add the new unique index only if missing
SET @reaction_new_index_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Reaction'
    AND INDEX_NAME = 'Reaction_userId_postId_key'
);

SET @add_reaction_new_index = IF(
  @reaction_new_index_exists = 0,
  'CREATE UNIQUE INDEX `Reaction_userId_postId_key` ON `Reaction`(`userId`, `postId`)',
  'SELECT 1'
);

PREPARE add_reaction_new_index_stmt FROM @add_reaction_new_index;
EXECUTE add_reaction_new_index_stmt;
DEALLOCATE PREPARE add_reaction_new_index_stmt;
