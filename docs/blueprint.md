# **App Name**: PharmaFlow

## Core Features:

- Batch Expiry Management (FEFO): Tracks medicine batches with unique IDs, expiry dates, and quantities. Automatically suggests the soonest-to-expire batch for sales.
- Unit of Measure (UOM) Conversion: Allows inputting purchases in bulk (e.g., boxes) while tracking stock at the smallest unit (e.g., tablets). Uses Zod for schema validation to prevent garbage data.
- Reorder Point (ROP) Alerts: Automatically flags medicines as 'Low Stock' on a dashboard and generates Purchase Orders automatically when a Reorder Point (ROP) is hit.
- Generic Search: Suggests alternative brands with the same chemical composition if a specific brand is out of stock using database relationships. The database links medicines to a composition_id, so the Generic Search looks for other rows with the same ID. Implements Smart Search with Fuzzy Matching using Fuse.js.
- Expiry Alerts Dashboard: Highlights products expiring within the next 30, 60, and 90 days with a color-coded system: Red (<30 days), Orange (60 days), Yellow (90 days).
- Sales Analytics Dashboard: Presents a chart displaying the most profitable and highest-selling medicines per month.
- Supplier/Vendor Management and Return to Vendor (RTV) Workflow: Tracks medicine suppliers. A dedicated module to Ship Back expired or damaged goods to the specific supplier. Stock and Account Payable adjust accordingly. The Admin can also request tablets from the retailer, and the retailer can request items or tablets from the admin.
- Customer Account Management: Allows the admin to create and manage customer accounts, including tracking tablet history and payment information (debt, cash, UPI).
- GST/Tax Calculation: Adds a GST calculator in the checkout flow to handle different tax slabs for medicines.
- PDF Invoice Generation: A 'Print Bill' button that generates a PDF receipt.
- Transaction Management: Ensures database uses Transactions. Stock decreases and sales record created simultaneously. If one fails, both should fail.
- Quick Scan (Barcode Simulation): Adds a text input that simulates a barcode scanner. Typing a code and hitting 'Enter' should immediately add the item to the cart.
- Audit Logs (Compliance Feature): A non-deletable log table that records every manual stock adjustment. Example: User 'Retailer_A' manually adjusted Stock of 'Aspirin' from 50 to 45 (Reason: Damaged Packaging).
- AI-Powered Composition Search Tool: When adding a new medicine, the admin enters a medicine composition, and the tool presents possible matching compositions. The admin can approve, edit, or reject the match.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) for trust and reliability.
- Background color: Light gray (#ECEFF1) for a clean, professional look.
- Accent color: Teal (#009688) for highlights and interactive elements.
- Headline font: 'Belleza' serif for titles, aligned to a professional look. Body font: 'Alegreya' serif for main text and readability.
- Note: currently only Google Fonts are supported.
- Use clear and professional icons from a consistent set (e.g., FontAwesome) for inventory actions and alerts.
- A clean, intuitive layout with clear separation of sections (inventory, sales, alerts). Use a grid system for responsive design.
- Subtle transitions and animations (e.g., fading, sliding) to provide feedback and improve the user experience without being distracting.