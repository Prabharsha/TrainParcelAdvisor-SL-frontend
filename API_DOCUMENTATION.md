# Train Parcel Advisor SL - API Documentation

**Base URL:** `http://localhost:8082`  
**Version:** 1.0.0  
**Date:** February 22, 2026

---

## Table of Contents

1. [Authentication](#authentication)
2. [User APIs](#user-apis)
3. [Admin APIs](#admin-apis)
4. [Customer/Parcel APIs](#customerparcel-apis)
5. [Ticket Booking APIs](#ticket-booking-apis)
6. [Station Master APIs](#station-master-apis)
7. [Common Response Structure](#common-response-structure)
8. [Error Handling](#error-handling)

---

## Authentication

### Login
**Endpoint:** `POST /api/user/login`  
**Access:** Public  
**Description:** Authenticate user and get JWT token

**Request Body:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Logged in successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userName": "admin",
    "email": "admin@trainparcel.lk",
    "phoneNumber": "0771234567",
    "role": "ADMIN",
    "station": "CMB"
  }
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "title": "Failed",
  "message": "Invalid Username or Password. Recheck and try again",
  "data": null
}
```

**User Roles:**
- `ADMIN` - Full system access
- `STATION_MASTER` - Station-specific access
- `CUSTOMER` - Limited customer access

**User Status:**
- `ACTIVE` - User can login
- `PENDING` - Awaiting admin approval
- `DISABLED` - User account disabled

---

## User APIs

### 1. Get All Trains
**Endpoint:** `GET /api/user/trains`  
**Access:** Public  
**Description:** Get list of all active trains

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": [
    {
      "id": 1,
      "trainNumber": "T001",
      "name": "Udarata Menike",
      "departureTime": "06:00:00",
      "arrivalTime": "10:30:00",
      "departureStation": "CMB",
      "destinationStation": "KDY",
      "active": true,
      "createdDateTime": "2026-02-20T10:30:00",
      "updatedDateTime": "2026-02-20T10:30:00"
    },
    {
      "id": 2,
      "trainNumber": "T002",
      "name": "Podi Menike",
      "departureTime": "08:30:00",
      "arrivalTime": "13:00:00",
      "departureStation": "CMB",
      "destinationStation": "KDY",
      "active": true,
      "createdDateTime": "2026-02-20T11:00:00",
      "updatedDateTime": "2026-02-20T11:00:00"
    }
  ]
}
```

### 2. Get All Destinations
**Endpoint:** `GET /api/user/destinations`  
**Access:** Public  
**Description:** Get list of all active stations/destinations

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": [
    {
      "id": 1,
      "code": "CMB",
      "name": "Colombo Fort",
      "distanceMultiplier": 1.0,
      "description": "Main station in Colombo",
      "active": true,
      "createdDateTime": "2026-02-20T10:00:00",
      "updatedDateTime": "2026-02-20T10:00:00"
    },
    {
      "id": 2,
      "code": "KDY",
      "name": "Kandy",
      "distanceMultiplier": 3.5,
      "description": "Central province main station",
      "active": true,
      "createdDateTime": "2026-02-20T10:05:00",
      "updatedDateTime": "2026-02-20T10:05:00"
    },
    {
      "id": 3,
      "code": "GLN",
      "name": "Galle",
      "distanceMultiplier": 2.8,
      "description": "Southern province station",
      "active": true,
      "createdDateTime": "2026-02-20T10:10:00",
      "updatedDateTime": "2026-02-20T10:10:00"
    }
  ]
}
```

### 3. Get Parcel Types
**Endpoint:** `GET /api/user/parcel-types`  
**Access:** Public  
**Description:** Get list of available parcel types with pricing multipliers

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": [
    {
      "id": 1,
      "code": "DOCUMENT",
      "name": "Document",
      "multiplier": 1.0,
      "description": "Letters, certificates, and documents",
      "active": true
    },
    {
      "id": 2,
      "code": "ELECTRONICS",
      "name": "Electronics",
      "multiplier": 2.5,
      "description": "Mobile phones, laptops, gadgets",
      "active": true
    },
    {
      "id": 3,
      "code": "FRAGILE",
      "name": "Fragile Items",
      "multiplier": 3.0,
      "description": "Glass, ceramics, delicate items",
      "active": true
    },
    {
      "id": 4,
      "code": "GENERAL",
      "name": "General Cargo",
      "multiplier": 1.5,
      "description": "Books, clothes, general items",
      "active": true
    }
  ]
}
```

---

## Admin APIs

**Note:** All admin endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### 1. Register User (Admin/Station Master)
**Endpoint:** `POST /api/admin/register`  
**Access:** Admin Only  
**Description:** Register new admin or station master user

**Request Body:**
```json
{
  "username": "stationmaster1",
  "password": "StationMaster@123",
  "email": "sm1@trainparcel.lk",
  "fullName": "Kamal Perera",
  "nic": "199912345678",
  "mobileNumber": "0771234568",
  "role": "STATION_MASTER",
  "station": "CMB"
}
```

**Field Validations:**
- `username`: Required, unique
- `password`: Required, minimum 8 characters
- `email`: Required, valid email format, unique
- `fullName`: Required
- `nic`: Required, 12 digits
- `mobileNumber`: Required, 10 digits
- `role`: Required, values: "ADMIN", "STATION_MASTER", "CUSTOMER"
- `station`: Required for STATION_MASTER

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "User registered successfully. Status: PENDING",
  "data": {
    "id": 2,
    "username": "stationmaster1",
    "email": "sm1@trainparcel.lk",
    "fullName": "Kamal Perera",
    "role": "STATION_MASTER",
    "status": "PENDING",
    "station": "CMB"
  }
}
```

### 2. Get Admin Dashboard Statistics
**Endpoint:** `GET /api/admin/dashboard`  
**Access:** Admin Only  
**Description:** Get system-wide statistics

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": {
    "totalUsers": 15,
    "activeUsers": 12,
    "totalParcels": 245,
    "totalStations": 8,
    "activeStations": 7,
    "totalTrains": 12,
    "activeTrains": 10
  }
}
```

### 3. Get All Users
**Endpoint:** `GET /api/admin/users`  
**Access:** Admin Only  
**Description:** Get list of all registered users

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@trainparcel.lk",
      "fullName": "System Admin",
      "nic": "200012345678",
      "mobileNumber": "0771234567",
      "role": "ADMIN",
      "status": "ACTIVE",
      "station": null,
      "createdDateTime": "2026-02-20T09:00:00",
      "updatedDateTime": "2026-02-20T09:00:00"
    },
    {
      "id": 2,
      "username": "stationmaster1",
      "email": "sm1@trainparcel.lk",
      "fullName": "Kamal Perera",
      "nic": "199912345678",
      "mobileNumber": "0771234568",
      "role": "STATION_MASTER",
      "status": "PENDING",
      "station": "CMB",
      "createdDateTime": "2026-02-21T10:30:00",
      "updatedDateTime": "2026-02-21T10:30:00"
    }
  ]
}
```

### 4. Change User Status
**Endpoint:** `PUT /api/admin/users/status`  
**Access:** Admin Only  
**Description:** Activate, disable, or set pending status for users

**Request Body:**
```json
{
  "userId": 2,
  "status": "ACTIVE"
}
```

**Status Values:** `ACTIVE`, `PENDING`, `DISABLED`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "User status updated successfully",
  "data": null
}
```

### 5. Get All Stations
**Endpoint:** `GET /api/admin/stations`  
**Access:** Admin Only  
**Description:** Get all stations (active and inactive)

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": [
    {
      "id": 1,
      "code": "CMB",
      "name": "Colombo Fort",
      "distanceMultiplier": 1.0,
      "description": "Main station in Colombo",
      "active": true,
      "createdDateTime": "2026-02-20T10:00:00",
      "updatedDateTime": "2026-02-20T10:00:00"
    }
  ]
}
```

### 6. Add Station
**Endpoint:** `POST /api/admin/stations`  
**Access:** Admin Only  
**Description:** Add new station/destination

**Request Body:**
```json
{
  "code": "JFN",
  "name": "Jaffna",
  "distanceMultiplier": 8.5,
  "description": "Northern province main station",
  "active": true
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Station added",
  "data": {
    "id": 4,
    "code": "JFN",
    "name": "Jaffna",
    "distanceMultiplier": 8.5,
    "description": "Northern province main station",
    "active": true,
    "createdDateTime": "2026-02-22T14:30:00",
    "updatedDateTime": "2026-02-22T14:30:00"
  }
}
```

### 7. Update Station
**Endpoint:** `PUT /api/admin/stations/{id}`  
**Access:** Admin Only  
**Description:** Update station details

**Path Parameter:** `id` - Station ID

**Request Body:**
```json
{
  "code": "JFN",
  "name": "Jaffna Central",
  "distanceMultiplier": 8.8,
  "description": "Northern province main station - Updated",
  "active": true
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Station updated",
  "data": {
    "id": 4,
    "code": "JFN",
    "name": "Jaffna Central",
    "distanceMultiplier": 8.8,
    "description": "Northern province main station - Updated",
    "active": true,
    "createdDateTime": "2026-02-22T14:30:00",
    "updatedDateTime": "2026-02-22T15:00:00"
  }
}
```

### 8. Change Station Status
**Endpoint:** `PATCH /api/admin/stations/{id}/status?active={true|false}`  
**Access:** Admin Only  
**Description:** Activate or deactivate a station

**Path Parameter:** `id` - Station ID  
**Query Parameter:** `active` - true or false

**Example:** `PATCH /api/admin/stations/4/status?active=false`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Station status changed",
  "data": {
    "id": 4,
    "code": "JFN",
    "name": "Jaffna Central",
    "distanceMultiplier": 8.8,
    "description": "Northern province main station - Updated",
    "active": false,
    "createdDateTime": "2026-02-22T14:30:00",
    "updatedDateTime": "2026-02-22T15:30:00"
  }
}
```

### 9. Delete Station
**Endpoint:** `DELETE /api/admin/stations/{id}`  
**Access:** Admin Only  
**Description:** Delete a station

**Path Parameter:** `id` - Station ID

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Station deleted successfully",
  "data": null
}
```

### 10. Get All Trains
**Endpoint:** `GET /api/admin/trains`  
**Access:** Admin Only  
**Description:** Get all trains (active and inactive)

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": [
    {
      "id": 1,
      "trainNumber": "T001",
      "name": "Udarata Menike",
      "departureTime": "06:00:00",
      "arrivalTime": "10:30:00",
      "departureStation": "CMB",
      "destinationStation": "KDY",
      "active": true,
      "createdDateTime": "2026-02-20T10:30:00",
      "updatedDateTime": "2026-02-20T10:30:00"
    }
  ]
}
```

### 11. Add Train
**Endpoint:** `POST /api/admin/trains`  
**Access:** Admin Only  
**Description:** Add new train

**Request Body:**
```json
{
  "trainNumber": "T003",
  "name": "Rajarata Rajini",
  "departureTime": "07:00:00",
  "arrivalTime": "11:30:00",
  "departureStation": "CMB",
  "destinationStation": "ANP",
  "active": true
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Train added",
  "data": {
    "id": 3,
    "trainNumber": "T003",
    "name": "Rajarata Rajini",
    "departureTime": "07:00:00",
    "arrivalTime": "11:30:00",
    "departureStation": "CMB",
    "destinationStation": "ANP",
    "active": true,
    "createdDateTime": "2026-02-22T15:00:00",
    "updatedDateTime": "2026-02-22T15:00:00"
  }
}
```

### 12. Update Train
**Endpoint:** `PUT /api/admin/trains/{id}`  
**Access:** Admin Only  
**Description:** Update train details

**Path Parameter:** `id` - Train ID

**Request Body:**
```json
{
  "trainNumber": "T003",
  "name": "Rajarata Rajini Express",
  "departureTime": "07:30:00",
  "arrivalTime": "12:00:00",
  "departureStation": "CMB",
  "destinationStation": "ANP",
  "active": true
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Train updated",
  "data": {
    "id": 3,
    "trainNumber": "T003",
    "name": "Rajarata Rajini Express",
    "departureTime": "07:30:00",
    "arrivalTime": "12:00:00",
    "departureStation": "CMB",
    "destinationStation": "ANP",
    "active": true,
    "createdDateTime": "2026-02-22T15:00:00",
    "updatedDateTime": "2026-02-22T15:30:00"
  }
}
```

### 13. Change Train Status
**Endpoint:** `PATCH /api/admin/trains/{id}/status?active={true|false}`  
**Access:** Admin Only  
**Description:** Activate or deactivate a train

**Path Parameter:** `id` - Train ID  
**Query Parameter:** `active` - true or false

**Example:** `PATCH /api/admin/trains/3/status?active=false`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Train status changed",
  "data": {
    "id": 3,
    "trainNumber": "T003",
    "name": "Rajarata Rajini Express",
    "departureTime": "07:30:00",
    "arrivalTime": "12:00:00",
    "departureStation": "CMB",
    "destinationStation": "ANP",
    "active": false,
    "createdDateTime": "2026-02-22T15:00:00",
    "updatedDateTime": "2026-02-22T16:00:00"
  }
}
```

### 14. Delete Train
**Endpoint:** `DELETE /api/admin/trains/{id}`  
**Access:** Admin Only  
**Description:** Delete a train

**Path Parameter:** `id` - Train ID

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Train deleted successfully",
  "data": null
}
```

---

## Customer/Parcel APIs

### 1. Calculate Parcel Charges
**Endpoint:** `POST /api/customer/parcel/calculate`  
**Access:** Public  
**Description:** Calculate parcel delivery charges

**Request Body:**
```json
{
  "destination": "KDY",
  "parcelType": "ELECTRONICS",
  "numberOfParcels": 2,
  "weightInKg": 5.5
}
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Charges calculated",
  "data": {
    "baseRate": 500.0,
    "weightCharge": 1650.0,
    "typeCharge": 4125.0,
    "total": 6275.0,
    "currency": "LKR"
  }
}
```

**Calculation Formula:**
- Base Rate: Fixed rate per destination
- Weight Charge: Weight × Distance Multiplier × Base Rate
- Type Charge: Parcel Type Multiplier applied
- Total: Sum of all charges × Number of Parcels

### 2. Book Parcel
**Endpoint:** `POST /api/customer/parcel/book`  
**Access:** Public  
**Description:** Book a parcel for delivery

**Request Body:**
```json
{
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
}
```

**Field Validations:**
- All sender and receiver fields are required
- Email fields must be valid email format
- Date must be in the future
- Weight must be greater than 0
- Number of parcels must be at least 1

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Parcel booked successfully. Tracking Number: TRK20260222001",
  "data": "TRK20260222001"
}
```

### 3. Track Parcel
**Endpoint:** `GET /api/customer/parcel/track/{trackingNumber}`  
**Access:** Public  
**Description:** Track parcel status by tracking number

**Path Parameter:** `trackingNumber` - Parcel tracking number

**Example:** `GET /api/customer/parcel/track/TRK20260222001`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": {
    "trackingNumber": "TRK20260222001",
    "senderName": "Nimal Fernando",
    "senderMobile": "0771234569",
    "senderEmail": "nimal@example.com",
    "startingDestination": "CMB",
    "destination": "KDY",
    "receiverName": "Sunil Jayawardena",
    "receiverEmail": "sunil@example.com",
    "parcelType": "ELECTRONICS",
    "numberOfParcels": 2,
    "deliveryDate": "2026-02-25",
    "weightInKg": 5.5,
    "trainNumber": "T001",
    "totalCharge": 6275.0,
    "status": "PENDING",
    "statusUpdatedAt": "2026-02-22T16:30:00",
    "statusUpdatedBy": null,
    "remarks": null
  }
}
```

**Parcel Status Values:**
- `PENDING` - Initial status when parcel is booked
- `ACCEPTED` - Station master accepted the parcel
- `IN_TRANSIT` - Parcel is on the train
- `ARRIVED` - Parcel reached destination station
- `READY_FOR_PICKUP` - Parcel ready for pickup
- `DELIVERED` - Parcel delivered to receiver
- `CANCELLED` - Booking cancelled
- `REJECTED` - Station master rejected the parcel

### 4. Get My Parcels
**Endpoint:** `GET /api/customer/parcel/my-parcels/{nic}`  
**Access:** Public  
**Description:** Get all parcels sent by a specific NIC

**Path Parameter:** `nic` - Sender's NIC number

**Example:** `GET /api/customer/parcel/my-parcels/199012345678`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": [
    {
      "trackingNumber": "TRK20260222001",
      "senderName": "Nimal Fernando",
      "senderMobile": "0771234569",
      "senderEmail": "nimal@example.com",
      "startingDestination": "CMB",
      "destination": "KDY",
      "receiverName": "Sunil Jayawardena",
      "receiverEmail": "sunil@example.com",
      "parcelType": "ELECTRONICS",
      "numberOfParcels": 2,
      "deliveryDate": "2026-02-25",
      "weightInKg": 5.5,
      "trainNumber": "T001",
      "totalCharge": 6275.0,
      "status": "IN_TRANSIT",
      "statusUpdatedAt": "2026-02-23T08:00:00",
      "statusUpdatedBy": "stationmaster1",
      "remarks": "Parcel loaded on train T001"
    },
    {
      "trackingNumber": "TRK20260220015",
      "senderName": "Nimal Fernando",
      "senderMobile": "0771234569",
      "senderEmail": "nimal@example.com",
      "startingDestination": "CMB",
      "destination": "GLN",
      "receiverName": "Kamal Silva",
      "receiverEmail": "kamal@example.com",
      "parcelType": "DOCUMENT",
      "numberOfParcels": 1,
      "deliveryDate": "2026-02-22",
      "weightInKg": 0.5,
      "trainNumber": "T005",
      "totalCharge": 350.0,
      "status": "DELIVERED",
      "statusUpdatedAt": "2026-02-22T14:00:00",
      "statusUpdatedBy": "stationmaster3",
      "remarks": "Delivered to receiver"
    }
  ]
}
```

---

## Parcel APIs (Alternative Endpoints)

These endpoints under `/api/parcel` provide the same functionality as customer parcel APIs but with a different base path.

### 1. Calculate Parcel Charges
**Endpoint:** `POST /api/parcel/calculate`  
**Access:** Public  
*Same as `/api/customer/parcel/calculate`*

### 2. Book Parcel
**Endpoint:** `POST /api/parcel/book`  
**Access:** Public  
*Same as `/api/customer/parcel/book`*

### 3. Track Parcel
**Endpoint:** `GET /api/parcel/track/{trackingNumber}`  
**Access:** Public  
*Same as `/api/customer/parcel/track/{trackingNumber}`*

---

## Ticket Booking APIs

### 1. Calculate Ticket Fare
**Endpoint:** `POST /api/ticket/calculate`  
**Access:** Public  
**Description:** Calculate ticket fare for journey

**Request Body:**
```json
{
  "originStation": "CMB",
  "destinationStation": "KDY",
  "numberOfPassengers": 2,
  "seatClass": "SECOND"
}
```

**Seat Class Values:**
- `FIRST` - First class (highest fare)
- `SECOND` - Second class (medium fare)
- `THIRD` - Third class (lowest fare)

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Fare calculated",
  "data": {
    "baseFare": 150.0,
    "distanceCharge": 525.0,
    "classMultiplierCharge": 843.75,
    "totalFare": 1687.5,
    "currency": "LKR",
    "estimatedDuration": "4 hours 30 minutes"
  }
}
```

### 2. Book Ticket
**Endpoint:** `POST /api/ticket/book`  
**Access:** Public  
**Description:** Book train ticket

**Request Body:**
```json
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
```

**Field Validations:**
- All fields are required
- Email must be valid format
- Travel date must be in the future
- Number of passengers: 1-10
- Seat class: FIRST, SECOND, or THIRD

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Ticket booked successfully",
  "data": {
    "bookingReference": "BK20260222001",
    "passengerName": "Amara Wijesinghe",
    "passengerNic": "198512345678",
    "passengerMobile": "0771234570",
    "passengerEmail": "amara@example.com",
    "originStation": "CMB",
    "destinationStation": "KDY",
    "trainNumber": "T001",
    "travelDate": "2026-02-28",
    "numberOfPassengers": 2,
    "totalFare": 1687.5,
    "status": "PENDING",
    "seatClass": "SECOND",
    "qrCodeContent": "BK20260222001|T001|2026-02-28|CMB-KDY",
    "estimatedArrivalTime": "10:30:00",
    "createdDateTime": "2026-02-22T16:45:00"
  }
}
```

**Booking Status Values:**
- `PENDING` - Initial status when ticket is booked
- `CONFIRMED` - Booking confirmed
- `CANCELLED` - Booking cancelled
- `COMPLETED` - Journey completed
- `NO_SHOW` - Passenger didn't show up

### 3. Track Booking
**Endpoint:** `GET /api/ticket/track/{bookingReference}`  
**Access:** Public  
**Description:** Track ticket booking status

**Path Parameter:** `bookingReference` - Booking reference number

**Example:** `GET /api/ticket/track/BK20260222001`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": {
    "bookingReference": "BK20260222001",
    "passengerName": "Amara Wijesinghe",
    "originStation": "CMB",
    "destinationStation": "KDY",
    "trainNumber": "T001",
    "travelDate": "2026-02-28",
    "numberOfPassengers": 2,
    "totalFare": 1687.5,
    "status": "CONFIRMED",
    "seatClass": "SECOND",
    "estimatedArrivalTime": "10:30:00",
    "remarks": "Payment confirmed",
    "statusUpdatedAt": "2026-02-22T17:00:00",
    "createdDateTime": "2026-02-22T16:45:00"
  }
}
```

### 4. Get My Bookings
**Endpoint:** `GET /api/ticket/my-bookings/{nic}`  
**Access:** Public  
**Description:** Get all ticket bookings by passenger NIC

**Path Parameter:** `nic` - Passenger's NIC number

**Example:** `GET /api/ticket/my-bookings/198512345678`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": [
    {
      "bookingReference": "BK20260222001",
      "passengerName": "Amara Wijesinghe",
      "originStation": "CMB",
      "destinationStation": "KDY",
      "trainNumber": "T001",
      "travelDate": "2026-02-28",
      "numberOfPassengers": 2,
      "totalFare": 1687.5,
      "status": "CONFIRMED",
      "seatClass": "SECOND",
      "estimatedArrivalTime": "10:30:00",
      "remarks": "Payment confirmed",
      "statusUpdatedAt": "2026-02-22T17:00:00",
      "createdDateTime": "2026-02-22T16:45:00"
    },
    {
      "bookingReference": "BK20260215032",
      "passengerName": "Amara Wijesinghe",
      "originStation": "CMB",
      "destinationStation": "GLN",
      "trainNumber": "T005",
      "travelDate": "2026-02-20",
      "numberOfPassengers": 1,
      "totalFare": 650.0,
      "status": "COMPLETED",
      "seatClass": "THIRD",
      "estimatedArrivalTime": "11:45:00",
      "remarks": "Journey completed",
      "statusUpdatedAt": "2026-02-20T12:00:00",
      "createdDateTime": "2026-02-15T10:30:00"
    }
  ]
}
```

---

## Station Master APIs

**Note:** All station master endpoints require authentication. Include the JWT token in the Authorization header.

### 1. Get Station Master Dashboard
**Endpoint:** `GET /api/station-master/dashboard/{stationCode}`  
**Access:** Station Master, Admin  
**Description:** Get dashboard statistics for a specific station

**Path Parameter:** `stationCode` - Station code (e.g., CMB, KDY)

**Example:** `GET /api/station-master/dashboard/CMB`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": {
    "stationCode": "CMB",
    "stationName": "Colombo Fort",
    "totalParcels": 156,
    "todaysBookings": 12,
    "todaysDeliveries": 8,
    "todaysRevenue": 45780.50
  }
}
```

### 2. Get Latest Parcels
**Endpoint:** `GET /api/station-master/parcels/latest/{stationCode}`  
**Access:** Station Master, Admin  
**Description:** Get latest parcels for a station (limited to recent ones)

**Path Parameter:** `stationCode` - Station code

**Example:** `GET /api/station-master/parcels/latest/CMB`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": [
    {
      "trackingNumber": "TRK20260222005",
      "senderName": "Priyanka Silva",
      "senderMobile": "0771234571",
      "senderEmail": "priyanka@example.com",
      "startingDestination": "CMB",
      "destination": "KDY",
      "receiverName": "Dilshan Fernando",
      "receiverEmail": "dilshan@example.com",
      "parcelType": "DOCUMENT",
      "numberOfParcels": 1,
      "deliveryDate": "2026-02-24",
      "weightInKg": 0.5,
      "trainNumber": "T001",
      "totalCharge": 350.0,
      "status": "PENDING",
      "statusUpdatedAt": "2026-02-22T17:15:00",
      "statusUpdatedBy": null,
      "remarks": null,
      "createdDateTime": "2026-02-22T17:15:00"
    }
  ]
}
```

### 3. Update Parcel Status
**Endpoint:** `PUT /api/station-master/parcels/{trackingNumber}`  
**Access:** Station Master, Admin  
**Description:** Update parcel status and details

**Path Parameter:** `trackingNumber` - Parcel tracking number

**Request Body:**
```json
{
  "status": "ACCEPTED",
  "totalCharge": 350.0,
  "remarks": "Parcel accepted and ready for dispatch"
}
```

**Status Values:** `PENDING`, `ACCEPTED`, `IN_TRANSIT`, `ARRIVED`, `READY_FOR_PICKUP`, `DELIVERED`, `CANCELLED`, `REJECTED`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Parcel updated",
  "data": {
    "trackingNumber": "TRK20260222005",
    "senderName": "Priyanka Silva",
    "senderMobile": "0771234571",
    "senderEmail": "priyanka@example.com",
    "startingDestination": "CMB",
    "destination": "KDY",
    "receiverName": "Dilshan Fernando",
    "receiverEmail": "dilshan@example.com",
    "parcelType": "DOCUMENT",
    "numberOfParcels": 1,
    "deliveryDate": "2026-02-24",
    "weightInKg": 0.5,
    "trainNumber": "T001",
    "totalCharge": 350.0,
    "status": "ACCEPTED",
    "statusUpdatedAt": "2026-02-22T17:30:00",
    "statusUpdatedBy": "stationmaster1",
    "remarks": "Parcel accepted and ready for dispatch",
    "createdDateTime": "2026-02-22T17:15:00"
  }
}
```

### 4. Get Incoming Parcels
**Endpoint:** `GET /api/station-master/parcels/incoming/{stationCode}`  
**Access:** Station Master, Admin  
**Description:** Get parcels arriving at this station (destination matches station)

**Path Parameter:** `stationCode` - Station code

**Example:** `GET /api/station-master/parcels/incoming/KDY`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": [
    {
      "trackingNumber": "TRK20260222001",
      "senderName": "Nimal Fernando",
      "senderMobile": "0771234569",
      "senderEmail": "nimal@example.com",
      "startingDestination": "CMB",
      "destination": "KDY",
      "receiverName": "Sunil Jayawardena",
      "receiverEmail": "sunil@example.com",
      "parcelType": "ELECTRONICS",
      "numberOfParcels": 2,
      "deliveryDate": "2026-02-25",
      "weightInKg": 5.5,
      "trainNumber": "T001",
      "totalCharge": 6275.0,
      "status": "IN_TRANSIT",
      "statusUpdatedAt": "2026-02-23T08:00:00",
      "statusUpdatedBy": "stationmaster1",
      "remarks": "Parcel loaded on train T001",
      "createdDateTime": "2026-02-22T16:30:00"
    }
  ]
}
```

### 5. Get Outgoing Parcels
**Endpoint:** `GET /api/station-master/parcels/outgoing/{stationCode}`  
**Access:** Station Master, Admin  
**Description:** Get parcels departing from this station (starting destination matches station)

**Path Parameter:** `stationCode` - Station code

**Example:** `GET /api/station-master/parcels/outgoing/CMB`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": [
    {
      "trackingNumber": "TRK20260222005",
      "senderName": "Priyanka Silva",
      "senderMobile": "0771234571",
      "senderEmail": "priyanka@example.com",
      "startingDestination": "CMB",
      "destination": "KDY",
      "receiverName": "Dilshan Fernando",
      "receiverEmail": "dilshan@example.com",
      "parcelType": "DOCUMENT",
      "numberOfParcels": 1,
      "deliveryDate": "2026-02-24",
      "weightInKg": 0.5,
      "trainNumber": "T001",
      "totalCharge": 350.0,
      "status": "ACCEPTED",
      "statusUpdatedAt": "2026-02-22T17:30:00",
      "statusUpdatedBy": "stationmaster1",
      "remarks": "Parcel accepted and ready for dispatch",
      "createdDateTime": "2026-02-22T17:15:00"
    }
  ]
}
```

### 6. Get All Parcels by Station
**Endpoint:** `GET /api/station-master/parcels/all/{stationCode}`  
**Access:** Station Master, Admin  
**Description:** Get all parcels related to this station (incoming + outgoing)

**Path Parameter:** `stationCode` - Station code

**Example:** `GET /api/station-master/parcels/all/CMB`

**Success Response (200):**
```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Success",
  "data": [
    {
      "trackingNumber": "TRK20260222001",
      "senderName": "Nimal Fernando",
      "senderMobile": "0771234569",
      "senderEmail": "nimal@example.com",
      "startingDestination": "CMB",
      "destination": "KDY",
      "receiverName": "Sunil Jayawardena",
      "receiverEmail": "sunil@example.com",
      "parcelType": "ELECTRONICS",
      "numberOfParcels": 2,
      "deliveryDate": "2026-02-25",
      "weightInKg": 5.5,
      "trainNumber": "T001",
      "totalCharge": 6275.0,
      "status": "IN_TRANSIT",
      "statusUpdatedAt": "2026-02-23T08:00:00",
      "statusUpdatedBy": "stationmaster1",
      "remarks": "Parcel loaded on train T001",
      "createdDateTime": "2026-02-22T16:30:00"
    },
    {
      "trackingNumber": "TRK20260222005",
      "senderName": "Priyanka Silva",
      "senderMobile": "0771234571",
      "senderEmail": "priyanka@example.com",
      "startingDestination": "CMB",
      "destination": "KDY",
      "receiverName": "Dilshan Fernando",
      "receiverEmail": "dilshan@example.com",
      "parcelType": "DOCUMENT",
      "numberOfParcels": 1,
      "deliveryDate": "2026-02-24",
      "weightInKg": 0.5,
      "trainNumber": "T001",
      "totalCharge": 350.0,
      "status": "ACCEPTED",
      "statusUpdatedAt": "2026-02-22T17:30:00",
      "statusUpdatedBy": "stationmaster1",
      "remarks": "Parcel accepted and ready for dispatch",
      "createdDateTime": "2026-02-22T17:15:00"
    }
  ]
}
```

---

## Common Response Structure

All API responses follow the same base structure:

```json
{
  "statusCode": 200,
  "title": "Success",
  "message": "Operation completed successfully",
  "data": { ... }
}
```

**Response Fields:**
- `statusCode`: HTTP status code (200 for success, 400 for error)
- `title`: "Success" or "Failed"
- `message`: Human-readable message
- `data`: Response payload (can be object, array, string, or null)

---

## Error Handling

### Common Error Responses

**Authentication Error (401):**
```json
{
  "statusCode": 401,
  "title": "Failed",
  "message": "Unauthorized access",
  "data": null
}
```

**Validation Error (400):**
```json
{
  "statusCode": 400,
  "title": "Failed",
  "message": "Sender's name is required",
  "data": null
}
```

**Not Found Error (404):**
```json
{
  "statusCode": 400,
  "title": "Failed",
  "message": "Parcel not found with tracking number: TRK20260222999",
  "data": null
}
```

**Server Error (500):**
```json
{
  "statusCode": 500,
  "title": "Failed",
  "message": "Internal server error",
  "data": null
}
```

### Common Error Messages

**Login Errors:**
- "Invalid Username or Password. Recheck and try again"
- "Awaiting Admin Approval. Please Contact the Admin"
- "User Has Disabled. Please Contact the Admin"

**Registration Errors:**
- "Username already exists."
- "Email already exists."

**Validation Errors:**
- "Destination is required"
- "Weight must be greater than 0"
- "Date must be in the future"
- "Invalid email format"

---

## API Testing Guide

### Using cURL

**Login Example:**
```bash
curl -X POST http://localhost:8082/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

**Authenticated Request Example:**
```bash
curl -X GET http://localhost:8082/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Using PowerShell (Invoke-RestMethod)

**Login Example:**
```powershell
$body = '{"username":"admin","password":"Admin@123"}'
$response = Invoke-RestMethod -Uri "http://localhost:8082/api/user/login" `
  -Method POST -ContentType "application/json" -Body $body
$token = $response.data.token
```

**Authenticated Request Example:**
```powershell
$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}
$response = Invoke-RestMethod -Uri "http://localhost:8082/api/admin/dashboard" `
  -Method GET -Headers $headers
```

### Using Postman

1. **Set Base URL:** `http://localhost:8082`
2. **Login:** 
   - POST `/api/user/login`
   - Body (raw JSON): `{"username":"admin","password":"Admin@123"}`
   - Save the token from response
3. **Authenticated Requests:**
   - Add header: `Authorization: Bearer <token>`
   - Make your API calls

---

## Frontend Integration Notes

### 1. Authentication Flow
```javascript
// Login
const loginResponse = await fetch('http://localhost:8082/api/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'Admin@123' })
});
const loginData = await loginResponse.json();
const token = loginData.data.token;

// Store token in localStorage
localStorage.setItem('authToken', token);
localStorage.setItem('userRole', loginData.data.role);
localStorage.setItem('userName', loginData.data.userName);
```

### 2. Making Authenticated Requests
```javascript
const token = localStorage.getItem('authToken');

const response = await fetch('http://localhost:8082/api/admin/dashboard', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### 3. Error Handling
```javascript
try {
  const response = await fetch('http://localhost:8082/api/parcel/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parcelData)
  });
  
  const result = await response.json();
  
  if (result.statusCode === 200) {
    // Success - show tracking number
    alert(`Parcel booked! Tracking: ${result.data}`);
  } else {
    // Error - show error message
    alert(`Error: ${result.message}`);
  }
} catch (error) {
  console.error('Network error:', error);
  alert('Failed to connect to server');
}
```

### 4. Role-Based Routing
```javascript
const userRole = localStorage.getItem('userRole');

switch(userRole) {
  case 'ADMIN':
    // Show admin dashboard
    window.location.href = '/admin/dashboard';
    break;
  case 'STATION_MASTER':
    // Show station master dashboard
    const station = localStorage.getItem('station');
    window.location.href = `/station-master/dashboard/${station}`;
    break;
  case 'CUSTOMER':
    // Show customer dashboard
    window.location.href = '/customer/dashboard';
    break;
  default:
    window.location.href = '/login';
}
```

### 5. CORS Configuration
The backend has CORS enabled. Allowed origins, methods, and headers are configured in `CorsConfig.java`.

---

## API Endpoint Summary

### Public Endpoints (No Authentication Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/login` | User login |
| GET | `/api/user/trains` | Get all trains |
| GET | `/api/user/destinations` | Get all destinations |
| GET | `/api/user/parcel-types` | Get parcel types |
| POST | `/api/parcel/calculate` | Calculate parcel charges |
| POST | `/api/parcel/book` | Book parcel |
| GET | `/api/parcel/track/{trackingNumber}` | Track parcel |
| POST | `/api/customer/parcel/calculate` | Calculate parcel charges |
| POST | `/api/customer/parcel/book` | Book parcel |
| GET | `/api/customer/parcel/track/{trackingNumber}` | Track parcel |
| GET | `/api/customer/parcel/my-parcels/{nic}` | Get parcels by NIC |
| POST | `/api/ticket/calculate` | Calculate ticket fare |
| POST | `/api/ticket/book` | Book ticket |
| GET | `/api/ticket/track/{bookingReference}` | Track ticket |
| GET | `/api/ticket/my-bookings/{nic}` | Get bookings by NIC |

### Admin Endpoints (Authentication Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/register` | Register user |
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/status` | Change user status |
| GET | `/api/admin/stations` | Get all stations |
| POST | `/api/admin/stations` | Add station |
| PUT | `/api/admin/stations/{id}` | Update station |
| PATCH | `/api/admin/stations/{id}/status` | Change station status |
| DELETE | `/api/admin/stations/{id}` | Delete station |
| GET | `/api/admin/trains` | Get all trains |
| POST | `/api/admin/trains` | Add train |
| PUT | `/api/admin/trains/{id}` | Update train |
| PATCH | `/api/admin/trains/{id}/status` | Change train status |
| DELETE | `/api/admin/trains/{id}` | Delete train |

### Station Master Endpoints (Authentication Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/station-master/dashboard/{stationCode}` | Station dashboard |
| GET | `/api/station-master/parcels/latest/{stationCode}` | Latest parcels |
| PUT | `/api/station-master/parcels/{trackingNumber}` | Update parcel |
| GET | `/api/station-master/parcels/incoming/{stationCode}` | Incoming parcels |
| GET | `/api/station-master/parcels/outgoing/{stationCode}` | Outgoing parcels |
| GET | `/api/station-master/parcels/all/{stationCode}` | All parcels |

---

## Version History

- **v1.0.0** (February 22, 2026) - Initial API documentation

---

## Support

For API support and questions:
- Email: support@trainparceladvisor.lk
- Server Port: 8082
- Database: MySQL (localhost:3306/train_parcel_advisor_sl)

---

**End of API Documentation**

