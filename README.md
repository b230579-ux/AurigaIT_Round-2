# TiffinBox — Lunch Delivery & Pro-Rated Billing Service

A modern decoupled system for home-style tiffin delivery services. Customers subscribe to monthly plans for weekday lunches, pause whenever life happens (travel, festivals), and are billed pro-rated at month-end exclusively for the days actually served.

---

## 📁 Repository Structure

```
AurigaIT/
├── backend/                  # Java 17 + Spring Boot 3 REST API
│   ├── src/                  # Controllers, Entities, Repositories, Services, Security
│   ├── data/                 # Embedded H2 Database (tiffindb.mv.db)
│   ├── pom.xml               # Maven configuration
│   └── mvnw.cmd              # Maven wrapper
│
└── frontend/                 # Angular 18 Single-Page Application
    ├── src/
    │   ├── app/
    │   │   ├── components/   # Navbar, Landing, Login, Register, Dashboard
    │   │   ├── guards/       # Route guards (AuthGuard)
    │   │   ├── interceptors/ # HTTP JWT Bearer Interceptor
    │   │   ├── models/       # TypeScript interfaces
    │   │   └── services/     # AuthService, TiffinService
    │   ├── environments/     # API endpoints configuration
    │   └── styles.css        # Global CSS design system
    ├── angular.json
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Start the Backend (Spring Boot)
Open a terminal in `backend/`:
```bash
cd backend
.\mvnw.cmd spring-boot:run
```
* **API Base URL**: `http://localhost:8080/api`
* **Swagger UI / OpenAPI**: `http://localhost:8080/swagger-ui/index.html`
* **H2 Database Console**: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:file:./data/tiffindb`
  - Username: `sa`
  - Password: *(leave blank)*

### 2. Start the Frontend (Angular)
Open another terminal in `frontend/`:
```bash
cd frontend
npm start
```
* **Web App**: `http://localhost:4200`

---

## 🔑 Default Seed Credentials
The backend automatically seeds an owner account and 4 customers upon first run:

| Role | Email | Password | Phone |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner@tiffin.com` | `password123` | `9876543210` |
| Customer (Anita Desai - Paused Demo) | `anita@example.com` | `password123` | `9876543211` |
| Customer (Vikram Patel) | `vikram@example.com` | `password123` | `9876543212` |
| Customer (Priya Sharma) | `priya@example.com` | `password123` | `9876543213` |
| Customer (Rahul Verma) | `rahul@example.com` | `password123` | `9876543214` |

---

## ✨ Features

1. **One-Page Product Landing**: Modern marketing page with interactive live calculator, feature highlights, 3-step workflow, transparent pricing tiers, and call-to-actions.
2. **JWT Authentication & Role Control**:
   - Customer and Owner registration with 10-digit phone and password.
   - Secure login with JWT token storage, automatic request header injection via Angular HTTP Interceptor, and route guards.
3. **Owner Operations Dashboard**:
   - Real-time statistics: Total customers, active deliveries today, currently paused customers, estimated monthly revenue.
   - Fast lookup by phone number or name search.
   - Filter tabs: All, Active, Paused.
4. **Pause & Resume Workflow**:
   - 1-click pause with custom reasons.
   - 1-click resume.
   - Paused weekdays are not counted in monthly billing.
5. **Fair Pro-Rated Month-End Billing**:
   - Formula: $\text{Daily Rate} = \frac{\text{Plan Price}}{\text{Total Weekdays in Month}}$
   - Final Bill: $\text{Billed Amount} = \text{Daily Rate} \times \text{Delivered Weekdays}$
   - Transparent breakdown table showing total weekdays, paused days, delivered days, and final amount.
