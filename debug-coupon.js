// Debug script to test the exact scenario from the screenshot
const debugCouponValidation = async () => {
  console.log('🔍 DEBUGGING COUPON VALIDATION - EXACT SCENARIO FROM SCREENSHOT\n');

  // Test GAURAV-NIYAT with ₹1,150 (1 hour booking) - exactly like in the screenshot
  const testCases = [
    {
      code: 'GAURAV-NIYAT',
      amount: 1150,
      description: '1-hour booking (₹1,150) - from screenshot'
    },
    {
      code: 'GAURAV-NIYAT', 
      amount: 1150,
      description: 'Test with trimmed code'
    }
  ];

  for (const test of testCases) {
    console.log(`\n📋 Testing: ${test.description}`);
    console.log(`   Code: "${test.code}"`);
    console.log(`   Amount: ${test.amount}`);

    try {
      // Test direct backend first
      console.log('\n🔗 Testing DIRECT backend call:');
      const backendResponse = await fetch('http://localhost:5001/api/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: test.code.trim(),
          amount: test.amount
        }),
      });

      console.log(`   Status: ${backendResponse.status} ${backendResponse.statusText}`);
      const backendData = await backendResponse.json();
      console.log(`   Response:`, JSON.stringify(backendData, null, 2));

      // Test frontend proxy
      console.log('\n🌐 Testing FRONTEND proxy call:');
      const frontendResponse = await fetch('http://localhost:5173/api/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: test.code.trim(),
          amount: test.amount
        }),
      });

      console.log(`   Status: ${frontendResponse.status} ${frontendResponse.statusText}`);
      const frontendData = await frontendResponse.json();
      console.log(`   Response:`, JSON.stringify(frontendData, null, 2));

      // Compare responses
      if (JSON.stringify(backendData) === JSON.stringify(frontendData)) {
        console.log('   ✅ Backend and frontend responses MATCH');
      } else {
        console.log('   ❌ Backend and frontend responses DIFFER');
        console.log('   🔍 This indicates a proxy issue');
      }

    } catch (error) {
      console.log(`   🚨 ERROR: ${error.message}`);
      console.log(`   🔍 Stack trace:`, error.stack);
    }
  }

  console.log('\n🔍 CHECKING DATABASE COUPONS:');
  try {
    const response = await fetch('http://localhost:5001/admin/coupons');
    const data = await response.json();
    console.log('📊 Available coupons in database:');
    data.coupons.forEach(coupon => {
      console.log(`   🎟️  ${coupon.code}: ${coupon.discountValue}% off, min ₹${coupon.minAmount}`);
      if (coupon.code === 'GAURAV-NIYAT') {
        console.log(`       ⭐ This should work for ₹1150 (min: ₹${coupon.minAmount})`);
      }
    });
  } catch (error) {
    console.log(`🚨 Database check failed: ${error.message}`);
  }

  console.log('\n🎯 DEBUGGING COMPLETE');
};

debugCouponValidation();