// Main JavaScript file for Invoice Joy application

// Set current date
function setCurrentDate() {
  const now = new Date();
  const dateString = now.toISOString().split("T")[0]; // YYYY-MM-DD format
  document.getElementById("currentDate").textContent = dateString;
}
setCurrentDate();

// Services data
const services = [
  { name: "Logo Design", cost: 400.00, duration: 4 },
  { name: "Business Card Design", cost: 300.00, duration: 3 },
  { name: "Letterhead Design", cost: 300.00, duration: 2 },
  { name: "Email Signature Design", cost: 300.00, duration: 1 },
  { name: "Company Profile Design (5-10 pages)", cost: 700.00, duration: 4 },
  { name: "Brand Mock-ups", cost: 300.00, duration: 2 },
  { name: "Flyer/Poster Design", cost: 300.00, duration: 3 },
  { name: "Marketing Brochure", cost: 300.00, duration: 3 },
  { name: "Website Design & Development", cost: 3500.00, duration: 10 },
  { name: "Website Hosting (12 months)", cost: 2499.00, duration: 1 },
  { name: "Professional Business Email (5 mailboxes included, 50GB, mobile sync, Docs, Sheets & Presentations, Premium Email Delivery, 12 months)", cost: 1609.50, duration: 1 },
  { name: "Excel Quotation/Invoice Template Design", cost: 400.00, duration: 2 },
  { name: "Custom Lead Generation Form (automated email notification on submission)", cost: 1200.00, duration: 1 },
  { name: "Domain Registration and configuration (12 months)", cost: 715.33, duration: 1 },
  { name: "Brand Guidelines", cost: 1650.00, duration: 7 },
  { name: "LinkedIn Header", cost: 300.00, duration: 3 },
  { name: "Social Media Profile Picture Design", cost: 200.00, duration: 2 },
  { name: "Content Copy", cost: 600.00, duration: 5 }
];

// Service tracking system
const serviceRegistry = new Map();
let customServices = [];

// Initialize registry with predefined services
services.forEach(service => {
  serviceRegistry.set(service.name, service);
});

// Package definitions
const packages = {
  essential: [
    { name: "Logo Design", cost: 400.00, duration: 4 },
    { name: "Business Card Design", cost: 300.00, duration: 3 },
    { name: "Letterhead Design", cost: 300.00, duration: 2 },
    { name: "Email Signature Design", cost: 300.00, duration: 1 },
    { name: "Excel Quotation/Invoice Template Design", cost: 400.00, duration: 2 },
    { name: "Professional Business Email (5 mailboxes included, 75GB, mobile sync, Docs, Sheets & Presentations, Premium Email Delivery, 12 months)", cost: 1609.50, duration: 1 }
  ],
  standard: [
    { name: "Logo Design", cost: 400.00, duration: 4 },
    { name: "Business Card Design", cost: 300.00, duration: 3 },
    { name: "Letterhead Design", cost: 300.00, duration: 2 },
    { name: "Email Signature Design", cost: 300.00, duration: 1 },
    { name: "Company Profile Design (5-10 pages)", cost: 700.00, duration: 4 },
    { name: "Excel Quotation/Invoice Template Design", cost: 400.00, duration: 2 },
    { name: "Professional Business Email (5 mailboxes included, 75GB, mobile sync, Docs, Sheets & Presentations, Premium Email Delivery, 12 months)", cost: 1609.50, duration: 1 }
  ],
  professional: [
    { name: "Logo Design", cost: 400.00, duration: 4 },
    { name: "Business Card Design", cost: 300.00, duration: 3 },
    { name: "Letterhead Design", cost: 300.00, duration: 2 },
    { name: "Email Signature Design", cost: 300.00, duration: 1 },
    { name: "Company Profile Design (5-10 pages)", cost: 700.00, duration: 4 },
    { name: "Excel Quotation/Invoice Template Design", cost: 400.00, duration: 2 },
    { name: "Website Design & Development", cost: 3500.00, duration: 10 },
    { name: "Website Hosting (12 months)", cost: 2499.00, duration: 1 },
    { name: "Custom Lead Generation Form", cost: 1200.00, duration: 1 }
  ]
};

// Main function implementations for invoice handling
// Note: This is a simplified version of the full script.js file
// Full implementation includes calculation functions, event listeners, and client data management

// Event listeners for buttons
document.getElementById("savePdfBtn").addEventListener("click", function() {
  console.log("Save PDF functionality");
});

document.getElementById("saveFormBtn").addEventListener("click", function() {
  console.log("Save Form functionality");
});

document.getElementById("loadFormBtn").addEventListener("click", function() {
  console.log("Load Form functionality");
});

// Add event listeners for package buttons
document.querySelectorAll('.package-btn').forEach(button => {
  button.addEventListener('click', function() {
    const packageName = this.dataset.package;
    console.log(`Package selected: ${packageName}`);
  });
});

// This is a placeholder for the complete script.js file
// Please download the full version from the repository