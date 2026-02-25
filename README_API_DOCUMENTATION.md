# Train Parcel Advisor SL - API Testing & Documentation Summary

## 📋 Document Overview

This project includes comprehensive API documentation and testing resources for frontend integration:

### Documentation Files Created

1. **API_DOCUMENTATION.md** - Complete API documentation with detailed request/response structures
2. **FRONTEND_API_INTEGRATION.md** - Frontend-ready integration guide with JavaScript/React examples
3. **API_QUICK_REFERENCE.md** - Quick reference with cURL, PowerShell, and JavaScript commands
4. **API_COLLECTION.postman.json** - Postman collection for easy API testing
5. **test-apis.ps1** - PowerShell script for automated API testing

---

## 🚀 Quick Start for Frontend Developers

### Step 1: Review API Documentation
Start with **API_DOCUMENTATION.md** to understand:
- All available endpoints
- Request/response structures
- Authentication flow
- Sample data

### Step 2: Use Frontend Integration Guide
Open **FRONTEND_API_INTEGRATION.md** for:
- Ready-to-use JavaScript functions
- React component examples
- Error handling patterns
- Authentication helpers

### Step 3: Test APIs
Use **API_QUICK_REFERENCE.md** or **API_COLLECTION.postman.json** to:
- Test endpoints before integrating
- Understand actual responses
- Debug integration issues

---

## 📊 API Summary

### Total Endpoints: 40+

#### Public Endpoints (No Auth): 14
- User Login
- Get Trains/Destinations/Parcel Types
- Calculate & Book Parcels
- Track Parcels
- Calculate & Book Tickets
- Track Tickets

#### Admin Endpoints (Auth Required): 15
- Dashboard & User Management
- Station Management (CRUD)
- Train Management (CRUD)

#### Station Master Endpoints (Auth Required): 6
- Dashboard
- Parcel Management & Status Updates
- View Incoming/Outgoing Parcels

---

## 🔑 Authentication

### Login
**Endpoint:** `POST /api/user/login`

**Request:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userName": "admin",
    "role": "ADMIN",
    "station": "CMB"
  }
}
```

### Using Token
```javascript
// Store token
localStorage.setItem('authToken', token);

// Use in requests
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 📦 Core Functionalities

### 1. Parcel Management

#### Calculate Charges
```javascript
POST /api/parcel/calculate
{
  "destination": "KDY",
  "parcelType": "ELECTRONICS",
  "numberOfParcels": 2,
  "weightInKg": 5.5
}
```

#### Book Parcel
```javascript
POST /api/parcel/book
{
  "senderName": "Nimal Fernando",
  "senderNic": "199012345678",
  "senderMobile": "0771234569",
  "senderEmail": "nimal@example.com",
  "startingDestination": "CMB",
  "destination": "KDY",
  "receiverName": "Sunil Jayawardena",
  "receiverEmail": "sunil@example.com",
  "parcelType": "ELECTRONICS",
  "numberOfParcels": 2,
  "date": "2026-02-25",
  "weightInKg": 5.5,
  "trainNumber": "T001"
  // ... other fields
}
// Returns: Tracking Number
```

#### Track Parcel
```javascript
GET /api/parcel/track/{trackingNumber}
// Returns: Full parcel details with status
```

### 2. Ticket Booking

#### Calculate Fare
```javascript
POST /api/ticket/calculate
{
  "originStation": "CMB",
  "destinationStation": "KDY",
  "numberOfPassengers": 2,
  "seatClass": "SECOND"
}
```

#### Book Ticket
```javascript
POST /api/ticket/book
{
  "passengerName": "Amara Wijesinghe",
  "passengerNic": "198512345678",
  "passengerMobile": "0771234570",
  "passengerEmail": "amara@example.com",
  "originStation": "CMB",
  "destinationStation": "KDY",
  "trainNumber": "T001",
  "travelDate": "2026-02-28",
  "numberOfPassengers": 2,
  "seatClass": "SECOND"
}
// Returns: Booking Reference & QR Code
```

### 3. Reference Data

```javascript
GET /api/user/trains          // All trains
GET /api/user/destinations    // All stations
GET /api/user/parcel-types    // Parcel types & pricing
```

---

## 🎯 Frontend Integration Checklist

### Phase 1: Setup
- [ ] Review API_DOCUMENTATION.md
- [ ] Understand authentication flow
- [ ] Set up base API service/helper
- [ ] Implement token storage & management

### Phase 2: Public Features
- [ ] Login page
- [ ] Parcel booking form
- [ ] Parcel tracking page
- [ ] Ticket booking form
- [ ] Ticket tracking page
- [ ] Get my parcels/bookings

### Phase 3: Admin Features
- [ ] Admin dashboard
- [ ] User management
- [ ] Station management
- [ ] Train management

### Phase 4: Station Master Features
- [ ] Station dashboard
- [ ] Parcel status updates
- [ ] View incoming/outgoing parcels

---

## 🔍 Testing the APIs

### Option 1: Postman
1. Import `API_COLLECTION.postman.json`
2. Login via "Login - Admin" request
3. Copy token from response
4. Set collection variable `token` 
5. Test other endpoints

### Option 2: Browser Console
```javascript
// Test login
fetch('http://localhost:8082/api/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'Admin@123' })
})
.then(r => r.json())
.then(d => console.log(d));
```

### Option 3: PowerShell Script
```powershell
.\test-apis.ps1
```

### Option 4: cURL Commands
See `API_QUICK_REFERENCE.md` for ready-to-use commands

---

## 📱 Sample React Components

### Login Component
```jsx
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:8082/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.statusCode === 200) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('userRole', data.data.role);
      // Redirect based on role
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

### Track Parcel Component
```jsx
function TrackParcel() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [parcel, setParcel] = useState(null);

  const trackParcel = async () => {
    const response = await fetch(`http://localhost:8082/api/parcel/track/${trackingNumber}`);
    const data = await response.json();
    if (data.statusCode === 200) {
      setParcel(data.data);
    }
  };

  return (
    <div>
      <input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
      <button onClick={trackParcel}>Track</button>
      {parcel && (
        <div>
          <p>Status: {parcel.status}</p>
          <p>From: {parcel.startingDestination}</p>
          <p>To: {parcel.destination}</p>
          <p>Charge: {parcel.totalCharge} LKR</p>
        </div>
      )}
    </div>
  );
}
```

More examples in **FRONTEND_API_INTEGRATION.md**

---

## 🎨 UI/UX Recommendations

### Parcel Booking Flow
1. **Step 1:** Select origin & destination stations
2. **Step 2:** Select parcel type & enter weight
3. **Step 3:** Calculate charges (show breakdown)
4. **Step 4:** Enter sender & receiver details
5. **Step 5:** Confirm & book
6. **Step 6:** Display tracking number (with copy button)

### Parcel Tracking
- Search by tracking number
- Display status with visual timeline/stepper
- Show all details (sender, receiver, stations, train, charges)
- Color-coded status indicators
- Real-time updates

### Admin Dashboard
- Statistics cards (users, parcels, stations, trains)
- Charts for daily/monthly revenue
- Recent activities list
- Quick actions (add station, add train, etc.)

### Station Master Dashboard
- Station-specific statistics
- Today's bookings/deliveries
- Revenue metrics
- Quick parcel status updates
- Filter by incoming/outgoing

---

## 🔐 Security Notes

1. **Token Storage:** Store JWT token in localStorage or sessionStorage
2. **Token Expiry:** Handle 401 errors and redirect to login
3. **HTTPS:** Use HTTPS in production
4. **Input Validation:** Validate all inputs on frontend before sending
5. **XSS Prevention:** Sanitize user inputs when displaying

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error
**Solution:** Backend has CORS enabled. Check if server is running on port 8082

### Issue 2: 401 Unauthorized
**Solution:** Token expired or invalid. Login again and get new token

### Issue 3: Validation Errors
**Solution:** Check request body matches exact field names and types in documentation

### Issue 4: Date/Time Format
**Solution:** 
- Dates: "YYYY-MM-DD" (e.g., "2026-02-25")
- Times: "HH:mm:ss" (e.g., "10:30:00")

---

## 📊 Data Models

### User
```javascript
{
  id: number,
  username: string,
  email: string,
  fullName: string,
  nic: string,
  mobileNumber: string,
  role: "ADMIN" | "STATION_MASTER" | "CUSTOMER",
  status: "ACTIVE" | "PENDING" | "DISABLED",
  station: string
}
```

### Parcel
```javascript
{
  trackingNumber: string,
  senderName: string,
  senderMobile: string,
  startingDestination: string,
  destination: string,
  receiverName: string,
  parcelType: string,
  numberOfParcels: number,
  deliveryDate: "YYYY-MM-DD",
  weightInKg: number,
  trainNumber: string,
  totalCharge: number,
  status: "PENDING" | "ACCEPTED" | "IN_TRANSIT" | "ARRIVED" | "READY_FOR_PICKUP" | "DELIVERED" | "CANCELLED" | "REJECTED",
  remarks: string
}
```

### Ticket Booking
```javascript
{
  bookingReference: string,
  passengerName: string,
  passengerNic: string,
  originStation: string,
  destinationStation: string,
  trainNumber: string,
  travelDate: "YYYY-MM-DD",
  numberOfPassengers: number,
  totalFare: number,
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW",
  seatClass: "FIRST" | "SECOND" | "THIRD",
  qrCodeContent: string
}
```

---

## 📞 API Response Format

All responses follow this structure:

```javascript
{
  statusCode: 200,           // HTTP status code
  title: "Success",          // "Success" or "Failed"
  message: "string",         // Human-readable message
  data: object | array | string | null
}
```

**Success (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Parcel booked successfully",
  "data": "TRK20260222001"
}
```

**Error (400):**
```json
{
  "statusCode": 400,
  "title": "Failed",
  "message": "Destination is required",
  "data": null
}
```

---

## 🎓 Learning Path

### For Backend Developers
1. Review all controllers to understand business logic
2. Check service layer for calculation methods
3. Understand entity relationships
4. Review security configuration

### For Frontend Developers
1. Start with **API_DOCUMENTATION.md** - understand endpoints
2. Read **FRONTEND_API_INTEGRATION.md** - see code examples
3. Use **API_QUICK_REFERENCE.md** - test with cURL/Postman
4. Import **API_COLLECTION.postman.json** - interactive testing
5. Run **test-apis.ps1** - see complete flow

### For QA/Testers
1. Import Postman collection
2. Run test-apis.ps1 for automated testing
3. Test each endpoint with valid/invalid data
4. Verify response formats
5. Check error handling

---

## 📈 Next Steps

### Immediate Tasks
- [ ] Test all endpoints using Postman
- [ ] Verify database is set up correctly
- [ ] Ensure all stations and trains are added
- [ ] Test parcel booking flow end-to-end
- [ ] Test ticket booking flow end-to-end

### Frontend Development
- [ ] Set up React/Vue/Angular project
- [ ] Create API service layer
- [ ] Implement authentication
- [ ] Build parcel booking UI
- [ ] Build ticket booking UI
- [ ] Build admin panel
- [ ] Build station master panel

### Enhancements
- [ ] Add email notifications
- [ ] Add SMS notifications
- [ ] Generate QR codes for tickets
- [ ] Add payment gateway
- [ ] Add real-time tracking updates
- [ ] Add analytics dashboard

---

## 🛠️ Tools & Technologies

### Backend
- **Framework:** Spring Boot 3.x
- **Language:** Java 17+
- **Database:** MySQL
- **Security:** JWT Authentication
- **Build Tool:** Gradle

### Recommended Frontend Stack
- **Framework:** React / Vue / Angular
- **HTTP Client:** Axios / Fetch API
- **State Management:** Redux / Vuex / NgRx
- **UI Library:** Material-UI / Ant Design / Bootstrap

### Testing Tools
- **API Testing:** Postman
- **Command Line:** cURL, PowerShell
- **Browser:** Developer Console

---

## 📧 Support & Contact

For issues or questions:
1. Review documentation files first
2. Check API_QUICK_REFERENCE.md for examples
3. Test with Postman collection
4. Contact backend team with specific error messages

---

## ✅ Verification Checklist

Before starting frontend development:
- [ ] Application is running on port 8082
- [ ] Database is connected and seeded with data
- [ ] Can successfully login with admin credentials
- [ ] Can retrieve trains, stations, and parcel types
- [ ] Can book a parcel and get tracking number
- [ ] Can track a parcel
- [ ] Can book a ticket and get booking reference
- [ ] All admin endpoints work with authentication

---

## 📚 Documentation Files Guide

| File | Purpose | Target Audience |
|------|---------|----------------|
| API_DOCUMENTATION.md | Complete API reference | All developers |
| FRONTEND_API_INTEGRATION.md | Integration guide with code | Frontend developers |
| API_QUICK_REFERENCE.md | Quick test commands | All developers, QA |
| API_COLLECTION.postman.json | Postman collection | QA, Backend, Frontend |
| test-apis.ps1 | Automated test script | QA, Backend |

---

## 🎉 Summary

You now have:
✅ **Complete API Documentation** with 40+ endpoints  
✅ **Frontend Integration Guide** with React examples  
✅ **Quick Reference** with cURL/PowerShell commands  
✅ **Postman Collection** for interactive testing  
✅ **Test Script** for automated validation  

All APIs are documented with:
- Detailed request/response structures
- Sample data for every endpoint
- Error handling guidelines
- Authentication examples
- Frontend integration code

**Ready for frontend integration!** 🚀

---

**Last Updated:** February 22, 2026  
**API Version:** 1.0.0  
**Base URL:** http://localhost:8082

