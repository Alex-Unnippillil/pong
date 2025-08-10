-- CreateEnum
CREATE TYPE "Mode" AS ENUM ('SINGLEPLAYER', 'MULTIPLAYER');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN "mode_temp" "Mode";
UPDATE "Match" SET "mode_temp" = CASE "mode"
    WHEN 'singleplayer' THEN 'SINGLEPLAYER'
    WHEN 'multiplayer' THEN 'MULTIPLAYER'
    ELSE NULL
END;
ALTER TABLE "Match" DROP COLUMN "mode";
ALTER TABLE "Match" RENAME COLUMN "mode_temp" TO "mode";
