import SwiftUI

struct AdminReservationsView: View {
    @StateObject private var reservationService = AdminReservationService.shared
    @State private var showingCreateReservation = false
    
    var body: some View {
        NavigationView {
            Group {
                if reservationService.isLoading {
                    ProgressView("Loading reservations...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = reservationService.errorMessage {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .foregroundColor(.orange)
                            .font(.largeTitle)
                        Text("Error")
                            .font(.title2)
                            .fontWeight(.semibold)
                        Text(errorMessage)
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                        Button("Retry") {
                            Task {
                                await reservationService.fetchAdminReservations()
                            }
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                } else if reservationService.adminReservations.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "calendar.badge.clock")
                            .foregroundColor(.gray)
                            .font(.largeTitle)
                        Text("No Blocked Times")
                            .font(.title2)
                            .fontWeight(.semibold)
                        Text("You haven't blocked any time slots yet.")
                            .foregroundColor(.secondary)
                        
                        Button("Block Time Slot") {
                            showingCreateReservation = true
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                } else {
                    List {
                        ForEach(reservationService.adminReservations) { reservation in
                            AdminReservationRowView(reservation: reservation) {
                                Task {
                                    await reservationService.deleteReservation(reservation)
                                }
                            }
                        }
                    }
                    .refreshable {
                        await reservationService.refreshReservations()
                    }
                }
            }
            .navigationTitle("Blocked Times")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingCreateReservation = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingCreateReservation) {
                CreateReservationView()
                    .onDisappear {
                        Task {
                            await reservationService.refreshReservations()
                        }
                    }
            }
            .task {
                await reservationService.fetchAdminReservations()
            }
        }
    }
}

struct AdminReservationRowView: View {
    let reservation: AdminReservation
    let onDelete: () -> Void
    
    @State private var showingDeleteAlert = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(reservation.reason)
                        .font(.headline)
                        .fontWeight(.semibold)
                    Text("Admin Block")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text("BLOCKED")
                        .font(.caption)
                        .fontWeight(.bold)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.red.opacity(0.1))
                        .foregroundColor(.red)
                        .clipShape(Capsule())
                    
                    Button("Delete") {
                        showingDeleteAlert = true
                    }
                    .font(.caption)
                    .foregroundColor(.red)
                }
            }
            
            Divider()
            
            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Date")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(reservation.formattedDate)
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("Time")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(reservation.formattedStartTime) - \(reservation.endTime)")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("Duration")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(reservation.duration)h")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                Spacer()
            }
            
            if let bookedAt = reservation.bookedAt {
                HStack {
                    Text("Created: \(formatBookedAt(bookedAt))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                }
            }
        }
        .padding(.vertical, 4)
        .alert("Delete Block", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                onDelete()
            }
        } message: {
            Text("Are you sure you want to remove this time block? This slot will become available for booking.")
        }
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

#Preview {
    AdminReservationsView()
}