CREATE TABLE "users" (
	"id" bigint PRIMARY KEY NOT NULL,
	"referrerId" bigint,
	"photo_url" varchar(255),
	"name" varchar(255)
);
