# Calendly-Style Real-Time Availability Setup

## 🎯 **Goal: Real-time Google Calendar Integration**
Your booking system now checks your Google Calendar and shows only truly available time slots (like Calendly).

## ✅ **Current Status**
- ✅ **Google OAuth Client ID**: `931846062684-qekghuf4aibk889q81gar0g6eqjtqvdm.apps.googleusercontent.com`
- ✅ **Project ID**: `poetic-logic-212506`
- ⚠️ **Missing**: Google Calendar API Key (for public calendar reading)

## 🔧 **Required Setup**

### **Step 1: Enable Google Calendar API**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `poetic-logic-212506`
3. **APIs & Services** → **Library**
4. Search "Google Calendar API" → **Enable**

### **Step 2: Create API Key**
1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **API Key**
3. Copy the API key
4. **Restrict Key** (recommended):
   - Application restrictions: **HTTP referrers**
   - Add: `http://localhost:5173/*` and your domain
   - API restrictions: **Google Calendar API**

### **Step 3: Update Environment**
Add to `frontend/.env`:
```env
REACT_APP_GOOGLE_API_KEY=your_api_key_here
```

### **Step 4: Test Real-Time Availability**
1. Restart frontend: `npm run dev`
2. Open booking system
3. Click "Sign in to Google Calendar" when selecting time slots
4. System will show only available times based on your actual calendar

## 🎯 **How It Works (Like Calendly)**

### **Without Calendar Sync:**
- Shows all time slots (9 AM - 9 PM)
- Users can book any slot
- May create conflicts

### **With Calendar Sync:**
- ✅ Reads your Google Calendar events
- ✅ Hides busy time slots automatically
- ✅ Shows only truly available times
- ✅ Prevents double bookings
- ✅ Updates in real-time

## 📱 **User Experience**

1. **User selects date** → System checks your Google Calendar
2. **System shows available slots** → Only slots not conflicting with existing events
3. **User books slot** → Gets added to your calendar automatically
4. **Next user** → Sees updated availability (that slot now unavailable)

## 🔐 **Privacy & Security**

- Users need to sign in with Google to see real availability
- Only reads calendar events (no write access for viewing)
- Your calendar data stays private
- Users only see available/unavailable status

## 🚀 **Alternative: Manual Setup**

If you prefer not to set up the API key right now:
1. System works perfectly without it
2. Shows all time slots as available
3. You manually check for conflicts
4. Still better than most booking systems!

## 📧 **Next Steps**

1. **Get API Key** (5 minutes)
2. **Add to environment file**
3. **Test with your actual calendar**
4. **Enjoy Calendly-style functionality!**

Your studio booking system will then automatically sync with your Google Calendar and show real-time availability to clients! 🎉