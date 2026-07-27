-- CreateTable
CREATE TABLE "SKPD" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
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

-- CreateTable
CREATE TABLE "ItemCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "skpdId" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "totalQuantity" INTEGER NOT NULL,
    "availableQuantity" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "procurementYear" INTEGER NOT NULL,
    "description" TEXT,
    "mainPhoto" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ItemCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_skpdId_fkey" FOREIGN KEY ("skpdId") REFERENCES "SKPD" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BorrowingRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationNumber" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "skpdId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "activityLocation" TEXT NOT NULL,
    "borrowDate" DATETIME NOT NULL,
    "plannedReturnDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "ktpFile" TEXT,
    "approvalLetterFile" TEXT,
    "adminNote" TEXT,
    "approverNote" TEXT,
    "submittedAt" DATETIME,
    "verifiedAt" DATETIME,
    "approvedAt" DATETIME,
    "rejectedAt" DATETIME,
    "handedOverAt" DATETIME,
    "returnedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BorrowingRequest_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BorrowingRequest_skpdId_fkey" FOREIGN KEY ("skpdId") REFERENCES "SKPD" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BorrowingRequestItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowingRequestId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "initialCondition" TEXT NOT NULL,
    "handoverPhoto" TEXT,
    CONSTRAINT "BorrowingRequestItem_borrowingRequestId_fkey" FOREIGN KEY ("borrowingRequestId") REFERENCES "BorrowingRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BorrowingRequestItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApprovalRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowingRequestId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "note" TEXT,
    "decidedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApprovalRecord_borrowingRequestId_fkey" FOREIGN KEY ("borrowingRequestId") REFERENCES "BorrowingRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApprovalRecord_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HandoverRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowingRequestId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientIdentity" TEXT NOT NULL,
    "handoverAt" DATETIME NOT NULL,
    "notes" TEXT,
    "proofFile" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HandoverRecord_borrowingRequestId_fkey" FOREIGN KEY ("borrowingRequestId") REFERENCES "BorrowingRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HandoverRecord_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReturnSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowingRequestId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "actualReturnDate" DATETIME NOT NULL,
    "submittedCondition" TEXT NOT NULL,
    "completenessStatus" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "submittedAt" DATETIME,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReturnSubmission_borrowingRequestId_fkey" FOREIGN KEY ("borrowingRequestId") REFERENCES "BorrowingRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReturnSubmission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReturnPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "returnSubmissionId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "photoType" TEXT NOT NULL,
    "description" TEXT,
    "storageKey" TEXT,
    "originalName" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReturnPhoto_returnSubmissionId_fkey" FOREIGN KEY ("returnSubmissionId") REFERENCES "ReturnSubmission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReturnVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowingRequestId" TEXT NOT NULL,
    "verifierId" TEXT NOT NULL,
    "itemComplete" BOOLEAN NOT NULL,
    "accessoriesComplete" BOOLEAN NOT NULL,
    "physicallyIntact" BOOLEAN NOT NULL,
    "functioningProperly" BOOLEAN NOT NULL,
    "result" TEXT NOT NULL,
    "issueType" TEXT,
    "issueDescription" TEXT,
    "followUpRecommendation" TEXT,
    "verifiedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReturnVerification_borrowingRequestId_fkey" FOREIGN KEY ("borrowingRequestId") REFERENCES "BorrowingRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReturnVerification_verifierId_fkey" FOREIGN KEY ("verifierId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "skpdId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "objectType" TEXT NOT NULL,
    "objectId" TEXT,
    "previousValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_skpdId_fkey" FOREIGN KEY ("skpdId") REFERENCES "SKPD" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SKPD_code_key" ON "SKPD"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_nip_key" ON "User"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_skpdId_role_status_idx" ON "User"("skpdId", "role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCategory_code_key" ON "ItemCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Item_itemCode_key" ON "Item"("itemCode");

-- CreateIndex
CREATE INDEX "Item_categoryId_idx" ON "Item"("categoryId");

-- CreateIndex
CREATE INDEX "Item_skpdId_status_idx" ON "Item"("skpdId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BorrowingRequest_registrationNumber_key" ON "BorrowingRequest"("registrationNumber");

-- CreateIndex
CREATE INDEX "BorrowingRequest_borrowerId_status_idx" ON "BorrowingRequest"("borrowerId", "status");

-- CreateIndex
CREATE INDEX "BorrowingRequest_skpdId_status_idx" ON "BorrowingRequest"("skpdId", "status");

-- CreateIndex
CREATE INDEX "BorrowingRequest_status_plannedReturnDate_idx" ON "BorrowingRequest"("status", "plannedReturnDate");

-- CreateIndex
CREATE INDEX "BorrowingRequestItem_itemId_idx" ON "BorrowingRequestItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "BorrowingRequestItem_borrowingRequestId_itemId_key" ON "BorrowingRequestItem"("borrowingRequestId", "itemId");

-- CreateIndex
CREATE INDEX "ApprovalRecord_borrowingRequestId_decidedAt_idx" ON "ApprovalRecord"("borrowingRequestId", "decidedAt");

-- CreateIndex
CREATE INDEX "ApprovalRecord_approverId_idx" ON "ApprovalRecord"("approverId");

-- CreateIndex
CREATE UNIQUE INDEX "HandoverRecord_borrowingRequestId_key" ON "HandoverRecord"("borrowingRequestId");

-- CreateIndex
CREATE INDEX "HandoverRecord_adminId_idx" ON "HandoverRecord"("adminId");

-- CreateIndex
CREATE INDEX "ReturnSubmission_borrowingRequestId_submittedAt_idx" ON "ReturnSubmission"("borrowingRequestId", "submittedAt");

-- CreateIndex
CREATE INDEX "ReturnSubmission_submittedById_idx" ON "ReturnSubmission"("submittedById");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnPhoto_storageKey_key" ON "ReturnPhoto"("storageKey");

-- CreateIndex
CREATE INDEX "ReturnPhoto_returnSubmissionId_idx" ON "ReturnPhoto"("returnSubmissionId");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnVerification_borrowingRequestId_key" ON "ReturnVerification"("borrowingRequestId");

-- CreateIndex
CREATE INDEX "ReturnVerification_verifierId_idx" ON "ReturnVerification"("verifierId");

-- CreateIndex
CREATE INDEX "AuditLog_skpdId_createdAt_idx" ON "AuditLog"("skpdId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_objectType_objectId_idx" ON "AuditLog"("objectType", "objectId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");
