import { z } from "zod";

export const medicineSchema = z.object({
  name: z.string().min(1, "Name is required."),
  composition: z.string().min(1, "Composition is required."),
  category: z.string().min(1, "Category is required."),
  company: z.string().min(1, "Company is required."),
  basePurchasePrice: z.coerce.number().min(0, "Purchase price must be a non-negative number."),
  baseSellingPrice: z.coerce.number().min(0, "Selling price must be a non-negative number."),
  smallestUnitName: z.string().min(1, "Smallest unit name is required (e.g., tablet, capsule, ml)."),
  unitsPerBulk: z.coerce.number().min(1, "Units per bulk must be at least 1."),
  bulkUnitName: z.string().min(1, "Bulk unit name is required (e.g., strip, box, bottle)."),
  reorderPoint: z.coerce.number().min(0, "Reorder point must be a non-negative number.").optional(),
  taxRateGst: z.coerce.number().min(0, "GST rate must be a non-negative number.").optional(),
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

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required."),
  phoneNumber: z.string().min(1, "Phone number is required."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  address: z.string().optional(),
});

export type Customer = z.infer<typeof customerSchema> & {
  id: string;
  debtAmount: number;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
});

export type SaleItem = z.infer<typeof saleItemSchema> & {
  id: string;
  createdAt: string;
};
