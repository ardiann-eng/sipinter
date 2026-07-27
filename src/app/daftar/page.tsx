import { db } from "@/lib/db";
import { RegistrationForm } from "./registration-form";

export const dynamic = "force-dynamic";

export default async function RegistrationPage() {
  const skpds = await db.sKPD.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
  return <RegistrationForm skpds={skpds} />;
}
