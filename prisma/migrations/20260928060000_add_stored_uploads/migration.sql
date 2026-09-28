CREATE TABLE "StoredUpload" (
  "key" TEXT NOT NULL PRIMARY KEY,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "StoredUploadChunk" (
  "uploadKey" TEXT NOT NULL,
  "index" INTEGER NOT NULL,
  "data" BLOB NOT NULL,
  PRIMARY KEY ("uploadKey", "index"),
  CONSTRAINT "StoredUploadChunk_uploadKey_fkey" FOREIGN KEY ("uploadKey") REFERENCES "StoredUpload" ("key") ON DELETE CASCADE ON UPDATE CASCADE
);
