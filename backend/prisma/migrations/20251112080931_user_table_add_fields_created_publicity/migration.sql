-- CreateEnum
CREATE TYPE "ProfilePublicity" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "profilePublicity" "ProfilePublicity" NOT NULL DEFAULT 'PRIVATE';
