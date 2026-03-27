-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "successfulPredictions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "marketValue" DOUBLE PRECISION,
    "lastUpdate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LongTermPrediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "predictedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LongTermPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyPrediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "predictedRating" DOUBLE PRECISION NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoutBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoutBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_monthlyPoints_successfulPredictions_createdAt_idx" ON "User"("monthlyPoints" DESC, "successfulPredictions" DESC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "LongTermPrediction_playerId_predictedAt_idx" ON "LongTermPrediction"("playerId", "predictedAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "LongTermPrediction_userId_playerId_key" ON "LongTermPrediction"("userId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoutBadge_userId_playerId_key" ON "ScoutBadge"("userId", "playerId");

-- AddForeignKey
ALTER TABLE "LongTermPrediction" ADD CONSTRAINT "LongTermPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LongTermPrediction" ADD CONSTRAINT "LongTermPrediction_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyPrediction" ADD CONSTRAINT "WeeklyPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoutBadge" ADD CONSTRAINT "ScoutBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoutBadge" ADD CONSTRAINT "ScoutBadge_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
