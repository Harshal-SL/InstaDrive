# InstaDrive - Project Structure

## 📁 Clean Project Structure

```
InstaDrive - CRS/
├── README.md                           # Main project documentation
├── PROJECT_STRUCTURE.md               # This file
│
├── BackEnd/                           # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/alphaweb/instadrive/
│   │   │   │   ├── InstaDriveApplication.java
│   │   │   │   ├── config/             # Configuration classes
│   │   │   │   ├── controller/         # REST Controllers
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── BookingController.java
│   │   │   │   │   ├── CarController.java
│   │   │   │   │   ├── PaymentController.java
│   │   │   │   │   └── UserController.java
│   │   │   │   ├── dto/                # Data Transfer Objects
│   │   │   │   ├── entity/             # JPA Entities
│   │   │   │   │   ├── Booking.java
│   │   │   │   │   ├── Car.java
│   │   │   │   │   ├── Payment.java
│   │   │   │   │   └── User.java
│   │   │   │   ├── repository/         # JPA Repositories
│   │   │   │   ├── service/            # Business Logic
│   │   │   │   │   ├── BookingService.java
│   │   │   │   │   ├── CarService.java
│   │   │   │   │   ├── PaymentService.java
│   │   │   │   │   ├── ScheduledTaskService.java
│   │   │   │   │   └── UserService.java
│   │   │   │   └── util/               # Utility classes
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── static/
│   │   └── test/                       # Test files
│   ├── pom.xml                         # Maven configuration
│   └── mvnw                           # Maven wrapper
│
└── FrontEnd/                          # React Frontend
    └── project/
        ├── public/                     # Static assets
        │   ├── index.html
        │   └── favicon.ico
        ├── src/
        │   ├── components/             # Reusable components
        │   │   ├── Auth/
        │   │   ├── Layout/
        │   │   └── UI/
        │   ├── data/                   # Sample data
        │   │   └── sampleCars.js
        │   ├── pages/                  # Page components
        │   │   ├── Admin/
        │   │   ├── Auth/
        │   │   └── User/
        │   │       ├── BookingSuccess.jsx
        │   │       ├── CarDetails.jsx
        │   │       ├── Dashboard.jsx
        │   │       ├── MyBookings.jsx
        │   │       ├── Payment.jsx
        │   │       └── PaymentTest.jsx
        │   ├── services/               # API services
        │   │   ├── api.js
        │   │   ├── authService.js
        │   │   ├── bookingService.js
        │   │   ├── carService.js
        │   │   └── paymentService.js
        │   ├── utils/                  # Utility functions
        │   ├── App.jsx                 # Main app component
        │   ├── index.css              # Global styles
        │   └── main.jsx               # App entry point
        ├── package.json               # Dependencies
        ├── vite.config.js            # Vite configuration
        └── tailwind.config.js        # Tailwind configuration
```

## 🗂️ Key Directories Explained

### **Backend Structure**

#### **Controllers** (`src/main/java/.../controller/`)
- Handle HTTP requests and responses
- Implement REST API endpoints
- Manage request validation and error handling

#### **Services** (`src/main/java/.../service/`)
- Contain business logic
- Handle data processing and validation
- Manage interactions between controllers and repositories

#### **Entities** (`src/main/java/.../entity/`)
- JPA entity classes representing database tables
- Define relationships between data models
- Include validation annotations

#### **Repositories** (`src/main/java/.../repository/`)
- Data access layer using Spring Data JPA
- Custom query methods
- Database interaction interfaces

### **Frontend Structure**

#### **Components** (`src/components/`)
- **Auth/**: Authentication-related components
- **Layout/**: Page layout components (Header, Footer, Sidebar)
- **UI/**: Reusable UI components (Buttons, Forms, Modals)

#### **Pages** (`src/pages/`)
- **Admin/**: Admin dashboard and management pages
- **Auth/**: Login and registration pages
- **User/**: User-facing pages (Dashboard, Bookings, Payment)

#### **Services** (`src/services/`)
- API communication layer
- HTTP request handling
- Data transformation and error handling

## 🔧 Configuration Files

### **Backend Configuration**
- **`pom.xml`**: Maven dependencies and build configuration
- **`application.properties`**: Spring Boot application settings
- **Database configuration**: MySQL connection settings
- **Security configuration**: JWT and CORS settings

### **Frontend Configuration**
- **`package.json`**: NPM dependencies and scripts
- **`vite.config.js`**: Vite build tool configuration
- **`tailwind.config.js`**: Tailwind CSS customization
- **`index.html`**: Main HTML template

## 📊 Data Flow

### **User Booking Flow**
1. **Frontend**: User selects car and dates
2. **API Call**: Frontend sends booking request
3. **Controller**: BookingController receives request
4. **Service**: BookingService processes business logic
5. **Repository**: Data saved to database
6. **Response**: Confirmation sent back to frontend

### **Payment Processing Flow**
1. **Frontend**: User submits payment details
2. **API Call**: Payment request sent to backend
3. **Controller**: PaymentController handles request
4. **Service**: PaymentService processes payment
5. **External**: Stripe/Payment gateway integration
6. **Database**: Payment record saved
7. **Response**: Payment confirmation returned

## 🚀 Build and Deployment

### **Backend Build**
```bash
cd BackEnd
mvn clean package
```
Generates: `target/instadrive-0.0.1-SNAPSHOT.jar`

### **Frontend Build**
```bash
cd FrontEnd/project
npm run build
```
Generates: `dist/` folder with optimized static files

## 🔒 Security Implementation

### **Backend Security**
- JWT token-based authentication
- Password encryption with BCrypt
- CORS configuration for cross-origin requests
- Input validation and sanitization

### **Frontend Security**
- Secure token storage
- Protected routes with authentication guards
- Input validation on forms
- XSS protection with React's built-in sanitization

## 📱 Responsive Design

The application uses Tailwind CSS for responsive design:
- **Mobile-first approach**
- **Breakpoint-based responsive classes**
- **Flexible grid and flexbox layouts**
- **Optimized for all screen sizes**

## 🎯 Production Ready Features

- **Error Handling**: Comprehensive error management
- **Loading States**: User feedback during async operations
- **Form Validation**: Real-time input validation
- **Data Persistence**: Local storage for offline capability
- **Performance Optimization**: Code splitting and lazy loading
- **SEO Optimization**: Meta tags and semantic HTML

This clean structure provides a solid foundation for a production-ready car rental system! 🚗✨
