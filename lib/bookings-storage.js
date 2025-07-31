// Supabase storage for bookings
import { bookingHelpers } from './supabase.js';

// Fallback to in-memory storage if Supabase is not configured
let inMemoryBookings = [];
const useSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL;

export const saveBooking = async (booking) => {
  if (useSupabase) {
    try {
      return await bookingHelpers.saveBooking(booking);
    } catch (error) {
      console.error('Supabase error, falling back to in-memory:', error);
    }
  }
  
  // Fallback to in-memory
  inMemoryBookings.push(booking);
  return booking;
};

export const getBookings = async () => {
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

export const getBookingById = async (id) => {
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

export const clearBookings = () => {
  inMemoryBookings = [];
};