import Foundation
import Supabase

@MainActor
class AdminReservationService: ObservableObject {
    static let shared = AdminReservationService()
    
    @Published var adminReservations: [AdminReservation] = []
    @Published var isLoading = false
    @Published var errorMessage: String? = nil
    
    private let supabase = SupabaseManager.shared.client
    
    private init() {}
    
    func fetchAdminReservations() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let response: [Booking] = try await supabase
                .from("bookings")
                .select()
                .eq("name", value: "ADMIN_RESERVATION")
                .eq("email", value: "admin@niyat.com")
                .eq("phone", value: "ADMIN")
                .order("booked_at", ascending: false)
                .execute()
                .value
            
            adminReservations = response.compactMap { booking in
                AdminReservation(
                    id: booking.id,
                    name: booking.name,
                    email: booking.email,
                    phone: booking.phone,
                    date: booking.date,
                    startTime: booking.startTime,
                    duration: booking.duration,
                    totalAmount: booking.totalAmount,
                    originalAmount: booking.originalAmount,
                    discountAmount: booking.discountAmount,
                    couponCode: booking.couponCode,
                    status: booking.status,
                    paymentId: booking.paymentId,
                    razorpayOrderId: booking.razorpayOrderId,
                    bookedAt: booking.bookedAt
                )
            }
        } catch {
            errorMessage = "Failed to fetch admin reservations: \(error.localizedDescription)"
            print("Error fetching admin reservations: \(error)")
        }
        
        isLoading = false
    }
    
    func deleteReservation(_ reservation: AdminReservation) async {
        do {
            try await supabase
                .from("bookings")
                .delete()
                .eq("id", value: reservation.id)
                .execute()
            
            adminReservations.removeAll { $0.id == reservation.id }
        } catch {
            errorMessage = "Failed to delete reservation: \(error.localizedDescription)"
            print("Error deleting reservation: \(error)")
        }
    }
    
    func refreshReservations() async {
        await fetchAdminReservations()
    }
}

extension AdminReservation {
    init(id: String, name: String, email: String, phone: String, date: String, startTime: String, duration: Int, totalAmount: Int, originalAmount: Int?, discountAmount: Int, couponCode: String?, status: String, paymentId: String?, razorpayOrderId: String?, bookedAt: String?) {
        self.id = id
        self.name = name
        self.email = email
        self.phone = phone
        self.date = date
        self.startTime = startTime
        self.duration = duration
        self.totalAmount = totalAmount
        self.originalAmount = originalAmount
        self.discountAmount = discountAmount
        self.couponCode = couponCode
        self.status = status
        self.paymentId = paymentId
        self.razorpayOrderId = razorpayOrderId
        self.bookedAt = bookedAt
    }
}