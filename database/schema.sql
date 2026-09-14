-- Surekuma MySQL 8 schema (generated from server/prisma/schema.prisma)
CREATE DATABASE IF NOT EXISTS `surekuma`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `surekuma`;

-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` ENUM('APPLICANT', 'SUBJECT_OFFICER', 'SSSB_ADMIN') NOT NULL DEFAULT 'APPLICANT',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_isActive_idx`(`role`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applicant_profiles` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `nameWithInitials` VARCHAR(255) NULL,
    `nic` VARCHAR(20) NOT NULL,
    `dateOfBirth` DATE NOT NULL,
    `gender` VARCHAR(30) NULL,
    `civilStatus` VARCHAR(30) NULL,
    `phone` VARCHAR(30) NOT NULL,
    `alternatePhone` VARCHAR(30) NULL,
    `permanentAddress` TEXT NOT NULL,
    `postalAddress` TEXT NULL,
    `district` VARCHAR(100) NULL,
    `divisionalSecretariat` VARCHAR(191) NULL,
    `nationality` VARCHAR(100) NOT NULL DEFAULT 'Sri Lankan',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `applicant_profiles_userId_key`(`userId`),
    UNIQUE INDEX `applicant_profiles_nic_key`(`nic`),
    INDEX `applicant_profiles_fullName_idx`(`fullName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pension_schemes` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `totalContribution` DECIMAL(12, 2) NULL,
    `sltdaContributionPercent` DECIMAL(5, 2) NOT NULL DEFAULT 40.00,
    `applicantContributionPercent` DECIMAL(5, 2) NOT NULL DEFAULT 60.00,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isSample` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pension_schemes_code_key`(`code`),
    INDEX `pension_schemes_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `id` CHAR(36) NOT NULL,
    `applicationNumber` VARCHAR(40) NULL,
    `applicantProfileId` CHAR(36) NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CORRECTION_REQUESTED', 'SUBJECT_OFFICER_APPROVED', 'REJECTED', 'SSSB_PROCESSING', 'COMPLETED') NOT NULL DEFAULT 'DRAFT',
    `tourismServiceYears` INTEGER NULL,
    `tourismServiceMonths` INTEGER NULL,
    `currentlyRegisteredWithSltda` BOOLEAN NULL,
    `sltdaRegistrationNumber` VARCHAR(100) NULL,
    `registrationCategory` VARCHAR(100) NULL,
    `otherRegistrationCategory` VARCHAR(191) NULL,
    `entitledEpf` BOOLEAN NOT NULL DEFAULT false,
    `entitledEtf` BOOLEAN NOT NULL DEFAULT false,
    `entitledGovernmentPension` BOOLEAN NOT NULL DEFAULT false,
    `entitledOtherSocialSecurity` BOOLEAN NOT NULL DEFAULT false,
    `otherSocialSecurityDetails` VARCHAR(255) NULL,
    `pensionSchemeId` CHAR(36) NULL,
    `selectedSchemePeriodYears` INTEGER NULL,
    `monthlyContributionAmount` DECIMAL(12, 2) NULL,
    `contributionStartMonth` DATE NULL,
    `declarationAccepted` BOOLEAN NOT NULL DEFAULT false,
    `declarationAcceptedAt` DATETIME(3) NULL,
    `applicantSignatureName` VARCHAR(255) NULL,
    `declarationDate` DATE NULL,
    `additionalFormData` JSON NULL,
    `submittedAt` DATETIME(3) NULL,
    `approvedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `applications_applicationNumber_key`(`applicationNumber`),
    INDEX `applications_applicantProfileId_status_idx`(`applicantProfileId`, `status`),
    INDEX `applications_status_submittedAt_idx`(`status`, `submittedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `family_members` (
    `id` CHAR(36) NOT NULL,
    `applicationId` CHAR(36) NOT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `relationship` VARCHAR(100) NOT NULL,
    `nic` VARCHAR(20) NULL,
    `dateOfBirth` DATE NULL,
    `occupation` VARCHAR(191) NULL,
    `maritalStatus` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `family_members_applicationId_idx`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `beneficiaries` (
    `id` CHAR(36) NOT NULL,
    `applicationId` CHAR(36) NOT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `relationship` VARCHAR(100) NOT NULL,
    `nic` VARCHAR(20) NULL,
    `dateOfBirth` DATE NULL,
    `address` TEXT NULL,
    `phone` VARCHAR(30) NULL,
    `allocationPercent` DECIMAL(5, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `beneficiaries_applicationId_idx`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `officer_reviews` (
    `id` CHAR(36) NOT NULL,
    `applicationId` CHAR(36) NOT NULL,
    `officerId` CHAR(36) NOT NULL,
    `eligible` BOOLEAN NULL,
    `eligibilityYears` DECIMAL(5, 2) NULL,
    `eligibilityOverrideReason` TEXT NULL,
    `recommendation` TEXT NULL,
    `decisionReason` TEXT NULL,
    `approvedTotalContribution` DECIMAL(12, 2) NULL,
    `approvedSltdaContribution` DECIMAL(12, 2) NULL,
    `approvedApplicantContribution` DECIMAL(12, 2) NULL,
    `decision` VARCHAR(50) NULL,
    `paymentStartMonth` DATE NULL,
    `paymentMonthCount` INTEGER NULL,
    `paymentEndMonth` DATE NULL,
    `pensionStartMonth` DATE NULL,
    `recommendingOfficerName` VARCHAR(255) NULL,
    `recommendingOfficerDesignation` VARCHAR(191) NULL,
    `approvedOfficerSignatureName` VARCHAR(255) NULL,
    `approvedOfficerDesignation` VARCHAR(191) NULL,
    `recommendationDate` DATE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `officer_reviews_applicationId_createdAt_idx`(`applicationId`, `createdAt`),
    INDEX `officer_reviews_officerId_idx`(`officerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sssb_processing` (
    `id` CHAR(36) NOT NULL,
    `applicationId` CHAR(36) NOT NULL,
    `membershipId` VARCHAR(100) NOT NULL,
    `certificateNumber` VARCHAR(100) NOT NULL,
    `accountOpeningDate` DATE NOT NULL,
    `schemeRegistered` BOOLEAN NOT NULL,
    `officeRemarks` TEXT NULL,
    `officerSignatureName` VARCHAR(255) NOT NULL,
    `processingDate` DATE NOT NULL,
    `processedById` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sssb_processing_applicationId_key`(`applicationId`),
    UNIQUE INDEX `sssb_processing_membershipId_key`(`membershipId`),
    UNIQUE INDEX `sssb_processing_certificateNumber_key`(`certificateNumber`),
    INDEX `sssb_processing_processedById_idx`(`processedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` CHAR(36) NOT NULL,
    `applicationId` CHAR(36) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `originalName` VARCHAR(255) NOT NULL,
    `storedName` VARCHAR(255) NOT NULL,
    `storagePath` VARCHAR(500) NOT NULL,
    `mimeType` VARCHAR(100) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `documents_storedName_key`(`storedName`),
    INDEX `documents_applicationId_category_idx`(`applicationId`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_history` (
    `id` CHAR(36) NOT NULL,
    `applicationId` CHAR(36) NOT NULL,
    `fromStatus` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CORRECTION_REQUESTED', 'SUBJECT_OFFICER_APPROVED', 'REJECTED', 'SSSB_PROCESSING', 'COMPLETED') NULL,
    `toStatus` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CORRECTION_REQUESTED', 'SUBJECT_OFFICER_APPROVED', 'REJECTED', 'SSSB_PROCESSING', 'COMPLETED') NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `comment` TEXT NULL,
    `actorId` CHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `application_history_applicationId_createdAt_idx`(`applicationId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_notifications` (
    `id` CHAR(36) NOT NULL,
    `applicationId` CHAR(36) NULL,
    `recipient` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `template` VARCHAR(100) NOT NULL,
    `status` ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `errorMessage` TEXT NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `email_notifications_applicationId_status_idx`(`applicationId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_sequences` (
    `dateKey` CHAR(8) NOT NULL,
    `currentValue` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`dateKey`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_tokens_tokenHash_key`(`tokenHash`),
    INDEX `password_reset_tokens_userId_expiresAt_idx`(`userId`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `applicant_profiles` ADD CONSTRAINT `applicant_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_applicantProfileId_fkey` FOREIGN KEY (`applicantProfileId`) REFERENCES `applicant_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_pensionSchemeId_fkey` FOREIGN KEY (`pensionSchemeId`) REFERENCES `pension_schemes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `family_members` ADD CONSTRAINT `family_members_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `beneficiaries` ADD CONSTRAINT `beneficiaries_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `officer_reviews` ADD CONSTRAINT `officer_reviews_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `officer_reviews` ADD CONSTRAINT `officer_reviews_officerId_fkey` FOREIGN KEY (`officerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sssb_processing` ADD CONSTRAINT `sssb_processing_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sssb_processing` ADD CONSTRAINT `sssb_processing_processedById_fkey` FOREIGN KEY (`processedById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_history` ADD CONSTRAINT `application_history_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_history` ADD CONSTRAINT `application_history_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_notifications` ADD CONSTRAINT `email_notifications_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `applications`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
