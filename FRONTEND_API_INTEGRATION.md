# Frontend API Integration Guide - Train Parcel Advisor SL

**Base URL:** `http://localhost:8082`

---

## Quick Start

### 1. Authentication

```javascript
// Login
async function login(username, password) {
  const response = await fetch('http://localhost:8082/api/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  
  if (data.statusCode === 200) {
    localStorage.setItem('authToken', data.data.token);
    localStorage.setItem('userRole', data.data.role);
    localStorage.setItem('userName', data.data.userName);
    localStorage.setItem('userStation', data.data.station);
    return { success: true, user: data.data };
  }
  return { success: false, message: data.message };
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = '/login';
}

// Get stored token
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Check if user is logged in
function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}
```

---

## API Functions for Frontend

### Public APIs (No Auth Required)

#### Get Trains
```javascript
async function getTrains() {
  const response = await fetch('http://localhost:8082/api/user/trains');
  const data = await response.json();
  return data.data; // Returns array of trains
}
```

**Response Structure:**
```javascript
[
  {
    id: 1,
    trainNumber: "T001",
    name: "Udarata Menike",
    departureTime: "06:00:00",
    arrivalTime: "10:30:00",
    departureStation: "CMB",
    destinationStation: "KDY",
    active: true
  }
]
```

#### Get Destinations/Stations
```javascript
async function getDestinations() {
  const response = await fetch('http://localhost:8082/api/user/destinations');
  const data = await response.json();
  return data.data; // Returns array of stations
}
```

**Response Structure:**
```javascript
[
  {
    id: 1,
    code: "CMB",
    name: "Colombo Fort",
    distanceMultiplier: 1.0,
    description: "Main station",
    active: true
  }
]
```

#### Get Parcel Types
```javascript
async function getParcelTypes() {
  const response = await fetch('http://localhost:8082/api/user/parcel-types');
  const data = await response.json();
  return data.data; // Returns array of parcel types
}
```

**Response Structure:**
```javascript
[
  {
    id: 1,
    code: "DOCUMENT",
    name: "Document",
    multiplier: 1.0,
    description: "Letters, certificates",
    active: true
  }
]
```

---

### Parcel Management

#### Calculate Parcel Charges
```javascript
async function calculateParcelCharges(destination, parcelType, numberOfParcels, weightInKg) {
  const response = await fetch('http://localhost:8082/api/parcel/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      destination,
      parcelType,
      numberOfParcels,
      weightInKg
    })
  });
  const data = await response.json();
  return data;
}
```

**Request:**
```javascript
{
  destination: "KDY",
  parcelType: "ELECTRONICS",
  numberOfParcels: 2,
  weightInKg: 5.5
}
```

**Response:**
```javascript
{
  statusCode: 200,
  message: "Charges calculated",
  data: {
    baseRate: 500.0,
    weightCharge: 1650.0,
    typeCharge: 4125.0,
    total: 6275.0,
    currency: "LKR"
  }
}
```

#### Book Parcel
```javascript
async function bookParcel(parcelData) {
  const response = await fetch('http://localhost:8082/api/parcel/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parcelData)
  });
  const data = await response.json();
  return data;
}
```

**Request Object:**
```javascript
{
  senderName: "Nimal Fernando",
  senderAddress: "123, Galle Road, Colombo 03",
  senderNic: "199012345678",
  senderMobile: "0771234569",
  senderEmail: "nimal@example.com",
  startingDestination: "CMB",
  destination: "KDY",
  receiverName: "Sunil Jayawardena",
  receiverAddress: "456, Peradeniya Road, Kandy",
  receiverEmail: "sunil@example.com",
  parcelType: "ELECTRONICS",
  numberOfParcels: 2,
  date: "2026-02-25",
  weightInKg: 5.5,
  trainNumber: "T001"
}
```

**Response:**
```javascript
{
  statusCode: 200,
  message: "Parcel booked successfully. Tracking Number: TRK20260222001",
  data: "TRK20260222001" // This is the tracking number
}
```

#### Track Parcel
```javascript
async function trackParcel(trackingNumber) {
  const response = await fetch(`http://localhost:8082/api/parcel/track/${trackingNumber}`);
  const data = await response.json();
  return data;
}
```

**Response:**
```javascript
{
  statusCode: 200,
  message: "Success",
  data: {
    trackingNumber: "TRK20260222001",
    senderName: "Nimal Fernando",
    senderMobile: "0771234569",
    startingDestination: "CMB",
    destination: "KDY",
    receiverName: "Sunil Jayawardena",
    parcelType: "ELECTRONICS",
    numberOfParcels: 2,
    deliveryDate: "2026-02-25",
    weightInKg: 5.5,
    trainNumber: "T001",
    totalCharge: 6275.0,
    status: "IN_TRANSIT", // PENDING, ACCEPTED, IN_TRANSIT, ARRIVED, READY_FOR_PICKUP, DELIVERED, CANCELLED, REJECTED
    statusUpdatedAt: "2026-02-23T08:00:00",
    remarks: "Parcel loaded on train T001"
  }
}
```

#### Get My Parcels by NIC
```javascript
async function getMyParcels(nic) {
  const response = await fetch(`http://localhost:8082/api/customer/parcel/my-parcels/${nic}`);
  const data = await response.json();
  return data.data; // Returns array of parcels
}
```

---

### Ticket Booking

#### Calculate Ticket Fare
```javascript
async function calculateTicketFare(originStation, destinationStation, numberOfPassengers, seatClass) {
  const response = await fetch('http://localhost:8082/api/ticket/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      originStation,
      destinationStation,
      numberOfPassengers,
      seatClass // "FIRST", "SECOND", or "THIRD"
    })
  });
  const data = await response.json();
  return data;
}
```

**Request:**
```javascript
{
  originStation: "CMB",
  destinationStation: "KDY",
  numberOfPassengers: 2,
  seatClass: "SECOND"
}
```

**Response:**
```javascript
{
  statusCode: 200,
  message: "Fare calculated",
  data: {
    baseFare: 150.0,
    distanceCharge: 525.0,
    classMultiplierCharge: 843.75,
    totalFare: 1687.5,
    currency: "LKR",
    estimatedDuration: "4 hours 30 minutes"
  }
}
```

#### Book Ticket
```javascript
async function bookTicket(ticketData) {
  const response = await fetch('http://localhost:8082/api/ticket/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  });
  const data = await response.json();
  return data;
}
```

**Request Object:**
```javascript
{
  passengerName: "Amara Wijesinghe",
  passengerNic: "198512345678",
  passengerMobile: "0771234570",
  passengerEmail: "amara@example.com",
  originStation: "CMB",
  destinationStation: "KDY",
  trainNumber: "T001",
  travelDate: "2026-02-28",
  numberOfPassengers: 2,
  seatClass: "SECOND"
}
```

**Response:**
```javascript
{
  statusCode: 200,
  message: "Ticket booked successfully",
  data: {
    bookingReference: "BK20260222001",
    passengerName: "Amara Wijesinghe",
    originStation: "CMB",
    destinationStation: "KDY",
    trainNumber: "T001",
    travelDate: "2026-02-28",
    numberOfPassengers: 2,
    totalFare: 1687.5,
    status: "PENDING", // PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW
    seatClass: "SECOND",
    qrCodeContent: "BK20260222001|T001|2026-02-28|CMB-KDY",
    estimatedArrivalTime: "10:30:00"
  }
}
```

#### Track Ticket
```javascript
async function trackTicket(bookingReference) {
  const response = await fetch(`http://localhost:8082/api/ticket/track/${bookingReference}`);
  const data = await response.json();
  return data.data;
}
```

#### Get My Bookings by NIC
```javascript
async function getMyBookings(nic) {
  const response = await fetch(`http://localhost:8082/api/ticket/my-bookings/${nic}`);
  const data = await response.json();
  return data.data; // Returns array of bookings
}
```

---

### Admin APIs (Require Authentication)

#### Helper Function for Authenticated Requests
```javascript
async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  
  if (data.statusCode === 401) {
    // Token expired or invalid
    logout();
    throw new Error('Session expired. Please login again.');
  }
  
  return data;
}
```

#### Register User (Admin/Station Master)
```javascript
async function registerUser(userData) {
  return await fetchWithAuth('http://localhost:8082/api/admin/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}
```

**Request:**
```javascript
{
  username: "stationmaster1",
  password: "StationMaster@123",
  email: "sm1@trainparcel.lk",
  fullName: "Kamal Perera",
  nic: "199912345678",
  mobileNumber: "0771234568",
  role: "STATION_MASTER", // "ADMIN", "STATION_MASTER", "CUSTOMER"
  station: "CMB"
}
```

#### Get Admin Dashboard
```javascript
async function getAdminDashboard() {
  const data = await fetchWithAuth('http://localhost:8082/api/admin/dashboard');
  return data.data;
}
```

**Response:**
```javascript
{
  totalUsers: 15,
  activeUsers: 12,
  totalParcels: 245,
  totalStations: 8,
  activeStations: 7,
  totalTrains: 12,
  activeTrains: 10
}
```

#### Get All Users
```javascript
async function getAllUsers() {
  const data = await fetchWithAuth('http://localhost:8082/api/admin/users');
  return data.data;
}
```

#### Change User Status
```javascript
async function changeUserStatus(userId, status) {
  return await fetchWithAuth('http://localhost:8082/api/admin/users/status', {
    method: 'PUT',
    body: JSON.stringify({ userId, status }) // status: "ACTIVE", "PENDING", "DISABLED"
  });
}
```

#### Station Management
```javascript
// Get all stations
async function getAllStations() {
  const data = await fetchWithAuth('http://localhost:8082/api/admin/stations');
  return data.data;
}

// Add station
async function addStation(stationData) {
  return await fetchWithAuth('http://localhost:8082/api/admin/stations', {
    method: 'POST',
    body: JSON.stringify(stationData)
  });
}

// Update station
async function updateStation(id, stationData) {
  return await fetchWithAuth(`http://localhost:8082/api/admin/stations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(stationData)
  });
}

// Change station status
async function changeStationStatus(id, active) {
  return await fetchWithAuth(`http://localhost:8082/api/admin/stations/${id}/status?active=${active}`, {
    method: 'PATCH'
  });
}

// Delete station
async function deleteStation(id) {
  return await fetchWithAuth(`http://localhost:8082/api/admin/stations/${id}`, {
    method: 'DELETE'
  });
}
```

**Station Data Object:**
```javascript
{
  code: "JFN",
  name: "Jaffna",
  distanceMultiplier: 8.5,
  description: "Northern province main station",
  active: true
}
```

#### Train Management
```javascript
// Get all trains
async function getAllTrains() {
  const data = await fetchWithAuth('http://localhost:8082/api/admin/trains');
  return data.data;
}

// Add train
async function addTrain(trainData) {
  return await fetchWithAuth('http://localhost:8082/api/admin/trains', {
    method: 'POST',
    body: JSON.stringify(trainData)
  });
}

// Update train
async function updateTrain(id, trainData) {
  return await fetchWithAuth(`http://localhost:8082/api/admin/trains/${id}`, {
    method: 'PUT',
    body: JSON.stringify(trainData)
  });
}

// Change train status
async function changeTrainStatus(id, active) {
  return await fetchWithAuth(`http://localhost:8082/api/admin/trains/${id}/status?active=${active}`, {
    method: 'PATCH'
  });
}

// Delete train
async function deleteTrain(id) {
  return await fetchWithAuth(`http://localhost:8082/api/admin/trains/${id}`, {
    method: 'DELETE'
  });
}
```

**Train Data Object:**
```javascript
{
  trainNumber: "T003",
  name: "Rajarata Rajini",
  departureTime: "07:00:00",
  arrivalTime: "11:30:00",
  departureStation: "CMB",
  destinationStation: "ANP",
  active: true
}
```

---

### Station Master APIs (Require Authentication)

#### Get Station Master Dashboard
```javascript
async function getStationMasterDashboard(stationCode) {
  const data = await fetchWithAuth(`http://localhost:8082/api/station-master/dashboard/${stationCode}`);
  return data.data;
}
```

**Response:**
```javascript
{
  stationCode: "CMB",
  stationName: "Colombo Fort",
  totalParcels: 156,
  todaysBookings: 12,
  todaysDeliveries: 8,
  todaysRevenue: 45780.50
}
```

#### Get Latest Parcels
```javascript
async function getLatestParcels(stationCode) {
  const data = await fetchWithAuth(`http://localhost:8082/api/station-master/parcels/latest/${stationCode}`);
  return data.data;
}
```

#### Update Parcel Status
```javascript
async function updateParcel(trackingNumber, status, totalCharge, remarks) {
  return await fetchWithAuth(`http://localhost:8082/api/station-master/parcels/${trackingNumber}`, {
    method: 'PUT',
    body: JSON.stringify({ status, totalCharge, remarks })
  });
}
```

**Status Values:**
- `PENDING` - Initial status
- `ACCEPTED` - Station master accepted
- `IN_TRANSIT` - On the train
- `ARRIVED` - Reached destination
- `READY_FOR_PICKUP` - Ready for pickup
- `DELIVERED` - Delivered to receiver
- `CANCELLED` - Cancelled
- `REJECTED` - Rejected by station master

#### Get Incoming Parcels
```javascript
async function getIncomingParcels(stationCode) {
  const data = await fetchWithAuth(`http://localhost:8082/api/station-master/parcels/incoming/${stationCode}`);
  return data.data;
}
```

#### Get Outgoing Parcels
```javascript
async function getOutgoingParcels(stationCode) {
  const data = await fetchWithAuth(`http://localhost:8082/api/station-master/parcels/outgoing/${stationCode}`);
  return data.data;
}
```

#### Get All Parcels by Station
```javascript
async function getAllParcelsByStation(stationCode) {
  const data = await fetchWithAuth(`http://localhost:8082/api/station-master/parcels/all/${stationCode}`);
  return data.data;
}
```

---

## Complete React Example Components

### Login Component
```jsx
import React, { useState } from 'react';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8082/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.statusCode === 200) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('userRole', data.data.role);
        localStorage.setItem('userName', data.data.userName);
        localStorage.setItem('userStation', data.data.station);
        
        // Redirect based on role
        switch(data.data.role) {
          case 'ADMIN':
            window.location.href = '/admin/dashboard';
            break;
          case 'STATION_MASTER':
            window.location.href = `/station-master/dashboard/${data.data.station}`;
            break;
          default:
            window.location.href = '/';
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;
```

### Parcel Booking Component
```jsx
import React, { useState, useEffect } from 'react';

function ParcelBooking() {
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [parcelTypes, setParcelTypes] = useState([]);
  const [charges, setCharges] = useState(null);
  
  const [formData, setFormData] = useState({
    senderName: '',
    senderAddress: '',
    senderNic: '',
    senderMobile: '',
    senderEmail: '',
    startingDestination: '',
    destination: '',
    receiverName: '',
    receiverAddress: '',
    receiverEmail: '',
    parcelType: '',
    numberOfParcels: 1,
    date: '',
    weightInKg: 0,
    trainNumber: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [stationsRes, trainsRes, typesRes] = await Promise.all([
      fetch('http://localhost:8082/api/user/destinations'),
      fetch('http://localhost:8082/api/user/trains'),
      fetch('http://localhost:8082/api/user/parcel-types')
    ]);

    const stationsData = await stationsRes.json();
    const trainsData = await trainsRes.json();
    const typesData = await typesRes.json();

    setStations(stationsData.data);
    setTrains(trainsData.data);
    setParcelTypes(typesData.data);
  };

  const calculateCharges = async () => {
    if (!formData.destination || !formData.parcelType || !formData.weightInKg) {
      alert('Please fill destination, parcel type, and weight');
      return;
    }

    const response = await fetch('http://localhost:8082/api/parcel/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: formData.destination,
        parcelType: formData.parcelType,
        numberOfParcels: formData.numberOfParcels,
        weightInKg: formData.weightInKg
      })
    });

    const data = await response.json();
    if (data.statusCode === 200) {
      setCharges(data.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:8082/api/parcel/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    
    if (data.statusCode === 200) {
      alert(`Parcel booked successfully! Tracking Number: ${data.data}`);
      // Reset form or redirect
    } else {
      alert(`Error: ${data.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Book Parcel</h2>
      
      {/* Sender Information */}
      <section>
        <h3>Sender Information</h3>
        <input
          type="text"
          placeholder="Sender Name"
          value={formData.senderName}
          onChange={(e) => setFormData({...formData, senderName: e.target.value})}
          required
        />
        {/* Add other sender fields */}
      </section>

      {/* Parcel Details */}
      <section>
        <h3>Parcel Details</h3>
        <select
          value={formData.startingDestination}
          onChange={(e) => setFormData({...formData, startingDestination: e.target.value})}
          required
        >
          <option value="">Select Starting Station</option>
          {stations.map(s => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>

        <select
          value={formData.destination}
          onChange={(e) => setFormData({...formData, destination: e.target.value})}
          required
        >
          <option value="">Select Destination</option>
          {stations.map(s => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>

        <select
          value={formData.parcelType}
          onChange={(e) => setFormData({...formData, parcelType: e.target.value})}
          required
        >
          <option value="">Select Parcel Type</option>
          {parcelTypes.map(t => (
            <option key={t.code} value={t.code}>{t.name}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Weight (kg)"
          value={formData.weightInKg}
          onChange={(e) => setFormData({...formData, weightInKg: parseFloat(e.target.value)})}
          step="0.1"
          required
        />

        <button type="button" onClick={calculateCharges}>Calculate Charges</button>

        {charges && (
          <div className="charges">
            <h4>Estimated Charges</h4>
            <p>Total: {charges.total} {charges.currency}</p>
          </div>
        )}
      </section>

      {/* Receiver Information */}
      <section>
        <h3>Receiver Information</h3>
        {/* Add receiver fields */}
      </section>

      <button type="submit">Book Parcel</button>
    </form>
  );
}

export default ParcelBooking;
```

### Track Parcel Component
```jsx
import React, { useState } from 'react';

function TrackParcel() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [parcelData, setParcelData] = useState(null);
  const [error, setError] = useState('');

  const trackParcel = async () => {
    setError('');
    setParcelData(null);

    try {
      const response = await fetch(`http://localhost:8082/api/parcel/track/${trackingNumber}`);
      const data = await response.json();

      if (data.statusCode === 200) {
        setParcelData(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to track parcel');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'orange',
      ACCEPTED: 'blue',
      IN_TRANSIT: 'purple',
      ARRIVED: 'teal',
      READY_FOR_PICKUP: 'green',
      DELIVERED: 'darkgreen',
      CANCELLED: 'red',
      REJECTED: 'darkred'
    };
    return colors[status] || 'gray';
  };

  return (
    <div>
      <h2>Track Parcel</h2>
      
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter Tracking Number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
        />
        <button onClick={trackParcel}>Track</button>
      </div>

      {error && <div className="error">{error}</div>}

      {parcelData && (
        <div className="parcel-details">
          <h3>Parcel Details</h3>
          <div className="status" style={{ color: getStatusColor(parcelData.status) }}>
            Status: {parcelData.status}
          </div>
          
          <div className="info">
            <p><strong>Tracking Number:</strong> {parcelData.trackingNumber}</p>
            <p><strong>From:</strong> {parcelData.startingDestination}</p>
            <p><strong>To:</strong> {parcelData.destination}</p>
            <p><strong>Delivery Date:</strong> {parcelData.deliveryDate}</p>
            <p><strong>Train:</strong> {parcelData.trainNumber}</p>
            <p><strong>Total Charge:</strong> {parcelData.totalCharge} LKR</p>
            {parcelData.remarks && (
              <p><strong>Remarks:</strong> {parcelData.remarks}</p>
            )}
          </div>

          <div className="timeline">
            <h4>Tracking Timeline</h4>
            <p>Last Updated: {new Date(parcelData.statusUpdatedAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackParcel;
```

---

## Error Handling Best Practices

```javascript
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (data.statusCode === 200) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Usage
const result = await apiCall('http://localhost:8082/api/user/trains');
if (result.success) {
  setTrains(result.data);
} else {
  showError(result.error);
}
```

---

## Important Notes

1. **CORS**: Backend has CORS enabled for cross-origin requests
2. **Date Format**: Use `YYYY-MM-DD` format for dates (e.g., "2026-02-25")
3. **Time Format**: Use `HH:mm:ss` format for times (e.g., "10:30:00")
4. **Token Expiry**: JWT tokens expire after configured time. Handle 401 errors by redirecting to login
5. **Validation**: Backend performs validation. Display validation errors to users
6. **Status Enums**: Use exact status values as documented (case-sensitive)

---

## Testing Endpoints

You can test endpoints using browser console:

```javascript
// Test login
fetch('http://localhost:8082/api/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'Admin@123' })
})
.then(r => r.json())
.then(d => console.log(d));

// Test get trains
fetch('http://localhost:8082/api/user/trains')
.then(r => r.json())
.then(d => console.log(d));
```

---

**End of Frontend Integration Guide**

