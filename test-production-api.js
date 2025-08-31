// Test production APIs after deployment
const testBooking = {
  propertyType: "semi-3",
  frequency: "4weekly",
  additionalServices: [],
  fullName: "Production Test User",
  email: `test-${Date.now()}@example.com`,
  phone: "07700123456",
  address: "123 Test Street",
  city: "Street",
  postcode: "BA16 0HW",
  contactMethod: "email",
  notes: "Production test after fix"
};

console.log('🚀 Testing Production APIs...\n');

// Test Booking API
console.log('1️⃣ Testing Booking API:');
fetch('https://website-swc.vercel.app/api/bookings/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testBooking)
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('✅ Booking API working!');
    console.log(`   Booking ID: ${data.bookingId}`);
    console.log(`   Message: ${data.message}`);
  } else {
    console.log('❌ Booking API error:', data.error);
  }
})
.catch(err => console.error('❌ Network error:', err.message));

// Test Contact API
console.log('\n2️⃣ Testing Contact API:');
const testContact = {
  name: "Production Test Contact",
  email: `contact-${Date.now()}@example.com`,
  phone: "07700123456",
  subject: "Test Subject",
  message: "Production contact test after fix"
};

fetch('https://website-swc.vercel.app/api/contact/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testContact)
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('✅ Contact API working!');
    console.log(`   Message: ${data.message}`);
  } else {
    console.log('❌ Contact API error:', data.error);
  }
})
.catch(err => console.error('❌ Network error:', err.message));