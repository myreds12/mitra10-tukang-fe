import React from "react";

export default function ManualBookPage() {
  const userRoles = localStorage.getItem("userRole") || "";

  const roleMap: Record<string, string> = {
    "Super User": "MANUAL BOOK ADMIN HO.pdf",
    "Admin HO": "MANUAL BOOK ADMIN HO.pdf",
    "Admin Vendor": "MANUAL BOOK VENDOR.pdf",
    "Store CS": "MANUAL BOOK STORE.pdf",
    "Tukang": "MANUAL BOOK TUKANG.pdf",
    "Payroll": "MANUAL BOOK PAYROLL.pdf",
    "Finance": "MANUAL BOOK FINANCE.pdf",
    "Admin WA": "MANUAL_BOOK_ADMIN_WA.pdf",
  };

  const fileName = roleMap[userRoles];

  // diambil dari folder public/manual_book, bukan dari API backend
  const pdfUrl = fileName
    ? `${process.env.PUBLIC_URL}/manual_book/${encodeURIComponent(fileName)}`
    : "";

  return (
    <section id="view-item">
      <div className="card">
        <div className="card-body">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              width="100%"
              height="800px"
              style={{ border: "none" }}
              title="Manual Book"
            />
          ) : (
            <p>Manual book tidak ditemukan untuk role ini.</p>
          )}
        </div>
      </div>
    </section>
  );
}