import { NextResponse } from "next/server";
import { AuthenticationError, AuthorizationError, WorkflowError } from "./types";

export function apiErrorResponse(error: unknown, fallback: string) {
  if (error instanceof AuthenticationError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof AuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof WorkflowError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(
    { error: fallback },
    { status: 400 },
  );
}
