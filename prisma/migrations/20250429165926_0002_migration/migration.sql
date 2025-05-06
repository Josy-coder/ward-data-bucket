-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ROOT', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BucketType" AS ENUM ('T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T13', 'T14', 'T15', 'T16', 'T17', 'T18', 'T19', 'T20');

-- CreateTable
CREATE TABLE "GeoRegion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GeoRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Province" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "geoRegionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "provinceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LLG" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "districtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "LLG_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ward" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "llgId" TEXT NOT NULL,
    "villages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 4,

    CONSTRAINT "Ward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "geoRegionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbgDistrict" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "regionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "AbgDistrict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Constituency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "districtId" TEXT NOT NULL,
    "villages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "Constituency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MkaRegion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "geoRegionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "MkaRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MkaWard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "regionId" TEXT NOT NULL,
    "sections" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "MkaWard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "wardId" TEXT,
    "constituencyId" TEXT,
    "mkaWardId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodeMovementHistory" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "oldParentId" TEXT NOT NULL,
    "newParentId" TEXT NOT NULL,
    "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "oldPath" TEXT NOT NULL,
    "newPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NodeMovementHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "tenantId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "verificationToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataPeriod" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "dateCompleted" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WardDataBucket" (
    "id" TEXT NOT NULL,
    "wardId" TEXT NOT NULL,
    "dataPeriodId" TEXT NOT NULL,
    "bucketType" "BucketType" NOT NULL,
    "data" JSONB,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "dateCompleted" TIMESTAMP(3),
    "lastModified" TIMESTAMP(3) NOT NULL,
    "modifiedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WardDataBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataEntryStatus" (
    "id" TEXT NOT NULL,
    "dataYearId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "referenceKeyId" TEXT NOT NULL,
    "dateCompleted" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataEntryStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dataBucketId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisasterAlert" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "alertDate" TIMESTAMP(3) NOT NULL,
    "alertBy" TEXT NOT NULL,
    "level1Id" TEXT NOT NULL,
    "level2Id" TEXT,
    "level3Id" TEXT,
    "level4Id" TEXT,
    "level5Id" TEXT,
    "level6Id" TEXT,
    "location" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isFakeNews" BOOLEAN NOT NULL DEFAULT false,
    "alertVerifiedDate" TIMESTAMP(3),
    "alertVerifiedBy" TEXT,
    "alertApprovedForPublicDate" TIMESTAMP(3),
    "alertApprovedForPublicBy" TEXT,
    "severity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisasterAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GeoRegion_name_key" ON "GeoRegion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Province_path_key" ON "Province"("path");

-- CreateIndex
CREATE INDEX "Province_path_idx" ON "Province"("path");

-- CreateIndex
CREATE UNIQUE INDEX "Province_name_geoRegionId_key" ON "Province"("name", "geoRegionId");

-- CreateIndex
CREATE UNIQUE INDEX "District_path_key" ON "District"("path");

-- CreateIndex
CREATE INDEX "District_path_idx" ON "District"("path");

-- CreateIndex
CREATE UNIQUE INDEX "District_name_provinceId_key" ON "District"("name", "provinceId");

-- CreateIndex
CREATE UNIQUE INDEX "LLG_path_key" ON "LLG"("path");

-- CreateIndex
CREATE INDEX "LLG_path_idx" ON "LLG"("path");

-- CreateIndex
CREATE UNIQUE INDEX "LLG_name_districtId_key" ON "LLG"("name", "districtId");

-- CreateIndex
CREATE UNIQUE INDEX "Ward_path_key" ON "Ward"("path");

-- CreateIndex
CREATE INDEX "Ward_path_idx" ON "Ward"("path");

-- CreateIndex
CREATE UNIQUE INDEX "Ward_name_llgId_key" ON "Ward"("name", "llgId");

-- CreateIndex
CREATE UNIQUE INDEX "Region_path_key" ON "Region"("path");

-- CreateIndex
CREATE INDEX "Region_path_idx" ON "Region"("path");

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_geoRegionId_key" ON "Region"("name", "geoRegionId");

-- CreateIndex
CREATE UNIQUE INDEX "AbgDistrict_path_key" ON "AbgDistrict"("path");

-- CreateIndex
CREATE INDEX "AbgDistrict_path_idx" ON "AbgDistrict"("path");

-- CreateIndex
CREATE UNIQUE INDEX "AbgDistrict_name_regionId_key" ON "AbgDistrict"("name", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Constituency_path_key" ON "Constituency"("path");

-- CreateIndex
CREATE INDEX "Constituency_path_idx" ON "Constituency"("path");

-- CreateIndex
CREATE UNIQUE INDEX "Constituency_name_districtId_key" ON "Constituency"("name", "districtId");

-- CreateIndex
CREATE UNIQUE INDEX "MkaRegion_path_key" ON "MkaRegion"("path");

-- CreateIndex
CREATE INDEX "MkaRegion_path_idx" ON "MkaRegion"("path");

-- CreateIndex
CREATE UNIQUE INDEX "MkaRegion_name_geoRegionId_key" ON "MkaRegion"("name", "geoRegionId");

-- CreateIndex
CREATE UNIQUE INDEX "MkaWard_path_key" ON "MkaWard"("path");

-- CreateIndex
CREATE INDEX "MkaWard_path_idx" ON "MkaWard"("path");

-- CreateIndex
CREATE UNIQUE INDEX "MkaWard_name_regionId_key" ON "MkaWard"("name", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_path_key" ON "Location"("path");

-- CreateIndex
CREATE INDEX "Location_path_idx" ON "Location"("path");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_districtId_key" ON "Tenant"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "DataPeriod_year_tenantId_key" ON "DataPeriod"("year", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "WardDataBucket_wardId_dataPeriodId_bucketType_key" ON "WardDataBucket"("wardId", "dataPeriodId", "bucketType");

-- AddForeignKey
ALTER TABLE "Province" ADD CONSTRAINT "Province_geoRegionId_fkey" FOREIGN KEY ("geoRegionId") REFERENCES "GeoRegion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LLG" ADD CONSTRAINT "LLG_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ward" ADD CONSTRAINT "Ward_llgId_fkey" FOREIGN KEY ("llgId") REFERENCES "LLG"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_geoRegionId_fkey" FOREIGN KEY ("geoRegionId") REFERENCES "GeoRegion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbgDistrict" ADD CONSTRAINT "AbgDistrict_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Constituency" ADD CONSTRAINT "Constituency_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "AbgDistrict"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MkaRegion" ADD CONSTRAINT "MkaRegion_geoRegionId_fkey" FOREIGN KEY ("geoRegionId") REFERENCES "GeoRegion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MkaWard" ADD CONSTRAINT "MkaWard_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "MkaRegion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "Constituency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_mkaWardId_fkey" FOREIGN KEY ("mkaWardId") REFERENCES "MkaWard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeMovementHistory" ADD CONSTRAINT "NodeMovementHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataPeriod" ADD CONSTRAINT "DataPeriod_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WardDataBucket" ADD CONSTRAINT "WardDataBucket_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WardDataBucket" ADD CONSTRAINT "WardDataBucket_dataPeriodId_fkey" FOREIGN KEY ("dataPeriodId") REFERENCES "DataPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_dataBucketId_fkey" FOREIGN KEY ("dataBucketId") REFERENCES "WardDataBucket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
