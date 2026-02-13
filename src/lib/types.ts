import { z } from "zod";

export const medicineSchema = z.object({
  name: z.string().min(1, "Name is required."),
  category: z.string().min(1, "Category is required."),
  company: z.string().min(1, "Company is required."),
  composition: z.string().min(1, "Composition is required."),
  storeBox: z.string().optional(),
  sellingPrice: z.coerce.number().min(0, "Selling price must be positive."),
  unitsPerBulk: z.coerce.number().int().min(1, "Units must be at least 1."),
  reorderPoint: z.coerce.number().int().min(0, "Reorder point must be positive."),
  taxRateGst: z.coerce.number().min(0, "Tax rate must be positive."),
});

export type Medicine = z.infer<typeof medicineSchema> & { id: string };

export type UserProfile = {
  id: string;
  email: string;
  role: 'Admin' | 'Retailer';
  createdAt: string;
  updatedAt: string;
};
