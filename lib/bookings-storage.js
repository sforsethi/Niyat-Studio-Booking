// Supabase storage for bookings
const { bookingHelpers } = require('./supabase.js');

// Fallback to in-memory storage if Supabase is not configured
let inMemoryBookings = [];
const useSupabase = true; // Always use Supabase with hardcoded credentials

const saveBooking = async (booking) => {
  console.log('saveBooking called with:', JSON.stringify(booking, null, 2));
  console.log('useSupabase:', useSupabase);
  console.log('Environment check:', {
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL
  });
  
  if (useSupabase) {
    try {
      console.log('Attempting to save to Supabase...');
      const result = await bookingHelpers.saveBooking(booking);
      console.log('Supabase save successful:', result);
      return result;
    } catch (error) {
      console.error('Supabase error, falling back to in-memory:', error);
    }
  } else {
    console.log('Supabase not configured, using in-memory storage');
  }
  
  // Fallback to in-memory
  inMemoryBookings.push(booking);
  console.log('Saved to in-memory. Total bookings:', inMemoryBookings.length);
  return booking;
};

const getBookings = async () => {
  if (useSupabase) {
    try {
      return await bookingHelpers.getBookings();
    } catch (error) {
      console.error('Supabase error, falling back to in-memory:', error);
    }
  }
  
  // Fallback to in-memory
  return inMemoryBookings;
};

const getBookingById = async (id) => {
  if (useSupabase) {
    try {
      return await bookingHelpers.getBookingById(id);
    } catch (error) {
      console.error('Supabase error, falling back to in-memory:', error);
    }
  }
  
  // Fallback to in-memory
  return inMemoryBookings.find(booking => booking.id === id);
};

const clearBookings = () => {
  inMemoryBookings = [];
};

module.exports = {
  saveBooking,
  getBookings,
  getBookingById,
  clearBookings
};