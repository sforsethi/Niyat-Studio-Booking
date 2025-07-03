import sqlite3 from 'sqlite3';

// Initialize SQLite database  
const sqlite = sqlite3.verbose();
const db = new sqlite.Database('/tmp/bookings.db');

// Initialize database
const initializeDB = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create bookings table
      db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        date TEXT NOT NULL,
        startTime TEXT NOT NULL,
        duration INTEGER NOT NULL,
        totalAmount INTEGER NOT NULL,
        originalAmount INTEGER NOT NULL,
        discountAmount INTEGER DEFAULT 0,
        couponCode TEXT,
        razorpayOrderId TEXT,
        razorpayPaymentId TEXT,
        status TEXT DEFAULT 'pending',
        googleEventId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Create coupons table
      db.run(`CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        discountType TEXT NOT NULL CHECK(discountType IN ('percentage', 'fixed')),
        discountValue INTEGER NOT NULL,
        minAmount INTEGER DEFAULT 0,
        maxDiscount INTEGER,
        usageLimit INTEGER,
        usedCount INTEGER DEFAULT 0,
        validFrom DATETIME DEFAULT CURRENT_TIMESTAMP,
        validUntil DATETIME,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Insert GAURAV-NIYAT coupon only
      db.run(`INSERT OR IGNORE INTO coupons (code, description, discountType, discountValue, minAmount, maxDiscount, usageLimit, validUntil) VALUES 
        ('GAURAV-NIYAT', 'Special VIP discount for Gaurav', 'percentage', 18, 500, 1000, 50, '2025-12-31 23:59:59')`, function(err) {
        if (err) {
          console.error('Error inserting coupon:', err);
          reject(err);
        } else {
          console.log('Coupon GAURAV-NIYAT inserted successfully');
          resolve();
        }
      });
    });
  });
};

export { db, initializeDB };