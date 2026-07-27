import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  skpdId: string;
  name: string;
  email: string;
  role: Role;
};

export type RequestContext = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type StoredFile = {
  key: string;
  size: number;
  mimeType: string;
  originalName: string;
};

export class AuthenticationError extends Error {
  constructor(message = "Autentikasi diperlukan") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "Anda tidak memiliki izin") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class WorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowError";
  }
}
