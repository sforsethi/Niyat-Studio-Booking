//
//  ContentView.swift
//  NIYAT
//
//  Created by Raghav Sethi on 01/08/25.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            BookingsListView()
                .tabItem {
                    Image(systemName: "calendar")
                    Text("Bookings")
                }
            
            AdminReservationsView()
                .tabItem {
                    Image(systemName: "lock.fill")
                    Text("Blocked Times")
                }
        }
    }
}

struct BookingsListView: View {
    @StateObject private var viewModel = BookingsViewModel()
    
    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading bookings...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = viewModel.errorMessage {
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
                                await viewModel.fetchBookings()
                            }
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .padding()
                } else if viewModel.bookings.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "calendar.badge.exclamationmark")
                            .foregroundColor(.gray)
                            .font(.largeTitle)
                        Text("No Bookings")
                            .font(.title2)
                            .fontWeight(.semibold)
                        Text("No bookings have been made yet.")
                            .foregroundColor(.secondary)
                    }
                    .padding()
                } else {
                    List(viewModel.bookings) { booking in
                        BookingRowView(booking: booking)
                    }
                    .refreshable {
                        await viewModel.refreshBookings()
                    }
                }
            }
            .navigationTitle("Studio Bookings")
            .navigationBarTitleDisplayMode(.large)
            .task {
                await viewModel.fetchBookings()
            }
        }
    }
}

#Preview {
    ContentView()
}
