# TrainParcelAdvisor SL 🚂

A modern web application for Sri Lankan Railway Department's parcel management and ticket booking system.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8)

## 🌟 Features

### For Passengers
- 🎫 **Train Ticket Booking** - Book train seats online
- 📦 **Parcel Services** - Send parcels across Sri Lanka
- 🔍 **Track & Trace** - Real-time tracking of parcels and tickets
- 💰 **Fare Calculator** - Calculate fares before booking
- 📱 **QR Code Generation** - Digital tickets and parcel receipts

### For Admin
- 📊 **Dashboard Analytics** - Comprehensive insights and reports
- 👥 **User Management** - Manage system users and permissions
- 🚉 **Station Management** - CRUD operations for railway stations
- 🚂 **Train Management** - Manage train schedules and routes
- 💵 **Revenue Tracking** - Monitor financial performance

### For Station Masters
- 📥 **Parcel Management** - Handle incoming/outgoing parcels
- 🔄 **Status Updates** - Update parcel delivery status
- 📈 **Station Reports** - View station-specific analytics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Backend API running on `http://localhost:8082`

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   # .env.local file should contain:
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8082
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── login/             # Authentication pages
│   ├── parcels/           # Parcel management
│   ├── tickets/           # Ticket booking
│   ├── admin/             # Admin dashboard
│   └── track/             # Tracking pages
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── forms/            # Form components
│   └── layouts/          # Layout components
├── lib/                   # Core utilities
│   ├── api/              # API integration
│   ├── types.ts          # TypeScript types
│   ├── validations.ts    # Zod schemas
│   └── utils.ts          # Helper functions
├── public/               # Static assets
└── tailwind.config.ts    # Tailwind configuration
```

## 🎨 Design System

### Color Palette

```typescript
// Sri Lankan Railway Official Colors
railway: {
  red: '#8B0000',      // Primary - Railway Red
  blue: '#001F3F',     // Secondary - Official Blue
  gold: '#FFD700',     // Accent - Highlight
}
```

### Typography
- **Font Family:** Geist Sans (Primary), Geist Mono (Code)
- **Headings:** Railway Blue with bold weight
- **Body:** Dark gray (#333333)

### Components
- **Buttons:** Primary (Red), Secondary (Blue), Outline, Ghost
- **Cards:** White background with shadow
- **Inputs:** Rounded with Railway Red focus ring
- **Badges:** Rounded full with status colors

## 🔌 API Integration

### Authentication
```typescript
import { authApi } from '@/lib/api';

// Login
const user = await authApi.login({ username, password });

// Check authentication
const isAuth = authApi.isAuthenticated();
```

### Parcel Booking
```typescript
import { parcelApi } from '@/lib/api';

// Calculate charges
const charges = await parcelApi.calculateCharges({
  destination: 'KDY',
  parcelType: 'ELECTRONICS',
  numberOfParcels: 2,
  weightInKg: 5.5
});

// Book parcel
const booking = await parcelApi.bookParcel(bookingData);
```

### Ticket Booking
```typescript
import { ticketApi } from '@/lib/api';

// Calculate fare
const fare = await ticketApi.calculateFare({
  originStation: 'CMB',
  destinationStation: 'KDY',
  numberOfPassengers: 2,
  seatClass: 'SECOND'
});

// Book ticket
const ticket = await ticketApi.bookTicket(ticketData);
```

## 🛠 Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Type checking
npx tsc --noEmit     # Check TypeScript errors
```

## 📚 Documentation

- **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - Setup completion status

## 🔐 Test Credentials

**Admin Account:**
- Username: `admin`
- Password: `Admin@123`
- Role: ADMIN
- Station: CMB

## 📦 Key Dependencies

### Core
- **Next.js 16.1.6** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety

### UI & Styling
- **Tailwind CSS 4.x** - Utility-first CSS
- **React Icons** - Icon library
- **Framer Motion** - Animations
- **Sonner** - Toast notifications

### Forms & Validation
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### State & Data
- **Zustand** - State management
- **Axios** - HTTP client
- **Recharts** - Charts and graphs
- **date-fns** - Date utilities

### Features
- **QRCode** - QR code generation

## 🚧 Development Roadmap

### Phase 1: Core Features ✅
- [x] Project setup
- [x] API integration layer
- [x] Type definitions
- [x] Validation schemas
- [x] Utility functions

### Phase 2: Authentication 🔄
- [ ] Login page
- [ ] Protected routes
- [ ] User context
- [ ] Role-based access

### Phase 3: Parcel System 📦
- [ ] Booking form
- [ ] Tracking page
- [ ] My parcels
- [ ] Status updates

### Phase 4: Ticket System 🎫
- [ ] Booking form
- [ ] Tracking page
- [ ] My bookings
- [ ] Cancellation

### Phase 5: Admin Panel 👨‍💼
- [ ] Dashboard
- [ ] User management
- [ ] Station management
- [ ] Train management
- [ ] Analytics

### Phase 6: Polish ✨
- [ ] Responsive design
- [ ] Animations
- [ ] Loading states
- [ ] Error handling
- [ ] Accessibility

## 🤝 Contributing

This is a final year project for ICBT. For questions or improvements:

1. Review existing documentation
2. Check TypeScript types
3. Follow the established patterns
4. Maintain code quality

## 📄 License

© 2026 Sri Lankan Railway Department. All rights reserved.

## 🙏 Acknowledgments

- Sri Lankan Railway Department
- ICBT Education
- Next.js Team
- Tailwind CSS Team

---

**Status:** 🟢 In Active Development  
**Version:** 1.0.0  
**Last Updated:** February 22, 2026
