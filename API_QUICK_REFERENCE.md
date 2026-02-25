# API Quick Reference & Test Commands

## Setup

**Base URL:** `http://localhost:8082`  
**Default Admin:** username: `admin`, password: `Admin@123`

---

## Quick Test Commands (cURL)

### 1. Login and Get Token
```bash
curl -X POST http://localhost:8082/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

**Save the token from response:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. Public Endpoints (No Authentication)

#### Get All Trains
```bash
curl http://localhost:8082/api/user/trains
```

#### Get All Destinations
```bash
curl http://localhost:8082/api/user/destinations
```

#### Get Parcel Types
```bash
curl http://localhost:8082/api/user/parcel-types
```

---

### 3. Parcel Management

#### Calculate Parcel Charges
```bash
curl -X POST http://localhost:8082/api/parcel/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "KDY",
    "parcelType": "ELECTRONICS",
    "numberOfParcels": 2,
    "weightInKg": 5.5
  }'
```

#### Book Parcel
```bash
curl -X POST http://localhost:8082/api/parcel/book \
  -H "Content-Type: application/json" \
  -d '{
    "senderName": "Nimal Fernando",
    "senderAddress": "123, Galle Road, Colombo 03",
    "senderNic": "199012345678",
    "senderMobile": "0771234569",
    "senderEmail": "nimal@example.com",
    "startingDestination": "CMB",
    "destination": "KDY",
    "receiverName": "Sunil Jayawardena",
    "receiverAddress": "456, Peradeniya Road, Kandy",
    "receiverEmail": "sunil@example.com",
    "parcelType": "ELECTRONICS",
    "numberOfParcels": 2,
    "date": "2026-02-25",
    "weightInKg": 5.5,
    "trainNumber": "T001"
  }'
```

#### Track Parcel
```bash
curl http://localhost:8082/api/parcel/track/TRK20260222001
```

#### Get My Parcels
```bash
curl http://localhost:8082/api/customer/parcel/my-parcels/199012345678
```

---

### 4. Ticket Booking

#### Calculate Ticket Fare
```bash
curl -X POST http://localhost:8082/api/ticket/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "originStation": "CMB",
    "destinationStation": "KDY",
    "numberOfPassengers": 2,
    "seatClass": "SECOND"
  }'
```

#### Book Ticket
```bash
curl -X POST http://localhost:8082/api/ticket/book \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

#### Track Ticket
```bash
curl http://localhost:8082/api/ticket/track/BK20260222001
```

#### Get My Bookings
```bash
curl http://localhost:8082/api/ticket/my-bookings/198512345678
```

---

### 5. Admin Endpoints (Require Token)

#### Get Dashboard Stats
```bash
curl http://localhost:8082/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

#### Register New User
```bash
curl -X POST http://localhost:8082/api/admin/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "stationmaster1",
    "password": "StationMaster@123",
    "email": "sm1@trainparcel.lk",
    "fullName": "Kamal Perera",
    "nic": "199912345678",
    "mobileNumber": "0771234568",
    "role": "STATION_MASTER",
    "station": "CMB"
  }'
```

#### Get All Users
```bash
curl http://localhost:8082/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

#### Change User Status
```bash
curl -X PUT http://localhost:8082/api/admin/users/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": 2,
    "status": "ACTIVE"
  }'
```

#### Add Station
```bash
curl -X POST http://localhost:8082/api/admin/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "CMB",
    "name": "Colombo Fort",
    "distanceMultiplier": 1.0,
    "description": "Main station in Colombo",
    "active": true
  }'
```

#### Get All Stations
```bash
curl http://localhost:8082/api/admin/stations \
  -H "Authorization: Bearer $TOKEN"
```

#### Update Station
```bash
curl -X PUT http://localhost:8082/api/admin/stations/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "CMB",
    "name": "Colombo Fort Central",
    "distanceMultiplier": 1.0,
    "description": "Main station - Updated",
    "active": true
  }'
```

#### Change Station Status
```bash
curl -X PATCH "http://localhost:8082/api/admin/stations/1/status?active=false" \
  -H "Authorization: Bearer $TOKEN"
```

#### Delete Station
```bash
curl -X DELETE http://localhost:8082/api/admin/stations/1 \
  -H "Authorization: Bearer $TOKEN"
```

#### Add Train
```bash
curl -X POST http://localhost:8082/api/admin/trains \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "trainNumber": "T001",
    "name": "Udarata Menike",
    "departureTime": "06:00:00",
    "arrivalTime": "10:30:00",
    "departureStation": "CMB",
    "destinationStation": "KDY",
    "active": true
  }'
```

#### Get All Trains (Admin)
```bash
curl http://localhost:8082/api/admin/trains \
  -H "Authorization: Bearer $TOKEN"
```

#### Update Train
```bash
curl -X PUT http://localhost:8082/api/admin/trains/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "trainNumber": "T001",
    "name": "Udarata Menike Express",
    "departureTime": "06:00:00",
    "arrivalTime": "10:30:00",
    "departureStation": "CMB",
    "destinationStation": "KDY",
    "active": true
  }'
```

#### Change Train Status
```bash
curl -X PATCH "http://localhost:8082/api/admin/trains/1/status?active=false" \
  -H "Authorization: Bearer $TOKEN"
```

#### Delete Train
```bash
curl -X DELETE http://localhost:8082/api/admin/trains/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

### 6. Station Master Endpoints (Require Token)

#### Get Station Dashboard
```bash
curl http://localhost:8082/api/station-master/dashboard/CMB \
  -H "Authorization: Bearer $TOKEN"
```

#### Get Latest Parcels
```bash
curl http://localhost:8082/api/station-master/parcels/latest/CMB \
  -H "Authorization: Bearer $TOKEN"
```

#### Update Parcel Status
```bash
curl -X PUT http://localhost:8082/api/station-master/parcels/TRK20260222001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "ACCEPTED",
    "totalCharge": 6275.0,
    "remarks": "Parcel accepted and ready for dispatch"
  }'
```

#### Get Incoming Parcels
```bash
curl http://localhost:8082/api/station-master/parcels/incoming/CMB \
  -H "Authorization: Bearer $TOKEN"
```

#### Get Outgoing Parcels
```bash
curl http://localhost:8082/api/station-master/parcels/outgoing/CMB \
  -H "Authorization: Bearer $TOKEN"
```

#### Get All Parcels by Station
```bash
curl http://localhost:8082/api/station-master/parcels/all/CMB \
  -H "Authorization: Bearer $TOKEN"
```

---

## PowerShell Commands

### Login and Save Token
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:8082/api/user/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"username":"admin","password":"Admin@123"}'
$token = $response.data.token
Write-Host "Token: $token"
```

### Get Trains
```powershell
Invoke-RestMethod -Uri "http://localhost:8082/api/user/trains" | ConvertTo-Json -Depth 5
```

### Book Parcel
```powershell
$parcelData = @{
  senderName = "Nimal Fernando"
  senderAddress = "123, Galle Road, Colombo 03"
  senderNic = "199012345678"
  senderMobile = "0771234569"
  senderEmail = "nimal@example.com"
  startingDestination = "CMB"
  destination = "KDY"
  receiverName = "Sunil Jayawardena"
  receiverAddress = "456, Peradeniya Road, Kandy"
  receiverEmail = "sunil@example.com"
  parcelType = "ELECTRONICS"
  numberOfParcels = 2
  date = "2026-02-25"
  weightInKg = 5.5
  trainNumber = "T001"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8082/api/parcel/book" `
  -Method POST -ContentType "application/json" -Body $parcelData
```

### Admin Request with Token
```powershell
$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:8082/api/admin/dashboard" `
  -Headers $headers | ConvertTo-Json -Depth 5
```

---

## JavaScript (Browser Console / Node.js)

### Login
```javascript
fetch('http://localhost:8082/api/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'Admin@123' })
})
.then(r => r.json())
.then(d => {
  console.log('Token:', d.data.token);
  localStorage.setItem('token', d.data.token);
});
```

### Get Trains
```javascript
fetch('http://localhost:8082/api/user/trains')
  .then(r => r.json())
  .then(d => console.log(d));
```

### Book Parcel
```javascript
fetch('http://localhost:8082/api/parcel/book', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
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
  })
})
.then(r => r.json())
.then(d => console.log('Tracking Number:', d.data));
```

### Admin Request
```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:8082/api/admin/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log(d));
```

---

## Common Test Scenarios

### Scenario 1: Complete Parcel Booking Flow
```bash
# 1. Get destinations
curl http://localhost:8082/api/user/destinations

# 2. Get trains
curl http://localhost:8082/api/user/trains

# 3. Get parcel types
curl http://localhost:8082/api/user/parcel-types

# 4. Calculate charges
curl -X POST http://localhost:8082/api/parcel/calculate \
  -H "Content-Type: application/json" \
  -d '{"destination":"KDY","parcelType":"ELECTRONICS","numberOfParcels":2,"weightInKg":5.5}'

# 5. Book parcel
curl -X POST http://localhost:8082/api/parcel/book \
  -H "Content-Type: application/json" \
  -d '{...parcel data...}'

# 6. Track parcel (use tracking number from step 5)
curl http://localhost:8082/api/parcel/track/TRK20260222001
```

### Scenario 2: Admin Setup Flow
```bash
# 1. Login as admin
TOKEN=$(curl -X POST http://localhost:8082/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}' \
  | jq -r '.data.token')

# 2. Add stations
curl -X POST http://localhost:8082/api/admin/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"code":"CMB","name":"Colombo Fort","distanceMultiplier":1.0,"description":"Main station","active":true}'

# 3. Add trains
curl -X POST http://localhost:8082/api/admin/trains \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"trainNumber":"T001","name":"Udarata Menike","departureTime":"06:00:00","arrivalTime":"10:30:00","departureStation":"CMB","destinationStation":"KDY","active":true}'

# 4. Register station master
curl -X POST http://localhost:8082/api/admin/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"username":"sm1","password":"SM@123","email":"sm1@train.lk","fullName":"Station Master 1","nic":"199912345678","mobileNumber":"0771234568","role":"STATION_MASTER","station":"CMB"}'

# 5. Activate user
curl -X PUT http://localhost:8082/api/admin/users/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"userId":2,"status":"ACTIVE"}'
```

### Scenario 3: Station Master Parcel Management
```bash
# 1. Login as station master
SM_TOKEN=$(curl -X POST http://localhost:8082/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"sm1","password":"SM@123"}' \
  | jq -r '.data.token')

# 2. Get dashboard
curl http://localhost:8082/api/station-master/dashboard/CMB \
  -H "Authorization: Bearer $SM_TOKEN"

# 3. Get latest parcels
curl http://localhost:8082/api/station-master/parcels/latest/CMB \
  -H "Authorization: Bearer $SM_TOKEN"

# 4. Update parcel status
curl -X PUT http://localhost:8082/api/station-master/parcels/TRK20260222001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SM_TOKEN" \
  -d '{"status":"ACCEPTED","totalCharge":6275.0,"remarks":"Accepted"}'
```

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (Invalid/Missing Token) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Enum Values Quick Reference

### User Roles
- `ADMIN`
- `STATION_MASTER`
- `CUSTOMER`

### User Status
- `ACTIVE`
- `PENDING`
- `DISABLED`

### Parcel Status
- `PENDING`
- `ACCEPTED`
- `IN_TRANSIT`
- `ARRIVED`
- `READY_FOR_PICKUP`
- `DELIVERED`
- `CANCELLED`
- `REJECTED`

### Booking Status
- `PENDING`
- `CONFIRMED`
- `CANCELLED`
- `COMPLETED`
- `NO_SHOW`

### Seat Class
- `FIRST`
- `SECOND`
- `THIRD`

---

## Import to Postman

1. Open Postman
2. Click "Import"
3. Select the `API_COLLECTION.postman.json` file
4. After login, copy the token from response
5. Set the `token` variable in Postman collection
6. All authenticated requests will automatically use the token

---

**End of Quick Reference**

