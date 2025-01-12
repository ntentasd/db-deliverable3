# DataDrive

## Overview

The DataDrive project is a comprehensive application designed to manage and interact with a relational database efficiently. It provides a seamless interface for performing CRUD (Create, Read, Update, Delete) operations on the DataDrive database, enabling users to store and retrieve data quickly and securely. The project is built with the following tech stack:

- Backend: A Go-based RESTful API for handling business logic and database operations.
- Frontend: A React-based user interface for interacting with the application intuitively.
- Database: MySQL for reliable data storage and retrieval.
- Caching: Memcached for database offloading.
---

## Prerequisites

Ensure the following are installed on your system:
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Services

The `docker-compose.yml` defines the following services:

1. **MySQL**: Database service (version 8.0.40)
2. **Memcached**: Caching service (version 1.6)
3. **DataDrive App**: Backend application
4. **DataDrive UI**: Frontend application

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/ntentasd/db-deliverable3
cd db-deliverable3
```

### 2. Start the containerized services

```bash
docker compose up --build
```

## Setup without using docker

### 1. Install dependencies

Ensure the following are installed on your system:
- [Golang](https://go.dev/dl/)
- [Node](https://nodejs.org/)

### 2. Set up the environment

1. Create a .env file in the root directory, and setup the following environment variables:
  - DB_HOST
  - DB_PORT
  - DB_NAME
  - DB_USER
  - DB_PASSWORD
  - JWT_SECRET

2. Source the file
```bash
source .env
```

3. Create a .env file in the frontend directory, and set up the backend  url:
   - REACT_APP_BACKEND_URL (set it to http://localhost:8000)

4. Source the file
```bash
source frontend/.env
```

### 3. Run the api application

```bash
go run ./cmd/api/main.go
```

### 4. Install npm dependencies

```bash
cd frontend
npm install
```

### 5. Run the frontend application

```bash
npm run dev
```

---
## How to use the app

### Login/Signup

You can create a user or log in via the Login/Signup button on the Navbar, to experience a user's perspective. You can also login as admin, in order to access admin features, like adding cars or changing their attributes (prices, services, damages) in order to alter the data users see. The admin credentials are:

Email: ```admin@datadrive.com```

Password: ```password```

---
### Rent a car

You can rent a car, starting a trip, by heading to the trips page, after signing in to the app. In the rent page, you can inspect the available cars and rent them. After renting, a modal appears while the trip is active. Click on stop trip to start the process. Since this is a demo app, you have to manually assign the trip's distance and driving behavior, simulating sensor data input, as well as selecting the desired payment method. After that, you can optionally leave a review. The rent page displays paginated data.

---
### View trips

All trips are logged in the trips page, in descending chronological order. Each trip component informs the user about the trip metadata, as well as the payment method and driving behavior. The trips page displays paginated data.

---
### Buy a subscription

In the subscriptions page, you can select which subscription to buy, between the three provided tiers. Once a subscription is active, all trips assume a payment method of type subscription (and therefore no additional money is required) upon stoppping. The user is also not allowed to purchase a new one, without cancelling the active one.

---
### View your profile

In the profile page, you can view your user data, along with the calculated driving behavior adjusted by all your trips. This page provides features like changing the username or full name (unfortunately not the email, since it is the primary key) or deleting the account entirely. By clicking on the settings button, you are redirected to the settings page, where the optimal settings for each user are registered, regarding the DataDrive car fleet. At first, you can fill in the form, skipping the fields you don't want to set. You can come back to this page, and edit any field you desire.

---
### Manage cars

By logging in as admin, you can navigate to the cars page and register a new car, or adjust a car's details. You can also click on a car and view/change the services and damages recorded for the selected car. The cars page displays paginated data.
