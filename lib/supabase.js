import { createClient } from '@supabase/supabase-js';

// For client-side (browser) usage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// For server-side (API routes) usage
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create client for browser/frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create client for server/backend with elevated privileges
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper functions for bookings
export const bookingHelpers = {
  async saveBooking(booking) {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert([{
        ...booking,
        date: booking.date.split(',')[0], // Extract just the date part
        start_time: booking.startTime,
        total_amount: booking.totalAmount,
        original_amount: booking.originalAmount,
        discount_amount: booking.discountAmount || 0,
        coupon_code: booking.couponCode,
        payment_id: booking.paymentId,
        razorpay_order_id: booking.razorpayOrderId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getBookings() {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .order('booked_at', { ascending: false });

    if (error) throw error;
    
    // Transform data to match existing format
    return data.map(booking => ({
      id: booking.id,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      date: booking.date,
      startTime: booking.start_time,
      duration: booking.duration,
      totalAmount: booking.total_amount,
      originalAmount: booking.original_amount,
      discountAmount: booking.discount_amount,
      couponCode: booking.coupon_code,
      status: booking.status,
      paymentId: booking.payment_id,
      bookedAt: booking.booked_at
    }));
  },

  async getBookingById(id) {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};