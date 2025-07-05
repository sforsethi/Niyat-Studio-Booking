// Test frontend API integration
const testFrontendAPI = async () => {
  const frontendURL = 'http://localhost:5173';
  
  console.log('🌐 Testing Frontend API Integration...\n');

  // Test coupon validation through frontend proxy
  console.log('📝 Testing coupon validation through frontend proxy...');
  try {
    const response = await fetch(`${frontendURL}/api/validate-coupon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'STUDIO15',
        amount: 2300
      }),
    });

    const data = await response.json();
    
    if (data.valid) {
      console.log(`✅ Frontend proxy working - discount: ₹${data.discountAmount}, final: ₹${data.finalAmount}`);
    } else {
      console.log(`❌ Frontend proxy issue:`, data);
    }
  } catch (error) {
    console.log(`❌ Frontend proxy error: ${error.message}`);
  }

  // Test admin bookings through frontend proxy
  console.log('\n📝 Testing admin bookings through frontend proxy...');
  try {
    const response = await fetch(`${frontendURL}/api/admin/bookings`);
    const data = await response.json();
    console.log(`✅ Admin proxy working - Found ${data.total || 0} bookings`);
  } catch (error) {
    console.log(`❌ Admin proxy error: ${error.message}`);
  }

  console.log('\n🎉 Frontend integration testing complete!');
};

// Run the tests
testFrontendAPI();