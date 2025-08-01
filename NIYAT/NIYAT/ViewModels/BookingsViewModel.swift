import Foundation
import Supabase

@MainActor
class BookingsViewModel: ObservableObject {
    @Published var bookings: [Booking] = []
    @Published var isLoading = false
    @Published var errorMessage: String? = nil
    
    private let supabase = SupabaseManager.shared.client
    
    func fetchBookings() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let response: [Booking] = try await supabase
                .from("bookings")
                .select()
                .order("booked_at", ascending: false)
                .execute()
                .value
            
            // Filter out admin reservations to show only customer bookings
            bookings = response.filter { booking in
                !AdminReservation.isAdminReservation(booking)
            }
        } catch {
            errorMessage = "Failed to fetch bookings: \(error.localizedDescription)"
            print("Error fetching bookings: \(error)")
        }
        
        isLoading = false
    }
    
    func refreshBookings() async {
        await fetchBookings()
    }
}