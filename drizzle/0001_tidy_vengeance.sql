CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`indicatorId` int NOT NULL,
	`alertType` enum('threshold_above','threshold_below','change_percent') NOT NULL,
	`threshold` decimal(18,4) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastTriggered` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`keyHash` varchar(128) NOT NULL,
	`name` varchar(64) NOT NULL,
	`permissions` json,
	`rateLimit` int DEFAULT 1000,
	`requestCount` int DEFAULT 0,
	`lastUsed` timestamp,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_keyHash_unique` UNIQUE(`keyHash`)
);
--> statement-breakpoint
CREATE TABLE `calculation_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`indicatorCode` varchar(32) NOT NULL,
	`originalValue` decimal(18,2) NOT NULL,
	`correctedValue` decimal(18,2) NOT NULL,
	`startDate` varchar(16) NOT NULL,
	`endDate` varchar(16) NOT NULL,
	`factor` decimal(18,8) NOT NULL,
	`percentChange` decimal(18,4) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calculation_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cacheKey` varchar(128) NOT NULL,
	`data` json,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `data_cache_id` PRIMARY KEY(`id`),
	CONSTRAINT `data_cache_cacheKey_unique` UNIQUE(`cacheKey`)
);
--> statement-breakpoint
CREATE TABLE `focus_expectations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`indicator` varchar(64) NOT NULL,
	`referenceYear` int NOT NULL,
	`reportDate` timestamp NOT NULL,
	`median` decimal(18,4),
	`mean` decimal(18,4),
	`min` decimal(18,4),
	`max` decimal(18,4),
	`respondents` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `focus_expectations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `indicator_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`indicatorId` int NOT NULL,
	`date` timestamp NOT NULL,
	`value` decimal(18,6) NOT NULL,
	`periodCode` varchar(16),
	`year` int,
	`month` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `indicator_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `indicators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`source` varchar(64) NOT NULL,
	`sourceCode` varchar(64),
	`unit` varchar(32),
	`frequency` enum('daily','monthly','quarterly','yearly') NOT NULL DEFAULT 'monthly',
	`category` varchar(64),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `indicators_id` PRIMARY KEY(`id`),
	CONSTRAINT `indicators_code_unique` UNIQUE(`code`)
);
