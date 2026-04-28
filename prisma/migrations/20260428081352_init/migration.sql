-- CreateTable
CREATE TABLE "TaigaConnection" (
    "id" SERIAL NOT NULL,
    "projectName" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaigaConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" SERIAL NOT NULL,
    "taigaUserId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#1a56db',
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WidgetConfig" (
    "id" SERIAL NOT NULL,
    "widgetKey" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "chartType" TEXT NOT NULL DEFAULT 'bar',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WidgetConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SprintSnapshot" (
    "id" SERIAL NOT NULL,
    "projectId" TEXT NOT NULL,
    "sprintId" INTEGER NOT NULL,
    "sprintName" TEXT NOT NULL,
    "doneCount" INTEGER NOT NULL,
    "inProgress" INTEGER NOT NULL,
    "blockedCount" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SprintSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_taigaUserId_key" ON "TeamMember"("taigaUserId");

-- CreateIndex
CREATE UNIQUE INDEX "WidgetConfig_widgetKey_key" ON "WidgetConfig"("widgetKey");

-- CreateIndex
CREATE INDEX "SprintSnapshot_projectId_sprintId_idx" ON "SprintSnapshot"("projectId", "sprintId");

-- CreateIndex
CREATE UNIQUE INDEX "SprintSnapshot_projectId_sprintId_takenAt_key" ON "SprintSnapshot"("projectId", "sprintId", "takenAt");
