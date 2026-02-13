export type Medicine = {
  id: string;
  name: string;
  category: string;
  storeBox: string;
  sellingPrice: number;
  quantity: number;
  genericName: string;
  company: string;
  expiryDate: string;
  batchId: string;
  stock: number;
  lowStockThreshold: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinDate: string;
  debt: number;
  paid: number;
};

export type Retailer = {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
};

export type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  accountPayable: number;
};

export type Sale = {
  id: string;
  medicineName: string;
  quantity: number;
  totalPrice: number;
  date: string;
  customerName: string;
};
