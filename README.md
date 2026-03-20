# Smart Student Health & Career Support System (SSHCS)

A MERN stack application for university students to manage their health and career support needs.

## Features

- Health tracking and support
- Career guidance and planning
- Student dashboard

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB

## Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies for root, backend, and frontend:

```bash
npm run install-all
```

### Running the Application

To run both backend and frontend concurrently:

```bash
npm run dev
```

Or run separately:

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The backend will run on `http://localhost:5000` and frontend on `http://localhost:5173`.

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your values:

- `PORT`: Server port (default 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens

## Project Structure

```
sshcs/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── package.json
├── docs/
├── README.md
├── .gitignore
└── package.json
```