import { z } from "zod";

export const medicineSchema = z.object({
  name: z.string().min(1, "Name is required."),
  compositionId: z.string().min(1, "Composition is required."),
  category: z.string().min(1, "Category is required."),
  company: z.string().min(1, "Company is required."),
  basePurchasePrice: z.coerce.number().min(0, "Purchase price must be a non-negative number."),
  baseSellingPrice: z.coerce.number().min(0, "Selling price must be a non-negative number."),
  tabletsPerStrip: z.coerce.number().min(1, "Must be at least 1.").optional().nullable(),
  stripsPerBox: z.coerce.number().min(1, "Must be at least 1.").optional().nullable(),
  reorderPoint: z.coerce.number().min(0, "Reorder point must be a non-negative number.").optional(),
  taxRateGst: z.coerce.number().min(0, "GST rate must be a non-negative number.").optional(),
});

export type Medicine = z.infer<typeof medicineSchema> & { 
  id: string;
  createdAt: any;
  updatedAt: any;
};

export const stockEntrySchema = z.object({
  medicineId: z.string().min(1, "Please select a medicine."),
  batchNumber: z.string().min(1, "Batch number is required."),
  expiryDate: z.date({ required_error: "Expiry date is required." }),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  purchasePricePerSmallestUnit: z.coerce.number().min(0, "Purchase price is required."),
});

export type StockEntry = z.infer<typeof stockEntrySchema>;

export type UserProfile = {
  id: string;
  email: string;
  role: 'Admin';
  createdAt: any;
  updatedAt: any;
};

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required."),
  phoneNumber: z.string().min(1, "Phone number is required."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  address: z.string().optional(),
});

export type Customer = z.infer<typeof customerSchema> & {
  id: string;
  debtAmount: number;
  createdAt: any;
  updatedAt: any;
};

export const saleSchema = z.object({
  saleDate: z.string(),
  customerId: z.string().optional(),
  totalAmountBeforeTax: z.number(),
  totalTaxAmount: z.number(),
  totalAmountDue: z.number(),
  amountPaid: z.number(),
  balanceDue: z.number(),
  paymentMethod: z.string(),
  invoiceNumber: z.string(),
  createdByUserId: z.string(),
});

export type Sale = z.infer<typeof saleSchema> & {
  id: string;
  createdAt: any;
  updatedAt: any;
};

export const saleItemSchema = z.object({
  saleId: z.string(),
  medicineId: z.string(),
  batchId: z.string(),
  quantitySold: z.number(),
  unitSellingPrice: z.number(),
  purchasePriceAtSale: z.number().optional(),
  gstRateApplied: z.number(),
  itemTotalBeforeTax: z.number(),
  itemTaxAmount: z.number(),
  itemTotalWithTax: z.number(),
  createdByUserId: z.string(),
});

export type SaleItem = z.infer<typeof saleItemSchema> & {
  id: string;
  createdAt: any;
};

export const publicMedicineRequestSchema = z.object({
  name: z.string().min(1, "Name is required."),
  contactNumber: z.string().min(1, "Contact number is required."),
  place: z.string().min(1, "Place is required."),
  medicineName: z.string().min(3, "Please enter medicine details."),
});

export type PublicMedicineRequest = z.infer<typeof publicMedicineRequestSchema> & {
  id: string;
  status: 'Pending' | 'Contacted' | 'Fulfilled';
  createdAt: any;
};
