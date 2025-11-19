-- Extend notifications with actor + context metadata
ALTER TABLE `Notification`
    ADD COLUMN `type` ENUM('REACTION', 'COMMENT') NOT NULL DEFAULT 'COMMENT',
    ADD COLUMN `actorId` INTEGER NULL,
    ADD COLUMN `postId` INTEGER NULL,
    ADD COLUMN `commentId` INTEGER NULL;

-- Rebuild foreign key to cascade when a recipient is removed
ALTER TABLE `Notification`
    DROP FOREIGN KEY `Notification_userId_fkey`;

ALTER TABLE `Notification`
    ADD CONSTRAINT `Notification_userId_fkey`
        FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Notification`
    ADD CONSTRAINT `Notification_actorId_fkey`
        FOREIGN KEY (`actorId`) REFERENCES `User`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Notification`
    ADD CONSTRAINT `Notification_postId_fkey`
        FOREIGN KEY (`postId`) REFERENCES `Post`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Notification`
    ADD CONSTRAINT `Notification_commentId_fkey`
        FOREIGN KEY (`commentId`) REFERENCES `Comment`(`id`)
        ON DELETE CASCADE ON UPDATE CASCADE;
