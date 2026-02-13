import { z } from "zod";

export const medicineSchema = z.object({
  name: z.string().min(1, "Name is required."),
  category: z.string().min(1, "Category is required."),
  company: z.string().min(1, "Company is required."),
  composition: z.string().min(1, "Composition is required."),
  sellingPrice: z.coerce.number().min(0, "Selling price must be a positive number."),
});

export type Medicine = z.infer<typeof medicineSchema> & { 
  id: string;
  createdAt: string;
  updatedAt: string;
};

export const newRetailerSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

export type NewRetailer = z.infer<typeof newRetailerSchema>;

export type UserProfile = {
  id: string;
  email: string;
  role: 'Admin' | 'Retailer';
  createdAt: string;
  updatedAt: string;
};
