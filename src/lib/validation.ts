import { z } from "zod";

const id = z.string().cuid();
const requiredText = (label: string, max = 255) => z.string().trim().min(1, `${label} wajib diisi`).max(max);
const optionalText = (max = 2000) => z.string().trim().max(max).optional().nullable();

export const loginSchema = z.object({
  identifier: requiredText("Email atau NIP"),
  password: z.string().min(8).max(128),
});

export const passwordSchema = z.string().min(8).max(128)
  .regex(/[A-Z]/, "Password wajib memiliki huruf kapital")
  .regex(/[a-z]/, "Password wajib memiliki huruf kecil")
  .regex(/[0-9]/, "Password wajib memiliki angka");

export const registrationSchema = z.object({
  name: requiredText("Nama lengkap", 120).min(3, "Nama lengkap minimal 3 karakter"),
  nip: z.string().trim().regex(/^\d{18}$/, "NIP harus terdiri dari 18 angka"),
  rankGroup: requiredText("Pangkat/golongan", 100),
  nik: z.string().trim().regex(/^\d{16}$/, "NIK harus terdiri dari 16 angka"),
  phone: z.string().trim().regex(/^(?:\+62|62|0)8\d{7,12}$/, "Gunakan nomor telepon Indonesia yang valid"),
  skpdId: id,
  email: z.string().trim().toLowerCase().email("Email kedinasan tidak valid"),
  password: passwordSchema,
  passwordConfirmation: z.string(),
  consent: z.literal(true, { error: "Persetujuan penggunaan data wajib dicentang" }),
}).refine((value) => value.password === value.passwordConfirmation, {
  path: ["passwordConfirmation"],
  message: "Konfirmasi kata sandi belum sama",
});

export const userSchema = z.object({
  name: requiredText("Nama"),
  nip: requiredText("NIP", 32).regex(/^\d{8,32}$/),
  email: z.string().trim().toLowerCase().email(),
  phone: optionalText(30),
  position: requiredText("Jabatan"),
  skpdId: id,
  role: z.enum(["ADMIN", "BORROWER", "APPROVER"]),
});

export const itemSchema = z.object({
  itemCode: requiredText("Kode barang", 64).regex(/^[A-Za-z0-9./_-]+$/),
  name: requiredText("Nama barang"),
  categoryId: id,
  location: requiredText("Lokasi", 255),
  skpdId: id,
  unit: requiredText("Satuan", 50),
  totalQuantity: z.coerce.number().int().nonnegative(),
  availableQuantity: z.coerce.number().int().nonnegative(),
  condition: z.enum(["GOOD", "LIGHTLY_DAMAGED", "HEAVILY_DAMAGED", "LOST"]),
  status: z.enum(["AVAILABLE", "OUT_OF_STOCK", "INACTIVE"]),
  procurementYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
  description: optionalText(),
  mainPhoto: optionalText(500),
}).refine((value) => value.availableQuantity <= value.totalQuantity, {
  message: "Stok tersedia tidak boleh melebihi jumlah barang",
  path: ["availableQuantity"],
});

export const borrowingRequestSchema = z.object({
  purpose: requiredText("Tujuan", 2000),
  activityLocation: requiredText("Lokasi kegiatan", 500),
  borrowDate: z.coerce.date(),
  plannedReturnDate: z.coerce.date(),
  ktpFile: requiredText("KTP", 500),
  approvalLetterFile: requiredText("Surat persetujuan", 500),
  items: z.array(z.object({
    itemId: id,
    quantity: z.coerce.number().int().positive(),
    initialCondition: z.enum(["GOOD", "LIGHTLY_DAMAGED", "HEAVILY_DAMAGED", "LOST"]),
    handoverPhoto: optionalText(500),
  })).min(1).max(100),
}).refine((value) => value.plannedReturnDate >= value.borrowDate, {
  message: "plannedReturnDate harus setelah borrowDate",
  path: ["plannedReturnDate"],
});

export const returnSubmissionSchema = z.object({
  actualReturnDate: z.coerce.date(),
  submittedCondition: z.enum(["GOOD", "LIGHTLY_DAMAGED", "HEAVILY_DAMAGED", "LOST"]),
  completenessStatus: z.enum(["COMPLETE", "INCOMPLETE"]),
  notes: optionalText(),
  photos: z.array(z.object({
    fileUrl: requiredText("fileUrl", 500),
    photoType: requiredText("photoType", 100),
    description: optionalText(500),
    storageKey: optionalText(500),
    originalName: optionalText(255),
    mimeType: z.enum(["application/pdf", "image/jpeg", "image/png"]).optional(),
    size: z.number().int().positive().max(5 * 1024 * 1024).optional(),
  })).min(2, "Minimal 2 foto").max(4, "Maksimal 4 foto"),
});

export const returnVerificationSchema = z.object({
  itemComplete: z.boolean(),
  accessoriesComplete: z.boolean(),
  physicallyIntact: z.boolean(),
  functioningProperly: z.boolean(),
  result: z.enum(["ACCEPTED", "PROBLEM"]),
  issueType: z.enum(["INCOMPLETE", "DAMAGED", "NOT_FUNCTIONING", "LOST", "OTHER"]).optional().nullable(),
  issueDescription: optionalText(),
  followUpRecommendation: optionalText(),
}).superRefine((value, context) => {
  if (value.result === "PROBLEM" && (!value.issueType || !value.issueDescription)) {
    context.addIssue({ code: "custom", path: ["issueDescription"], message: "issueType dan issueDescription wajib" });
  }
});

export const uploadSchema = z.instanceof(File)
  .refine((file) => file.size > 0, "File kosong")
  .refine((file) => file.size <= 5 * 1024 * 1024, "Ukuran file maksimal 5 MB")
  .refine((file) => ["image/jpeg", "image/png", "application/pdf"].includes(file.type), "Format file tidak didukung");
