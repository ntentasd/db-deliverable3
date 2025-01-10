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
