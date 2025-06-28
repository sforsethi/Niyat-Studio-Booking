# Studio Booking System

A comprehensive studio booking management system with **Razorpay payment integration** and **Google Calendar synchronization**.

## Features

✨ **User-Friendly Booking Flow**
- Interactive calendar for date selection
- Real-time availability checking
- Duration-based booking (1-8 hours)
- Guest booking (no registration required)

💳 **Payment Integration**
- Secure payments via Razorpay
- Automatic payment verification
- ₹950 per hour pricing

📅 **Calendar Integration**
- Google Calendar API integration
- Automatic event creation
- Real-time availability sync

🎯 **Modern UI/UX**
- Responsive design
- Step-by-step booking process
- Clean, professional interface

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Custom calendar component
- Responsive CSS3 design
- Razorpay Checkout integration

**Backend:**
- Node.js with Express
- SQLite database
- Google Calendar API
- Razorpay payment processing

## Quick Start

### Prerequisites
- Node.js 16+ installed
- Razorpay account for payment processing
- Google Cloud Platform account for Calendar API

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studio-booking-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your API keys
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your Razorpay key
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## Environment Variables

### Backend (.env)
```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Google Calendar Configuration
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_service_account_private_key
GOOGLE_CALENDAR_ID=your_calendar_id

# Server Configuration
PORT=5000
```

### Frontend (.env)
```env
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
REACT_APP_API_URL=http://localhost:5000
```

## API Setup Guides

### Razorpay Setup
1. Create account at [razorpay.com](https://razorpay.com)
2. Navigate to Settings → API Keys
3. Generate Test/Live keys
4. Add keys to environment variables

### Google Calendar API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create Service Account credentials
5. Download JSON key file
6. Extract client_email and private_key for environment variables

## Deployment

### Free Deployment Options

**Frontend (Vercel):**
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

**Backend (Railway):**
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on git push

**Alternative Backend (Render):**
1. Connect GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on git push

## Usage

### Booking Flow
1. **Select Date**: Choose available date from calendar
2. **Choose Time**: Select time slot and duration
3. **Enter Details**: Provide name, email, phone
4. **Payment**: Complete payment via Razorpay
5. **Confirmation**: Receive email confirmation and calendar invite

### Admin Features
- View all bookings in SQLite database
- Monitor payments via Razorpay dashboard
- Track calendar events in Google Calendar

## Database Schema

```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date TEXT NOT NULL,
  startTime TEXT NOT NULL,
  duration INTEGER NOT NULL,
  totalAmount INTEGER NOT NULL,
  razorpayOrderId TEXT,
  razorpayPaymentId TEXT,
  status TEXT DEFAULT 'pending',
  googleEventId TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## File Structure

```
studio-booking-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookingSystem.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── TimeSlots.tsx
│   │   │   ├── BookingForm.tsx
│   │   │   └── PaymentModal.tsx
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vercel.json
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── railway.toml
└── README.md
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## Support

For issues and support:
- Create issue in GitHub repository
- Email: [your-email@example.com]

## License

MIT License - see LICENSE file for details

---

**Built with ❤️ for efficient studio management**