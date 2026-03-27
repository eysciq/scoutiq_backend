/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `monthlyPoints` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `successfulPredictions` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalPoints` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `LongTermPrediction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Player` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScoutBadge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeeklyPrediction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LongTermPrediction" DROP CONSTRAINT "LongTermPrediction_playerId_fkey";

-- DropForeignKey
ALTER TABLE "LongTermPrediction" DROP CONSTRAINT "LongTermPrediction_userId_fkey";

-- DropForeignKey
ALTER TABLE "ScoutBadge" DROP CONSTRAINT "ScoutBadge_playerId_fkey";

-- DropForeignKey
ALTER TABLE "ScoutBadge" DROP CONSTRAINT "ScoutBadge_userId_fkey";

-- DropForeignKey
ALTER TABLE "WeeklyPrediction" DROP CONSTRAINT "WeeklyPrediction_userId_fkey";

-- DropIndex
DROP INDEX "User_monthlyPoints_successfulPredictions_createdAt_idx";

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "monthlyPoints",
DROP COLUMN "passwordHash",
DROP COLUMN "successfulPredictions",
DROP COLUMN "totalPoints",
DROP COLUMN "username",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "foot" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "weight" INTEGER,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "LongTermPrediction";

-- DropTable
DROP TABLE "Player";

-- DropTable
DROP TABLE "ScoutBadge";

-- DropTable
DROP TABLE "WeeklyPrediction";
