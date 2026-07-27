-- CreateTable
CREATE TABLE "RegistrationRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "nikCiphertext" TEXT NOT NULL,
    "nikHash" TEXT NOT NULL,
    "rankGroup" TEXT NOT NULL,
    "skpdId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewerNote" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RegistrationRequest_skpdId_fkey" FOREIGN KEY ("skpdId") REFERENCES "SKPD" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegistrationRequest_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTable
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "nikHash" TEXT,
    "rankGroup" TEXT,
    "position" TEXT NOT NULL,
    "skpdId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'BORROWER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "passwordHash" TEXT NOT NULL,
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_skpdId_fkey" FOREIGN KEY ("skpdId") REFERENCES "SKPD" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "lastLoginAt", "name", "nip", "passwordHash", "phone", "position", "role", "skpdId", "status", "updatedAt") SELECT "createdAt", "email", "id", "lastLoginAt", "name", "nip", "passwordHash", "phone", "position", "role", "skpdId", "status", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_nip_key" ON "User"("nip");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_nikHash_key" ON "User"("nikHash");
CREATE INDEX "User_skpdId_role_status_idx" ON "User"("skpdId", "role", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

CREATE UNIQUE INDEX "RegistrationRequest_registrationNo_key" ON "RegistrationRequest"("registrationNo");
CREATE UNIQUE INDEX "RegistrationRequest_nip_key" ON "RegistrationRequest"("nip");
CREATE UNIQUE INDEX "RegistrationRequest_email_key" ON "RegistrationRequest"("email");
CREATE UNIQUE INDEX "RegistrationRequest_nikHash_key" ON "RegistrationRequest"("nikHash");
CREATE INDEX "RegistrationRequest_status_createdAt_idx" ON "RegistrationRequest"("status", "createdAt");
CREATE INDEX "RegistrationRequest_skpdId_status_idx" ON "RegistrationRequest"("skpdId", "status");
