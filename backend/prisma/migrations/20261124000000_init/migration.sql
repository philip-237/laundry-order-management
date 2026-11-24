CREATE TYPE "ServiceType" AS ENUM ('WASH_ONLY', 'IRON_ONLY', 'WASH_AND_IRON');
CREATE TYPE "OrderStatus" AS ENUM ('RECEIVED', 'WASHING', 'READY', 'COLLECTED');

CREATE TABLE "User" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "LaundryOrder" (
  "id" SERIAL PRIMARY KEY,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "serviceType" "ServiceType" NOT NULL,
  "totalPrice" DECIMAL(12,2) NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'RECEIVED',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "session" (
  "sid" VARCHAR PRIMARY KEY,
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL
);
CREATE INDEX "session_expire_idx" ON "session"("expire");
