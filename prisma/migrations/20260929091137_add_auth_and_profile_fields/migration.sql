-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT DEFAULT 'DSA Revision & LeetCode Practice',
ADD COLUMN     "password" TEXT,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);
