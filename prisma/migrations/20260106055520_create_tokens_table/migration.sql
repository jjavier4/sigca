-- CreateTable
CREATE TABLE "Tokens" (
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Tokens_token_key" ON "Tokens"("token");

-- CreateIndex
CREATE INDEX "Tokens_email_idx" ON "Tokens"("email");

-- CreateIndex
CREATE INDEX "Tokens_token_idx" ON "Tokens"("token");

-- CreateIndex
CREATE INDEX "Tokens_createdAt_idx" ON "Tokens"("createdAt");
