# stay-as-home-

A modern, high-performance React + Vite frontend for the QuickStay Hotel Booking and Management System.

## 🚀 Features

- **🏨 Browse & Book Rooms**: Search and filter luxury rooms, view details, amenities, and dynamic pricing.
- **🔐 Clerk Authentication**: User sign up, sign in, and profile management with Clerk.
- **💳 Cashfree Payments**: Seamless checkout integration with official Cashfree JS SDK v3.
- **🏢 Hotel Owner Dashboard**: Real-time analytics, revenue, active guest tracking, and room management.
- **⚡ Fast & Modern**: Built with React 19, Vite, Tailwind CSS v4, and React Router v7.
- **☁️ Vercel Ready**: Preconfigured with `vercel.json` SPA routing rewrites.

## 🛠️ Tech Stack

- **React 19**
- **Vite 8**
- **Tailwind CSS v4**
- **React Router v7**
- **@clerk/clerk-react**
- **@cashfreepayments/cashfree-js**

## 🏁 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Abhishekkumar2590/stay-as-home-.git
cd stay-as-home-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_dG91Y2hlZC1kdWNrLTk5LmNsZXJrLmFjY291bnRzLmRldiQ
VITE_API_URL=http://127.0.0.1:8000/api
```

### 4. Run development server
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
```

## 📜 License
MIT
