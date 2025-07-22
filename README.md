# InstaDrive - Car Rental System


## 📑 Table of Contents
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [Screenshots](#-screenshots)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Overview](#-api-overview)
- [Security Highlights](#-security-highlights)
- [Responsive & Modern UI](#-responsive--modern-ui)
- [Production Deployment](#-production-deployment)
- [Testing & Demo](#-testing--demo)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🚗 Features

- **Car Management:**
  - Browse cars with detailed specs and images
  - Real-time availability and search/filter
- **Booking System:**
  - Full booking lifecycle (create, confirm, cancel, return)
  - Date selection with validation and real-time price calculation
- **Payment Processing:**
  - Secure payments (SSL, Stripe, UPI, Cards)
  - Real-time validation, receipts, and refunds
- **User Dashboard:**
  - Track, manage, and view booking history
  - Cancel bookings with auto-refunds
- **Admin Tools:**
  - Manage cars, users, and bookings (via API and admin pages)
- **Responsive Design:**
  - Mobile-first, works on all devices
- **Security:**
  - JWT authentication, password encryption, CORS, input validation

---

## 🛠️ Technology Stack

### Backend
- **Framework:** Spring Boot 3.x
- **Database:** MySQL 8+
- **Security:** JWT, BCrypt
- **Payment:** Stripe Integration
- **Build Tool:** Maven
- **Key Dependencies:**
  - spring-boot-starter-data-jpa, spring-boot-starter-web, spring-boot-starter-security
  - jjwt (JWT), stripe-java, itextpdf, pdfbox, lombok

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Routing:** React Router DOM
- **Key Dependencies:**
  - react, react-dom, react-router-dom, axios, react-icons, react-toastify, @stripe/react-stripe-js

---

## 📁 Project Structure

```
InstaDrive-CRS/
├── README.md
├── PROJECT_STRUCTURE.md
├── BackEnd/           # Spring Boot backend
│   ├── src/
│   │   ├── main/java/com/alphaweb/instadrive/
│   │   │   ├── controller/   # REST Controllers
│   │   │   ├── service/      # Business Logic
│   │   │   ├── entity/       # JPA Entities
│   │   │   ├── repository/   # Data Access
│   │   │   ├── dto/          # Data Transfer Objects
│   │   │   ├── config/ util/ exception/
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── pom.xml
│   └── FrontEnd/
│       └── project/
│           ├── public/
│           └── src/
│               ├── components/   # UI, Auth, Layout
│               ├── pages/        # User, Admin, Auth
│               ├── services/     # API services
│               ├── utils/ data/ contexts/
│               ├── App.jsx main.jsx index.css
│           ├── package.json vite.config.js tailwind.config.js
```

---

## ⚡ Quick Start

### Backend
```bash
cd BackEnd
mvn clean install
mvn spring-boot:run
```
- Runs at: [http://localhost:8080](http://localhost:8080)

### Frontend
```bash
cd FrontEnd/project
npm install
npm run dev
```
- Runs at: [http://localhost:5173](http://localhost:5173)

---

## 🔧 Configuration

### Backend (`BackEnd/src/main/resources/application.properties`)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/instadrive
spring.datasource.username=your_username
spring.datasource.password=your_password
jwt.secret=your_jwt_secret
jwt.expiration=86400000
stripe.api.key=your_stripe_secret_key
```

### Frontend (`FrontEnd/project/src/services/api.js`)
```js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
```

---

## 🧩 API Overview

### Authentication
- `POST /api/auth/login` — User login
- `POST /api/auth/register` — User registration

### Cars
- `GET /api/cars` — List all cars
- `GET /api/cars/{id}` — Car details
- `GET /api/cars/{id}/availability` — Check availability

### Bookings
- `POST /api/bookings` — Create booking
- `GET /api/bookings/user/{userId}` — User bookings
- `PUT /api/bookings/{id}/return` — Return car
- `DELETE /api/bookings/{id}` — Cancel booking

### Payments
- `POST /api/payments/card` — Card payment
- `POST /api/payments/upi` — UPI payment
- `POST /api/payments/booking/{id}/refund` — Refund

---

## 🔒 Security Highlights
- **JWT Authentication** for all protected endpoints
- **BCrypt** password hashing
- **CORS** configuration for safe cross-origin requests
- **Input validation** and SQL injection protection
- **Frontend:** Secure token storage, protected routes, XSS protection

---

## 📱 Responsive & Modern UI
- Built with Tailwind CSS (mobile-first)
- Works on all modern browsers and devices

---

## 🚀 Production Deployment

### Backend
```bash
cd BackEnd
mvn clean package
java -jar target/instadrive-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd FrontEnd/project
npm run build
# Deploy the dist/ folder to your web server
```

---

## 🧪 Testing & Demo
- **Quick Payment Test:** [http://localhost:5173/user/payment-test](http://localhost:5173/user/payment-test) (pre-filled test data)
- **Sample User Flow:**
  1. Browse cars → select dates → check availability
  2. Book car → make payment (Card/UPI)
  3. Manage bookings in dashboard

---

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**InstaDrive** — Your complete car rental solution! 🚗✨
