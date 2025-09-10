// Demo script to show what test bookings would look like
// Since we can't insert directly due to RLS, this shows the structure

const demoBookings = [
  {
    customer: {
      name: "John Smith",
      email: "john.smith@example.com", 
      phone: "07700900001",
      address: "23 High Street, Burnham-on-Sea",
      postcode: "BA16 0HW",
      propertyType: "3 Bed Semi-Detached"
    },
    booking: {
      status: "new",
      price: "£25.00",
      frequency: "4-weekly",
      notes: "New customer - awaiting initial contact"
    }
  },
  {
    customer: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "07700900002", 
      address: "45 Queens Road, Burnham-on-Sea",
      postcode: "TA8 1BQ",
      propertyType: "4 Bed Detached"
    },
    booking: {
      status: "new",
      price: "£35.00",
      frequency: "Monthly",
      notes: "Has conservatory - quoted extra £10"
    }
  },
  {
    customer: {
      name: "Michael Brown",
      email: "mike.brown@example.com",
      phone: "07700900003",
      address: "12 Victoria Avenue, Highbridge", 
      postcode: "BA16 0LD",
      propertyType: "2 Bed Terraced"
    },
    booking: {
      status: "contacted",
      price: "£20.00",
      frequency: "4-weekly",
      notes: "Spoke to customer, wants service every 4 weeks. Prefers Thursdays."
    }
  },
  {
    customer: {
      name: "Emma Wilson",
      email: "emma.wilson@example.com",
      phone: "07700900004",
      address: "78 Park Lane, Bridgwater",
      postcode: "TA9 3HP", 
      propertyType: "5 Bed Detached"
    },
    booking: {
      status: "contacted",
      price: "£40.00",
      frequency: "4-weekly",
      notes: "Large property with conservatory. Quoted £40 including conservatory roof."
    }
  },
  {
    customer: {
      name: "David Taylor",
      email: "david.t@example.com",
      phone: "07700900005",
      address: "34 Church Street, Glastonbury",
      postcode: "BA6 8QB",
      propertyType: "3 Bed Semi-Detached"
    },
    booking: {
      status: "quoted",
      price: "£28.00", 
      frequency: "Monthly",
      notes: "Customer accepted quote. Wants to start next month. Has 2 dogs - gate code 1234."
    }
  },
  {
    customer: {
      name: "Lucy Davis",
      email: "lucy.davis@example.com",
      phone: "07700900006",
      address: "56 Station Road, Weston-super-Mare",
      postcode: "BS25 1HD",
      propertyType: "2nd Floor Flat"
    },
    booking: {
      status: "quoted",
      price: "£18.00",
      frequency: "Monthly",
      notes: "2nd floor flat, needs ladder access from rear. Monthly service."
    }
  },
  {
    customer: {
      name: "James Miller", 
      email: "james.m@example.com",
      phone: "07700900007",
      address: "90 Somerset Way, Wells",
      postcode: "BA5 1PX",
      propertyType: "Bungalow"
    },
    booking: {
      status: "ready",
      price: "£30.00",
      frequency: "4-weekly", 
      notes: "Bungalow with easy access. Customer usually home. Includes garage windows."
    }
  },
  {
    customer: {
      name: "Sophie Anderson",
      email: "sophie.a@example.com", 
      phone: "07700900008",
      address: "15 Market Street, Frome",
      postcode: "BA11 1BB",
      propertyType: "2 Bed Terraced"
    },
    booking: {
      status: "ready",
      price: "£22.00",
      frequency: "6-weekly",
      notes: "Small terraced house. Park on Market Street. 6-weekly service requested."
    }
  }
];

console.log('Demo Bookings for Staff Portal\n');
console.log('Since we cannot insert test data directly due to database security,');
console.log('here\'s what the test bookings would look like:\n');

// Group by status
const byStatus = {
  new: demoBookings.filter(b => b.booking.status === 'new'),
  contacted: demoBookings.filter(b => b.booking.status === 'contacted'),
  quoted: demoBookings.filter(b => b.booking.status === 'quoted'),
  ready: demoBookings.filter(b => b.booking.status === 'ready')
};

Object.entries(byStatus).forEach(([status, bookings]) => {
  console.log(`\n${status.toUpperCase()} (${bookings.length})`);
  console.log('='.repeat(40));
  
  bookings.forEach(booking => {
    console.log(`\n${booking.customer.name}`);
    console.log(`📍 ${booking.customer.postcode} - ${booking.customer.propertyType}`);
    console.log(`💷 ${booking.booking.price} - ${booking.booking.frequency}`);
    console.log(`📝 ${booking.booking.notes}`);
  });
});

console.log('\n\nTo see the staff portal in action:');
console.log('1. Go to http://localhost:4321/booking-2step');
console.log('2. Submit a real test booking through the form');
console.log('3. Then visit http://localhost:4321/staff/login');
console.log('4. Click "Login to Dashboard" (no password required)');
console.log('5. You\'ll see your booking in the "New" column');
console.log('\nOr, if you have access to the Supabase dashboard:');
console.log('- Insert test data directly into the customers and bookings tables');