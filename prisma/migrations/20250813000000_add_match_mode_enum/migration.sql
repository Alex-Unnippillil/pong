-- CreateEnum
CREATE TYPE "MatchMode" AS ENUM ('classic', 'ranked');

-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "mode" TYPE "MatchMode" USING "mode"::"MatchMode";
