// Simulate exactly what the UI does when applying a coupon
const testUISimulation = async () => {
  console.log('🎭 SIMULATING EXACT UI COUPON APPLICATION\n');

  // Step 1: User enters coupon code and amount
  const testScenarios = [
    { code: 'STUDIO15', amount: 2300, description: '2-hour booking' },
    { code: 'DISCOUNT15', amount: 1150, description: '1-hour booking' },
    { code: 'GAURAV-NIYAT', amount: 1150, description: '1-hour booking' },
    { code: 'INVALID', amount: 2300, description: 'Invalid coupon test' },
    { code: 'STUDIO15', amount: 500, description: 'Below minimum amount' }
  ];

  for (const scenario of testScenarios) {
    console.log(`\n🧪 Testing: ${scenario.code} for ${scenario.description} (₹${scenario.amount})`);
    
    try {
      // This is EXACTLY what the frontend PaymentModal.tsx does
      const response = await fetch('http://localhost:5173/api/validate-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: scenario.code.trim(),
          amount: scenario.amount
        }),
      });

      console.log(`   📡 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`   📊 Response data:`, JSON.stringify(data, null, 2));

      if (data.valid) {
        console.log(`   ✅ SUCCESS: Coupon valid, discount: ₹${data.discountAmount}, final: ₹${data.finalAmount}`);
      } else {
        console.log(`   ❌ REJECTED: ${data.error}`);
      }

    } catch (error) {
      console.log(`   🚨 ERROR: ${error.message}`);
      console.log(`   🔍 This is the exact error the UI would show: "Failed to validate coupon: ${error.message}"`);
    }
  }

  console.log('\n🔍 CHECKING FRONTEND PROXY CONFIGURATION...');
  
  // Check if Vite proxy is working
  try {
    const directBackend = await fetch('http://localhost:5001/api/validate-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'STUDIO15', amount: 2300 }),
    });
    const directData = await directBackend.json();
    console.log('✅ Direct backend call works:', directData.valid);
  } catch (error) {
    console.log('❌ Direct backend call failed:', error.message);
  }

  try {
    const proxyCall = await fetch('http://localhost:5173/api/validate-coupon', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'STUDIO15', amount: 2300 }),
    });
    const proxyData = await proxyCall.json();
    console.log('✅ Frontend proxy call works:', proxyData.valid);
  } catch (error) {
    console.log('❌ Frontend proxy call failed:', error.message);
  }

  console.log('\n🎬 UI SIMULATION COMPLETE!');
};

testUISimulation();