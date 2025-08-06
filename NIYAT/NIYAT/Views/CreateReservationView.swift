import SwiftUI

struct CreateReservationView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = CreateReservationViewModel()
    
    @State private var selectedDate = Date()
    @State private var selectedTime = Date()
    @State private var duration = 2
    @State private var reason = ""
    
    private let timeFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter
    }()
    
    private let availableDurations = [1, 2, 3, 4, 5, 6, 7, 8]
    private let commonReasons = ["Personal Use", "Maintenance", "Equipment Setup", "Private Session", "Studio Break"]
    
    var body: some View {
        NavigationView {
            Form {
                Section("Date & Time") {
                    DatePicker("Date", selection: $selectedDate, displayedComponents: .date)
                        .datePickerStyle(.compact)
                    
                    DatePicker("Start Time", selection: $selectedTime, displayedComponents: .hourAndMinute)
                        .datePickerStyle(.compact)
                    
                    HStack {
                        Text("Duration")
                        Spacer()
                        Picker("Duration", selection: $duration) {
                            ForEach(availableDurations, id: \.self) { hours in
                                Text("\(hours)h").tag(hours)
                            }
                        }
                        .pickerStyle(.menu)
                    }
                }
                
                Section("Reason") {
                    TextField("Enter reason for blocking", text: $reason)
                    
                    if !reason.isEmpty {
                        Text("Custom reason entered")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    } else {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Quick reasons:")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            LazyVGrid(columns: [
                                GridItem(.flexible()),
                                GridItem(.flexible())
                            ], spacing: 8) {
                                ForEach(commonReasons, id: \.self) { commonReason in
                                    Button(commonReason) {
                                        reason = commonReason
                                    }
                                    .font(.caption)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(Color.blue.opacity(0.1))
                                    .foregroundColor(.blue)
                                    .clipShape(Capsule())
                                }
                            }
                        }
                    }
                }
                
                Section("Preview") {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Image(systemName: "calendar")
                                .foregroundColor(.blue)
                            Text(selectedDate, style: .date)
                        }
                        
                        HStack {
                            Image(systemName: "clock")
                                .foregroundColor(.blue)
                            Text("\(timeFormatter.string(from: selectedTime)) - \(endTimeString)")
                        }
                        
                        HStack {
                            Image(systemName: "hourglass")
                                .foregroundColor(.blue)
                            Text("\(duration) hour\(duration == 1 ? "" : "s")")
                        }
                        
                        if !reason.isEmpty {
                            HStack {
                                Image(systemName: "note.text")
                                    .foregroundColor(.blue)
                                Text(reason)
                            }
                        }
                    }
                    .font(.subheadline)
                }
                
                if viewModel.isLoading {
                    Section {
                        HStack {
                            ProgressView()
                                .scaleEffect(0.8)
                            Text("Creating reservation...")
                        }
                    }
                }
                
                if let errorMessage = viewModel.errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("Block Time Slot")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        createReservation()
                    }
                    .disabled(viewModel.isLoading)
                }
            }
        }
    }
    
    private var endTimeString: String {
        let endTime = Calendar.current.date(byAdding: .hour, value: duration, to: selectedTime) ?? selectedTime
        return timeFormatter.string(from: endTime)
    }
    
    private func createReservation() {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let dateString = dateFormatter.string(from: selectedDate)
        
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "HH:mm"
        let timeString = timeFormatter.string(from: selectedTime)
        
        let reasonText = reason.isEmpty ? "Admin Block" : reason
        
        Task {
            await viewModel.createReservation(
                date: dateString,
                startTime: timeString,
                duration: duration,
                reason: reasonText
            )
            
            if viewModel.errorMessage == nil {
                dismiss()
            }
        }
    }
}

@MainActor
class CreateReservationViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String? = nil
    
    private let supabase = SupabaseManager.shared.client
    
    func createReservation(date: String, startTime: String, duration: Int, reason: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let reservation = AdminReservation(
                date: date,
                startTime: startTime,
                duration: duration,
                reason: reason
            )
            
            struct BookingInsert: Codable {
                let id: String
                let name: String
                let email: String
                let phone: String
                let date: String
                let start_time: String
                let duration: Int
                let total_amount: Int
                let original_amount: Int
                let discount_amount: Int
                let coupon_code: String?
                let status: String
                let payment_id: String?
                let razorpay_order_id: String?
                let booked_at: String?
            }
            
            let bookingData = BookingInsert(
                id: reservation.id,
                name: reservation.name,
                email: reservation.email,
                phone: reservation.phone,
                date: reservation.date,
                start_time: reservation.startTime,
                duration: reservation.duration,
                total_amount: reservation.totalAmount,
                original_amount: reservation.originalAmount ?? 0,
                discount_amount: reservation.discountAmount,
                coupon_code: reservation.couponCode,
                status: reservation.status,
                payment_id: reservation.paymentId,
                razorpay_order_id: reservation.razorpayOrderId,
                booked_at: reservation.bookedAt
            )
            
            try await supabase
                .from("bookings")
                .insert(bookingData)
                .execute()
            
        } catch {
            errorMessage = "Failed to create reservation: \(error.localizedDescription)"
            print("Error creating reservation: \(error)")
        }
        
        isLoading = false
    }
}

#Preview {
    CreateReservationView()
}
