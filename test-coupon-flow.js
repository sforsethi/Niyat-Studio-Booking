// End-to-end coupon testing script
const testCouponValidation = async () => {
  const baseURL = 'http://localhost:5001';
  
  console.log('🧪 Starting End-to-End Coupon Testing...\n');

  // Test cases
  const testCases = [
    { code: 'STUDIO15', amount: 2300, expected: 'valid' },
    { code: 'STUDIO15', amount: 500, expected: 'invalid_min' },
    { code: 'DISCOUNT15', amount: 1150, expected: 'valid' },
    { code: 'GAURAV-NIYAT', amount: 1000, expected: 'valid' },
    { code: 'INVALID123', amount: 2000, expected: 'invalid_code' }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.code} with amount ₹${testCase.amount}`);
    
    try {
      const response = await fetch(`${baseURL}/api/validate-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: testCase.code,
          amount: testCase.amount
        }),
      });

      const data = await response.json();
      
      if (testCase.expected === 'valid' && data.valid) {
        console.log(`✅ PASS - Coupon valid, discount: ₹${data.discountAmount}, final: ₹${data.finalAmount}`);
      } else if (testCase.expected.startsWith('invalid') && !data.valid) {
        console.log(`✅ PASS - Correctly rejected: ${data.error}`);
      } else {
        console.log(`❌ FAIL - Expected ${testCase.expected}, got:`, data);
      }
    } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
    }
  }

  console.log('\n🎯 Testing admin/bookings endpoint...');
  try {
    const response = await fetch(`${baseURL}/admin/bookings`);
    const data = await response.json();
    console.log(`✅ Admin endpoint working - Found ${data.total || 0} bookings`);
  } catch (error) {
    console.log(`❌ Admin endpoint error: ${error.message}`);
  }

  console.log('\n🎯 Testing availability endpoint...');
  try {
    const testDate = '2025-07-10';
    const response = await fetch(`${baseURL}/api/availability/${testDate}`);
    const data = await response.json();
    console.log(`✅ Availability endpoint working - Found ${data.availableSlots?.length || 0} slots for ${testDate}`);
  } catch (error) {
    console.log(`❌ Availability endpoint error: ${error.message}`);
  }

  console.log('\n🎉 Testing complete!');
};

// Run the tests
testCouponValidation();