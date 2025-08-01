import Foundation
import Supabase

class SupabaseManager: ObservableObject {
    static let shared = SupabaseManager()
    
    let client: SupabaseClient
    
    private init() {
        let url = URL(string: "https://nzpreqgasitmuqwnjoga.supabase.co")!
        let key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cHJlcWdhc2l0bXVxd25qb2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NTgwMDEsImV4cCI6MjA2OTUzNDAwMX0.ZnCdsf1JNqnHUafXanohUhxbtRoc2E4Fyx9965IN1eg"
        
        self.client = SupabaseClient(supabaseURL: url, supabaseKey: key)
    }
}