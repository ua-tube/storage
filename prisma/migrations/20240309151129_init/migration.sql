-- CreateEnum
CREATE TYPE "file_status" AS ENUM ('PendingToRemove', 'InUse', 'Removed', 'FailedToRemove');

-- CreateTable
CREATE TABLE "files" (
    "id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_tracking" (
    "id" UUID NOT NULL,
    "fileId" UUID NOT NULL,
    "status" "file_status" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_tracking_fileId_key" ON "file_tracking"("fileId");

-- AddForeignKey
ALTER TABLE "file_tracking" ADD CONSTRAINT "file_tracking_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
