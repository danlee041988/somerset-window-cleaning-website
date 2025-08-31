// Script to submit test bookings through the public booking form
// This bypasses RLS policies by using the same method as the public form

const BASE_URL = 'http://localhost:4321';

async function submitTestBooking(bookingData: any) {
  try {
    const response = await fetch(`${BASE_URL}/api/booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting booking:', error);
    return null;
  }
}

async function createTestBookings() {
  console.log('Creating test bookings through the public API...\n');

  const testBookings = [
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '07700900001',
      address: '23 High Street',
      postcode: 'BA16 0HW',
      propertyType: 'semi-detached',
      bedrooms: '3 Bed',
      frequency: '4-weekly',
      totalPrice: 25.00,
      addons: {},
      preferredDay: 'weekday',
      specialRequests: ''
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@example.com',
      phone: '07700900002',
      address: '45 Queens Road',
      postcode: 'TA8 1BQ',
      propertyType: 'detached',
      bedrooms: '4 Bed',
      frequency: 'monthly',
      totalPrice: 35.00,
      addons: { conservatory: { selected: true, price: 10 } },
      preferredDay: 'any',
      specialRequests: 'Please use the side gate'
    },
    {
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'mike.brown@example.com',
      phone: '07700900003',
      address: '12 Victoria Avenue',
      postcode: 'BA16 0LD',
      propertyType: 'terraced',
      bedrooms: '2 Bed',
      frequency: '4-weekly',
      totalPrice: 20.00,
      addons: {},
      preferredDay: 'thursday',
      specialRequests: 'Call before arrival'
    },
    {
      firstName: 'Emma',
      lastName: 'Wilson',
      email: 'emma.wilson@example.com',
      phone: '07700900004',
      address: '78 Park Lane',
      postcode: 'TA9 3HP',
      propertyType: 'detached',
      bedrooms: '5 Bed+',
      frequency: '4-weekly',
      totalPrice: 40.00,
      addons: { conservatory: { selected: true, price: 10 } },
      preferredDay: 'weekday',
      specialRequests: 'Large property with outbuildings'
    }
  ];

  for (const booking of testBookings) {
    console.log(`Submitting booking for ${booking.firstName} ${booking.lastName}...`);
    const result = await submitTestBooking(booking);
    
    if (result && result.success) {
      console.log(`✓ Booking created successfully`);
    } else {
      console.log(`✗ Failed to create booking`);
    }
    
    // Small delay between submissions
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n---');
  console.log('Test bookings submission complete!');
  console.log('\nYou can now view them in the staff portal:');
  console.log('1. Go to http://localhost:4321/staff/login');
  console.log('2. Click "Login to Dashboard" (no password needed)');
  console.log('3. View and manage the test bookings');
  console.log('\nTo test the workflow:');
  console.log('- Move bookings between columns by clicking status buttons');
  console.log('- Click on a booking card to view full details');
  console.log('- Add internal notes');
  console.log('- Use "Copy" button to get Squeegee-formatted text');
  console.log('- Use "Done" to archive completed bookings');
}

// Run the script
createTestBookings().catch(console.error);