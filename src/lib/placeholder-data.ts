import type { Medicine, Customer, Retailer, Supplier, Sale } from '@/lib/types';
import { add } from 'date-fns';

const today = new Date();

export const medicines: Medicine[] = [
  {
    id: 'med001',
    name: 'Paracetamol 500mg',
    category: 'Painkiller',
    storeBox: 'A-101',
    sellingPrice: 1.5,
    quantity: 100,
    genericName: 'Paracetamol',
    company: 'Pharma Inc.',
    expiryDate: add(today, { days: 25 }).toISOString(),
    batchId: 'B01',
    stock: 1000,
    lowStockThreshold: 200,
  },
  {
    id: 'med002',
    name: 'Aspirin 75mg',
    category: 'Blood Thinner',
    storeBox: 'B-203',
    sellingPrice: 2.0,
    quantity: 50,
    genericName: 'Aspirin',
    company: 'Health Corp.',
    expiryDate: add(today, { days: 50 }).toISOString(),
    batchId: 'B02',
    stock: 500,
    lowStockThreshold: 100,
  },
  {
    id: 'med003',
    name: 'Ibuprofen 200mg',
    category: 'Anti-inflammatory',
    storeBox: 'A-102',
    sellingPrice: 3.2,
    quantity: 200,
    genericName: 'Ibuprofen',
    company: 'Pharma Inc.',
    expiryDate: add(today, { days: 85 }).toISOString(),
    batchId: 'B03',
    stock: 2000,
    lowStockThreshold: 500,
  },
  {
    id: 'med004',
    name: 'Amoxicillin 250mg',
    category: 'Antibiotic',
    storeBox: 'C-301',
    sellingPrice: 5.0,
    quantity: 15, // Low stock
    genericName: 'Amoxicillin',
    company: 'MediCare',
    expiryDate: add(today, { days: 120 }).toISOString(),
    batchId: 'B04',
    stock: 150,
    lowStockThreshold: 100,
  },
    {
    id: 'med005',
    name: 'Cetirizine 10mg',
    category: 'Antihistamine',
    storeBox: 'B-204',
    sellingPrice: 0.8,
    quantity: 300,
    genericName: 'Cetirizine',
    company: 'Health Corp.',
    expiryDate: add(today, { days: -10 }).toISOString(), // Expired
    batchId: 'B05',
    stock: 3000,
    lowStockThreshold: 1000,
  },
];

export const customers: Customer[] = [
  {
    id: 'cust001',
    name: 'John Doe',
    phone: '123-456-7890',
    email: 'john.doe@example.com',
    joinDate: '2023-01-15',
    debt: 50.0,
    paid: 200.0,
  },
  {
    id: 'cust002',
    name: 'Jane Smith',
    phone: '987-654-3210',
    email: 'jane.smith@example.com',
    joinDate: '2023-03-22',
    debt: 0,
    paid: 150.0,
  },
];

export const retailers: Retailer[] = [
  {
    id: 'ret001',
    name: 'City Pharmacy',
    contactPerson: 'Mr. Chen',
    phone: '555-0101',
    email: 'contact@citypharm.com',
  },
  {
    id: 'ret002',
    name: 'Suburb Meds',
    contactPerson: 'Ms. Davis',
    phone: '555-0102',
    email: 'orders@suburbmeds.com',
  },
];

export const suppliers: Supplier[] = [
  {
    id: 'sup001',
    name: 'Global PharmaDist',
    contactPerson: 'Mr. Singh',
    phone: '111-222-3333',
    email: 'sales@globalpharma.com',
    accountPayable: 15000,
  },
  {
    id: 'sup002',
    name: 'National Wellness Supply',
    contactPerson: 'Ms. Rodriguez',
    phone: '444-555-6666',
    email: 'accounts@nws.com',
    accountPayable: 8500,
  },
];

export const sales: Sale[] = [
    { id: 'sale001', medicineName: 'Paracetamol 500mg', quantity: 2, totalPrice: 3.0, date: '2024-05-01', customerName: 'John Doe' },
    { id: 'sale002', medicineName: 'Aspirin 75mg', quantity: 1, totalPrice: 2.0, date: '2024-05-01', customerName: 'Jane Smith' },
    { id: 'sale003', medicineName: 'Ibuprofen 200mg', quantity: 3, totalPrice: 9.6, date: '2024-05-02', customerName: 'John Doe' },
    { id: 'sale004', medicineName: 'Paracetamol 500mg', quantity: 5, totalPrice: 7.5, date: '2024-04-15', customerName: 'New Customer' },
    { id: 'sale005', medicineName: 'Cetirizine 10mg', quantity: 1, totalPrice: 0.8, date: '2024-04-20', customerName: 'Jane Smith' },
    { id: 'sale006', medicineName: 'Amoxicillin 250mg', quantity: 1, totalPrice: 5.0, date: '2024-03-10', customerName: 'John Doe' },
];

export const monthlySalesData = [
  { month: "Jan", "Paracetamol 500mg": 4000, "Ibuprofen 200mg": 2400 },
  { month: "Feb", "Paracetamol 500mg": 3000, "Ibuprofen 200mg": 1398 },
  { month: "Mar", "Paracetamol 500mg": 2000, "Ibuprofen 200mg": 9800 },
  { month: "Apr", "Paracetamol 500mg": 2780, "Ibuprofen 200mg": 3908 },
  { month: "May", "Paracetamol 500mg": 1890, "Ibuprofen 200mg": 4800 },
  { month: "Jun", "Paracetamol 500mg": 2390, "Ibuprofen 200mg": 3800 },
  { month: "Jul", "Paracetamol 500mg": 3490, "Ibuprofen 200mg": 4300 },
];
