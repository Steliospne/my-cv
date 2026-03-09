-- CreateTable
CREATE TABLE "Cv" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvSection" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "items" JSONB NOT NULL,

    CONSTRAINT "CvSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CvSection_cvId_sortOrder_idx" ON "CvSection"("cvId", "sortOrder");

-- AddForeignKey
ALTER TABLE "CvSection" ADD CONSTRAINT "CvSection_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "Cv"("id") ON DELETE CASCADE ON UPDATE CASCADE;
