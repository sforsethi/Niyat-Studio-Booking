import SwiftUI

struct BookingRowView: View {
    let booking: Booking
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(booking.name)
                        .font(.headline)
                        .fontWeight(.semibold)
                    Text(booking.email)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text(booking.formattedAmount)
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    StatusBadge(status: booking.status)
                }
            }
            
            Divider()
            
            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Date")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(booking.formattedDate)
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("Time")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(booking.formattedStartTime) - \(booking.endTime)")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("Duration")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(booking.duration)h")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                Spacer()
            }
            
            if let couponCode = booking.couponCode {
                HStack {
                    Image(systemName: "tag.fill")
                        .foregroundColor(.green)
                        .font(.caption)
                    Text("Coupon: \(couponCode)")
                        .font(.caption)
                        .foregroundColor(.green)
                        .fontWeight(.medium)
                    Spacer()
                }
            }
            
            HStack {
                Text("Phone: \(booking.phone)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                if let bookedAt = booking.bookedAt {
                    Text("Booked: \(formatBookedAt(bookedAt))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
    
    private func formatBookedAt(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateStyle = .short
            displayFormatter.timeStyle = .short
            return displayFormatter.string(from: date)
        }
        return dateString
    }
}

struct StatusBadge: View {
    let status: String
    
    var badgeColor: Color {
        switch status.lowercased() {
        case "confirmed":
            return .green
        case "pending":
            return .orange
        case "cancelled":
            return .red
        default:
            return .gray
        }
    }
    
    var body: some View {
        Text(status.capitalized)
            .font(.caption)
            .fontWeight(.semibold)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(badgeColor.opacity(0.1))
            .foregroundColor(badgeColor)
            .clipShape(Capsule())
    }
}

#Preview {
    BookingRowView(booking: Booking(
        id: "NIYAT1698765432000",
        name: "John Doe",
        email: "john@example.com",
        phone: "+91 9876543210",
        date: "2024-02-15",
        startTime: "14:00",
        duration: 2,
        totalAmount: 250000,
        originalAmount: 300000,
        discountAmount: 5000,
        couponCode: "SAVE10",
        status: "confirmed",
        paymentId: "pay_123456789",
        razorpayOrderId: "order_123456789",
        bookedAt: "2024-02-10T10:30:00.000Z"
    ))
    .padding()
}