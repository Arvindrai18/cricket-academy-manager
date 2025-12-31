# Cricket Academy Manager

A comprehensive web application designed for cricket academies to streamline their operations. This system handles student management, batch scheduling, fee collection (with online payment integration), attendance tracking, and live match scoring.

## 🚀 Features

### 🏢 Academy Management
- **Dashboard**: Overview of total students, collected fees, and active batches.
- **Profile**: Manage academy details and subscription plans.

### 👥 Student & Batch Management
- **Student Records**: Maintain detailed profiles including batting/bowling styles and parent contact info.
- **Batches**: Organize students into batches with assigned coaches and schedules.
- **Attendance**: Daily attendance tracking for each batch.

### 💰 Fee Management
- **Payment Tracking**: Record cash, bank transfer, and UPI payments.
- **Online Payments**: Integrated **Razorpay** gateway for seamless online fee collection.
- **Dues Management**: Track pending fees and due dates.
- **History**: View comprehensive transaction history for every student.

### 🏏 Match Center
- **Live Scoring**: Ball-by-ball scoring interface for matches.
- **Match Management**: Schedule matches between internal or external teams.
- **Statistics**: Track extras, wickets, and run rates.

### 📊 Analytics
- Visual insights into academy performance (using Recharts).

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) (powered by [Vite](https://vitejs.dev/))
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Custom Design System)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **HTTP Client**: Axios

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: SQLite (Stored locally)
- **Authentication**: JWT (JSON Web Tokens)
- **Payments**: Razorpay Node SDK

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (Node Package Manager)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd akr
```

### 2. Backend Setup
The backend runs on port `3000` by default.

```bash
cd server
npm install
```

**Environment Variables**:
Create a `.env` file in the `server` directory (optional for dev, required for payments):
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

**Initialize Database**:
```bash
npm run init-db
```

**Start Server**:
```bash
npm run dev
```

### 3. Frontend Setup
The frontend runs on port `5173` by default.

```bash
cd client
npm install
```

**Start Client**:
```bash
npm run dev
```

## 📄 API Overview

| Method | Endpoint | Description |
|Args|---|---|
| POST | `/api/academies/register` | Register new academy |
| POST | `/api/academies/login` | Login academy owner |
| GET | `/api/students/:academyId` | Get all students |
| POST | `/api/students` | Add new student |
| GET | `/api/batches/:academyId` | Get all batches |
| POST | `/api/payments` | Record manual payment |
| POST | `/api/payments/create-order` | Initiate Razorpay order |
| POST | `/api/matches/score` | Update match score |

## 🤝 Contributing
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📝 License
This project is licensed under the MIT License.
