# Iron & Clean Pro - Ironing Business Management App

A React-based web application for managing ironing and cleaning business operations. Track jobs, clients, earnings, and generate reports for your service business.

## Features

### 🏠 Dashboard
- Overview of total earnings, completed jobs, pending jobs, and monthly revenue
- Recent jobs list with quick access to job details
- Clean, professional interface matching the provided design mockups

### ➕ Add New Job
- Comprehensive job creation form
- Client information capture
- Multiple items per job with individual pricing
- Auto-generated invoice numbers
- Service type selection (Ironing, Cleaning, Both)
- Status tracking (Completed, Pending, In Progress)
- Notes and additional information

### 📋 All Jobs
- Complete list of all jobs with filtering and sorting
- Filter by job status
- Sort by date, client name, or amount
- Detailed view of job items and pricing
- Responsive table design

### 📊 Reports & Analytics
- Business summary with key metrics
- Client analysis showing top customers
- Service breakdown and revenue distribution
- Monthly trends and performance tracking
- Flexible date range selection

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project files**
   ```bash
   # If you have the files, navigate to the project directory
   cd iron-clean-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Start both frontend and backend**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: `http://localhost:3000` (React app)
   - Backend API: `http://localhost:3001` (Database API)
   - The app will automatically open the frontend

## Usage Guide

### Adding a New Job
1. Click "Add Job" in the navigation or "Add New Job" button on dashboard
2. Fill in client information and job details
3. Add items with descriptions, quantities, and prices
4. Totals are calculated automatically
5. Add optional notes
6. Save the job

### Viewing Jobs
- **Dashboard**: Shows recent jobs and key statistics
- **All Jobs**: Complete list with filtering and sorting options
- Use filters to find specific jobs by status
- Sort by date, client, or amount

### Generating Reports
1. Navigate to Reports section
2. Select date range (This Month, Last Month, This Year, All Time)
3. Choose report type (Summary, Clients, Services, Monthly Trends)
4. View detailed analytics and statistics

## Data Storage

**🗄️ PostgreSQL Database Integration:**
- **Production-ready** database backend
- **Real-time data persistence** - all jobs saved permanently
- **Automatic field mapping** - works with existing database structures
- **Secure authentication** with JWT tokens
- **Scalable architecture** ready for business growth

See `EXISTING_DATABASE_SETUP.md` for detailed database setup instructions.

## Customization

### Adding New Service Types
Edit the `serviceType` options in `src/components/AddJob.js`:
```javascript
<option value="Ironing">Ironing</option>
<option value="Cleaning">Cleaning</option>
<option value="Both">Both</option>
// Add new options here
```

### Modifying Invoice Number Format
Update the invoice number generation in `src/App.js`:
```javascript
invoiceNumber: `2025-${String(jobs.length + 1).padStart(4, '0')}`
```

### Styling Changes
- Main styles: `src/index.css`
- Component-specific styles: `src/components/*.css`
- Colors and theme can be adjusted in CSS files

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

**App won't start:**
- Ensure Node.js is installed (`node --version`)
- Delete `node_modules` and run `npm install` again
- Check that port 3000 is available

**Styling issues:**
- Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache
- Check console for any CSS loading errors

**Navigation not working:**
- Ensure React Router is properly installed
- Check browser console for JavaScript errors

## Future Enhancements

- Backend API integration
- PDF invoice generation
- Email notifications
- Calendar integration
- Mobile app version
- Advanced reporting with charts
- Customer management system
- Inventory tracking for supplies

## Support

For technical support or feature requests, please refer to your development team or create an issue in your project management system.