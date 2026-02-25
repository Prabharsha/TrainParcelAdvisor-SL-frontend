# TrainParcelAdvisor SL - Project Specification

## Project Overview
Create a new Next.js application called **TrainParcelAdvisor SL** for the Sri Lankan Railway Department's parcel management system.

## Directory Structure
- **New Project Location**: `D:\Personal\ICBT\Final Project\Project\Frontend`
- **Reference Project**: `D:\Personal\ICBT\Final Project\Resources\projects\rail-parcel-fe`

## Project Scope

### Phase 1: Core Migration
1. **Analyze Reference Project**
   - Review existing architecture and features
   - Document current functionality
   - Identify reusable components and patterns

2. **Recreate Existing Features**
   - Implement all current parcel management features
   - Maintain feature parity with reference project
   - Migrate to Next.js architecture (App Router/Pages Router)

### Phase 2: New Features

#### 1. Passenger Booking System
- Passenger registration and authentication
- Seat/ticket booking interface
- Booking history and management
- Payment integration
- E-ticket generation
- Booking cancellation/modification

#### 2. Advanced Admin Dashboard
- **Analytics & Reporting**
  - Real-time parcel tracking statistics
  - Revenue analytics and charts
  - Passenger booking metrics
  - Performance indicators (KPIs)
  
- **Enhanced Management Tools**
  - User management (passengers, staff, admins)
  - Parcel status tracking and updates
  - Booking management and oversight
  - Train schedule management
  - Route and pricing management
  
- **Visualization**
  - Interactive charts and graphs (Chart.js/Recharts)
  - Data export capabilities (CSV, PDF)
  - Custom date range filtering
  - Real-time updates using WebSockets (optional)

### Phase 3: UI/UX Enhancement

#### Design Requirements
- **Professional & Modern Interface**
  - Clean, intuitive navigation
  - Responsive design (mobile-first approach)
  - Accessibility compliant (WCAG 2.1)
  
- **Sri Lankan Railway Color Theme**
  - Primary: Deep Red (#8B0000 - Railway Red)
  - Secondary: Navy Blue (#001F3F - Official Blue)
  - Accent: Gold/Yellow (#FFD700 - Highlight)
  - Background: Light Gray/White (#F5F5F5)
  - Text: Dark Gray (#333333)
  
- **Component Libraries** (Recommended)
  - Tailwind CSS for styling
  - shadcn/ui or Material-UI for components
  - Framer Motion for animations
  - React Icons for iconography

## Technical Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API / Zustand / Redux Toolkit
- **Forms**: React Hook Form + Zod validation
- **API Client**: Axios / Fetch API
- **Charts**: Recharts or Chart.js

### Development Tools
- ESLint + Prettier for code formatting
- Husky for Git hooks
- Jest + React Testing Library for testing

## Documentation Reference
Refer to these documents in order:

1. **`README_API_DOCUMENTATION.md`** - API overview and getting started
2. **`FRONTEND_API_INTEGRATION.md`** - Integration guidelines and code examples
3. **`API_DOCUMENTATION.md`** - Complete API reference
4. **`API_QUICK_REFERENCE.md`** - Quick lookup and testing guide

## Implementation Approach

### Step 1: Analysis
- [ ] Review reference project structure
- [ ] Document existing API endpoints
- [ ] Map current features and workflows
- [ ] Identify reusable logic and components

### Step 2: Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS with custom theme
- [ ] Set up project structure and folder organization
- [ ] Configure environment variables

### Step 3: Core Development
- [ ] Implement authentication system
- [ ] Recreate existing parcel management features
- [ ] Build passenger booking system
- [ ] Develop advanced admin dashboard

### Step 4: UI/UX Polish
- [ ] Apply Sri Lankan Railway color scheme
- [ ] Implement responsive design
- [ ] Add animations and transitions
- [ ] Conduct usability testing

### Step 5: Testing & Deployment
- [ ] Unit and integration testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Deployment configuration

## Key Deliverables
1. Fully functional Next.js application
2. All features from reference project
3. New passenger booking system
4. Advanced admin dashboard with analytics
5. Professional UI with Sri Lankan Railway branding
6. Complete documentation
7. Deployment-ready codebase

## Success Criteria
- ✅ Feature parity with reference project
- ✅ Functional passenger booking system
- ✅ Comprehensive admin dashboard
- ✅ Professional, accessible UI/UX
- ✅ Proper color theme implementation
- ✅ Mobile-responsive design
- ✅ Clean, maintainable codebase
- ✅ Proper error handling and validation
