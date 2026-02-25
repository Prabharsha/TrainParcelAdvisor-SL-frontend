# TrainParcelAdvisor SL - Railway Management System

A comprehensive web application for the Sri Lankan Railway Department to manage parcel delivery and ticket booking services.

## 🚀 Features

### Public Features
- **Home Page**: Overview of services with statistics
- **Parcel Booking**: Send parcels via train with automatic charge calculation
- **Ticket Booking**: Book train tickets with fare calculation
- **Tracking System**: Track parcels and tickets using tracking numbers
- **Station & Train Information**: View available stations and trains

### User Features
- **Authentication**: Secure login system with JWT tokens
- **Role-based Access**: Different dashboards for Admin, Station Master, and Customers
- **QR Code Generation**: Automatic QR codes for parcels and tickets
- **Email Notifications**: Booking confirmations sent via email

### Admin Features
- **Dashboard**: Comprehensive statistics and analytics
  - Total parcels, tickets, users, and revenue
  - Status breakdowns for parcels and tickets
  - System-wide metrics
- **Management**: CRUD operations for:
  - Parcels
  - Tickets
  - Trains
  - Stations
  - Users

### Station Master Features
- **Parcel Management**: 
  - View all parcels at the station
  - Update parcel status (Pending → In Transit → Delivered)
  - Filter by status
  - Real-time updates

## 🛠️ Technology Stack

- **Framework**: Next.js 16.1.6 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: React Hook Form + Zod
- **HTTP Client**: Axios with interceptors
- **UI Components**: React Icons, Sonner (toast notifications)
- **Backend**: Spring Boot API (http://localhost:8082)
- **Authentication**: JWT Bearer tokens

## 📁 Project Structure

```
Frontend/
├── app/
│   ├── admin/
│   │   └── dashboard/          # Admin dashboard
│   ├── station-master/
│   │   └── dashboard/          # Station master dashboard
│   ├── parcels/
│   │   └── book/               # Parcel booking form
│   ├── tickets/
│   │   └── book/               # Ticket booking form
│   ├── track/                  # Tracking page
│   ├── login/                  # Login page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/
│   ├── Navbar.tsx              # Navigation component
│   └── ProtectedRoute.tsx      # Route protection HOC
├── lib/
│   ├── api/
│   │   ├── client.ts           # Axios configuration
│   │   ├── auth.ts             # Authentication API
│   │   ├── parcel.ts           # Parcel API
│   │   ├── ticket.ts           # Ticket API
│   │   ├── admin.ts            # Admin API
│   │   ├── public.ts           # Public API
│   │   └── index.ts            # API exports
│   ├── types.ts                # TypeScript interfaces
│   ├── validations.ts          # Zod schemas
│   └── utils.ts                # Helper functions
├── middleware.ts               # Route middleware
└── tailwind.config.ts          # Tailwind configuration
```

## 🎨 Design System

### Color Palette
- **Railway Red**: `#8B0000` - Primary brand color
- **Railway Blue**: `#001F3F` - Secondary brand color
- **Railway Gold**: `#FFD700` - Accent color

### Components
- Custom buttons (`.btn-primary`, `.btn-secondary`, `.btn-outline`)
- Form inputs (`.input`)
- Cards (`.card`)
- Status badges (`.badge`)

## 🔐 Authentication

### Login Credentials (Test)
- **Admin**: `admin` / `Admin@123`
- **Station Master**: `stationmaster` / `Station@123`

### Roles
- `ADMIN`: Full system access
- `STATION_MASTER`: Parcel management at station level
- `CUSTOMER`: Book parcels and tickets

## 📡 API Integration

### Base URL
```
http://localhost:8082
```

### Key Endpoints
- `POST /auth/login` - User authentication
- `POST /parcels/calculate` - Calculate parcel charges
- `POST /parcels/book` - Book a parcel
- `GET /parcels/track/{trackingNumber}` - Track parcel
- `POST /tickets/calculate` - Calculate ticket fare
- `POST /tickets/book` - Book a ticket
- `GET /tickets/track/{bookingReference}` - Track ticket
- `GET /public/destinations` - Get all stations
- `GET /public/trains` - Get all trains
- `GET /admin/dashboard/stats` - Get dashboard statistics

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on http://localhost:8082

### Installation

1. Clone the repository
```bash
cd Frontend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8082
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📝 Usage Guide

### Booking a Parcel

1. Navigate to "Send a Parcel" from the home page
2. Fill in sender information (Name, NIC, Mobile, Email, Address)
3. Fill in receiver information (Name, Email, Address)
4. Select parcel details:
   - From/To stations
   - Parcel type
   - Train
   - Number of parcels
   - Weight
   - Travel date
5. View auto-calculated charges
6. Submit booking
7. Save/print the QR code and tracking number

### Booking a Ticket

1. Navigate to "Book Tickets"
2. Fill in passenger information (Name, NIC, Mobile, Email)
3. Select journey details:
   - From/To stations
   - Train
   - Travel date
   - Seat class
   - Number of passengers
4. View auto-calculated fare
5. Submit booking
6. Save/print the QR code and booking reference

### Tracking

1. Go to "Track" page
2. Select tracking type (Parcel or Ticket)
3. Enter tracking number or booking reference
4. View detailed status and information

### Admin Dashboard

1. Login as admin
2. View comprehensive statistics:
   - Total parcels, tickets, users, revenue
   - Status breakdowns
   - System metrics
3. Access quick actions for management

### Station Master Dashboard

1. Login as station master
2. View parcels at your station
3. Filter by status (Pending, In Transit, Delivered)
4. Update parcel status:
   - Mark pending parcels as "In Transit"
   - Mark in-transit parcels as "Delivered"

## 🔧 Configuration

### Tailwind CSS
Custom theme in [tailwind.config.ts](tailwind.config.ts):
- Railway color palette
- Custom container sizes
- Extended font families

### Form Validation
Zod schemas in [lib/validations.ts](lib/validations.ts):
- NIC validation (old and new formats)
- Mobile number validation (Sri Lankan format)
- Email validation
- Date range validation

### Utilities
Helper functions in [lib/utils.ts](lib/utils.ts):
- `formatCurrency()` - Format amounts in LKR
- `formatDate()` - Format dates
- `isValidNIC()` - Validate Sri Lankan NIC
- `getStatusColor()` - Get color for status badges

## 📱 Responsive Design

- Mobile-first approach
- Responsive navigation with hamburger menu
- Adaptive grid layouts
- Touch-friendly buttons

## 🔒 Security

- JWT token authentication
- Protected routes with middleware
- Role-based access control
- Automatic token refresh
- Secure API communication

## 🐛 Troubleshooting

### Server won't start
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### API connection issues
- Ensure backend is running on port 8082
- Check CORS settings on backend
- Verify `.env.local` has correct API URL

### Authentication issues
- Clear localStorage: `localStorage.clear()`
- Check token expiration
- Verify credentials with backend

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Copyright © 2024 Sri Lankan Railway Department

## 📞 Support

For support, contact:
- Email: support@railway.lk
- Phone: +94 11 234 5678
- Website: https://railway.gov.lk

---

Built with ❤️ for the Sri Lankan Railway Department
