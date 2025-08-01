import Foundation

struct AdminReservation: Codable, Identifiable {
    let id: String
    let name: String
    let email: String
    let phone: String
    let date: String
    let startTime: String
    let duration: Int
    let totalAmount: Int
    let originalAmount: Int?
    let discountAmount: Int
    let couponCode: String?
    let status: String
    let paymentId: String?
    let razorpayOrderId: String?
    let bookedAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case email
        case phone
        case date
        case startTime = "start_time"
        case duration
        case totalAmount = "total_amount"
        case originalAmount = "original_amount"
        case discountAmount = "discount_amount"
        case couponCode = "coupon_code"
        case status
        case paymentId = "payment_id"
        case razorpayOrderId = "razorpay_order_id"
        case bookedAt = "booked_at"
    }
    
    init(date: String, startTime: String, duration: Int, reason: String = "Admin Block") {
        self.id = "ADMIN\(Int(Date().timeIntervalSince1970 * 1000))"
        self.name = "ADMIN_RESERVATION"
        self.email = "admin@niyat.com"
        self.phone = "ADMIN"
        self.date = date
        self.startTime = startTime
        self.duration = duration
        self.totalAmount = 0
        self.originalAmount = 0
        self.discountAmount = 0
        self.couponCode = reason
        self.status = "confirmed"
        self.paymentId = nil
        self.razorpayOrderId = nil
        self.bookedAt = ISO8601DateFormatter().string(from: Date())
    }
    
    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        if let date = formatter.date(from: date) {
            formatter.dateStyle = .medium
            return formatter.string(from: date)
        }
        return date
    }
    
    var formattedStartTime: String {
        return formatTime(startTime)
    }
    
    var endTime: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        if let startDate = formatter.date(from: startTime) {
            let endDate = Calendar.current.date(byAdding: .hour, value: duration, to: startDate)
            let endTimeString = formatter.string(from: endDate ?? startDate)
            return formatTime(endTimeString)
        }
        return formatTime(startTime)
    }
    
    private func formatTime(_ timeString: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        
        if let date = formatter.date(from: timeString) {
            let components = Calendar.current.dateComponents([.hour, .minute], from: date)
            let hour = components.hour ?? 0
            let minute = components.minute ?? 0
            
            let ampm = hour < 12 ? "am" : "pm"
            let displayHour = hour == 0 ? 12 : (hour > 12 ? hour - 12 : hour)
            
            if minute == 0 {
                return "\(displayHour)\(ampm)"
            } else {
                return "\(displayHour):\(String(format: "%02d", minute))\(ampm)"
            }
        }
        return timeString
    }
    
    var reason: String {
        return couponCode ?? "Admin Block"
    }
    
    static func isAdminReservation(_ booking: Booking) -> Bool {
        return booking.name == "ADMIN_RESERVATION" && 
               booking.email == "admin@niyat.com" && 
               booking.phone == "ADMIN"
    }
}