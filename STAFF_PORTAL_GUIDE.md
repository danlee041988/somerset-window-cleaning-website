# Somerset Window Cleaning - Staff Portal Guide

## Access Instructions

### Login URL
- Go to: `https://your-website.com/staff/login`
- **TEMPORARY**: No password required - just click "Login to Dashboard"

### Important Security Note
**Password authentication is temporarily disabled for testing!**

Before going live:
1. Install bcryptjs: `npm install bcryptjs @types/bcryptjs`
2. Re-enable password verification in `/src/pages/api/staff/auth.ts`
3. Add password field back to login form in `/src/pages/staff/login.astro`
4. Set a secure password hash

## Using the Booking Tracker

### Main Dashboard (`/staff/bookings`)

The dashboard shows bookings in 4 columns:
1. **New** (Red) - Fresh inquiries that need contacting
2. **Contacted** (Amber) - Customers you've reached out to
3. **Quoted** (Blue) - Customers who received a quote
4. **Ready for Squeegee** (Green) - Confirmed bookings ready to enter

### Key Features

#### 1. Search
- Use the search bar to find bookings by name, postcode, or phone number

#### 2. Status Updates
- Click the status buttons to move bookings between stages:
  - **Contact** → Moves from New to Contacted
  - **Quote** → Moves from Contacted to Quoted  
  - **Ready** → Moves from Quoted to Ready for Squeegee

#### 3. View Details
- Click on any booking card to see full customer information
- Add internal notes in the modal that appears
- Notes are saved automatically when you click "Save Notes"

#### 4. Copy for Squeegee
- Click the **Copy** button on Ready bookings
- This copies formatted customer details to your clipboard:
  ```
  Jane Smith
  07123 456789
  4 bed Semi-Detached
  123 High Street, Bridgwater TA6 3AB
  Services: Window Cleaning (4-weekly)
  Price: £30
  Notes: Side gate access
  ```
- Paste directly into Squeegee app

#### 5. Mark as Done
- Click **Done** to archive completed bookings
- This removes them from the active view

### Mobile Usage

The portal is fully mobile-responsive:
- Cards stack vertically on phones
- Tap to view details
- All buttons are touch-friendly
- Phone numbers are clickable for direct calling

## Database Setup Required

Before using the portal, run the SQL migration:

1. Go to your Supabase dashboard
2. Open SQL Editor
3. Run the contents of `update_bookings_table.sql`
4. This adds the necessary columns and views

## Workflow Example

1. **New booking comes in** → Appears in "New" column
2. **Call customer** → Click "Contact" button
3. **Provide quote** → Click "Quote" button, add price in notes
4. **Customer accepts** → Click "Ready" button
5. **Enter in Squeegee** → Click "Copy", paste into Squeegee app
6. **All done** → Click "Done" to archive

## Troubleshooting

### Can't Login?
- Check you're using the correct URL: `/staff/login`
- Verify the password is correct
- Clear browser cookies and try again

### Bookings Not Showing?
- Check Supabase is configured in `.env`
- Verify database migration was run
- Check browser console for errors

### Copy Button Not Working?
- Ensure you're using HTTPS (required for clipboard API)
- Try a different browser if issues persist

## Future Enhancements

Potential improvements for Phase 2:
- Individual staff accounts
- Email/SMS notifications
- Advanced reporting
- Calendar integration
- Route optimization

---

**Support**: Contact Dan if you encounter any issues with the portal.