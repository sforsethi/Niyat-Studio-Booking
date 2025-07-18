// Simple in-memory storage for bookings (will persist during deployment)
// In production, replace with a proper database
let bookings = [];

export const saveBooking = (booking) => {
  bookings.push(booking);
  return booking;
};

export const getBookings = () => {
  return bookings;
};

export const getBookingById = (id) => {
  return bookings.find(booking => booking.id === id);
};

export const clearBookings = () => {
  bookings = [];
};