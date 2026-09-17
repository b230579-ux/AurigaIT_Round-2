# 🍱 TiffinBox — Lunch Delivery & Pro-Rated Billing Service

A modern, decoupled web application for home-style tiffin delivery services. Customers subscribe to monthly meal plans for weekday lunches, pause whenever life happens (festivals, travel, illness), and are billed pro-rated at month-end exclusively for the meals actually served.

---

## 📁 Repository Structure

```
AurigaIT/
├── backend/                      # Java 17 + Spring Boot 3 REST API
│   ├── src/main/java/com/tiffin/
│   │   ├── config/              # SecurityConfig (JWT, CORS, route authorization)
│   │   ├── controller/          # REST Controllers (Auth, Customer, Subscriptions, Billing, Clock, Import)
│   │   ├── dto/                 # Request & Response Transfer Objects
│   │   ├── entity/              # JPA Entities (User, Subscription, PausePeriod, OutboxMessage, SubscriptionTransfer)
│   │   ├── repository/          # Spring Data JPA Repositories
│   │   ├── security/            # JWT Token Provider & Filter, CustomUserDetailsService
│   │   ├── service/             # Business Logic (Subscription, Billing, Clock, DataImport, DataSeeder)
│   │   └── TiffinServiceApplication.java
│   ├── src/main/resources/
│   │   └── application.properties # Server port, H2 datasource with AUTO_SERVER mode, JWT config
│   ├── data/                    # Persisted H2 database file (tiffindb.mv.db)
│   ├── pom.xml                  # Maven configuration
│   └── mvnw.cmd                 # Maven wrapper script
│
├── frontend/                     # Angular 18 Single-Page Application
│   ├── src/app/
│   │   ├── components/          # Navbar, Landing, Login, Register, Dashboard (Role-based Owner & Customer)
│   │   ├── guards/              # Route Guards (AuthGuard)
│   │   ├── interceptors/        # HTTP JWT Interceptor (attaches Bearer token)
│   │   ├── models/              # TypeScript Data Contracts
│   │   └── services/            # AuthService, TiffinService
│   ├── src/environments/        # Environment configurations (API URL: http://localhost:8080/api)
│   ├── angular.json             # Angular build config
│   └── package.json             # Node dependencies
│
├── README.md                    # Setup, running, debugging & API catalog
├── REASONING.md                 # Design decisions, test strategy & issue resolution
└── AI_LOGS.md                   # Unmodified raw AI tool conversation logs
```

---

## 🚀 How to Set Up and Run

### Prerequisites
- **Java**: JDK 17 or higher (`java -version`)
- **Node.js**: Node 18+ or Node 20+ (`node -v`)
- **npm**: npm 9+ or 10+ (`npm -v`)

---

### 1️⃣ Step 1: Start the Backend (Spring Boot 3)

1. Open a terminal and navigate to `backend/`:
   ```powershell
   cd e:\ppr\AurigaIT\backend
   ```
2. Launch the application via the Maven wrapper:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
3. The backend starts on port `8080`:
   - **API Base URL**: `http://localhost:8080/api`
   - **H2 Web Console**: `http://localhost:8080/h2-console`
     - **JDBC URL**: `jdbc:h2:file:./data/tiffindb;AUTO_SERVER=TRUE`
     - **User**: `sa`
     - **Password**: *(leave blank)*

> **Automatic Data Seeding**: On first run, `DataSeeder.java` automatically initializes default plans (`BASIC` ₹2,000, `STANDARD` ₹3,000, `PREMIUM` ₹4,500), an Owner account, and sample customers with active/paused subscriptions.

---

### 2️⃣ Step 2: Start the Frontend (Angular 18)

1. Open a separate terminal and navigate to `frontend/`:
   ```powershell
   cd e:\ppr\AurigaIT\frontend
   ```
2. Install dependencies (if not already installed):
   ```powershell
   npm install
   ```
3. Start the Angular development server:
   ```powershell
   npm start
   ```
4. Open your browser at:
   👉 **`http://localhost:4200`**

---

## 🔑 Default Credentials

| Role | Email | Password | Phone | Features Accessible |
| :--- | :--- | :--- | :--- | :--- |
| **Owner** | `owner@tiffin.com` | `password123` | `9876543210` | Delivery stats, Customer lookup, ⏰ Morning Clock & Outbox, 🔄 Subscription Transfers, 📥 Messy Data Import, Month-End Billing |
| **Customer** (Anita - Paused Demo) | `anita@example.com` | `password123` | `9876543211` | View active plan, Pause/Resume lunch delivery, Kitchens directory, Monthly statements |
| **Customer** (Priya Sharma) | `priya@example.com` | `password123` | `9876543212` | View active plan, Pause/Resume lunch delivery, Kitchens directory, Monthly statements |
| **Customer** (Rahul Verma) | `rahul@example.com` | `password123` | `9876543213` | View active plan, Pause/Resume lunch delivery, Kitchens directory, Monthly statements |

---

## 🛠️ How to Debug

### Backend Debugging
1. **Application Logs**: Standard output in terminal shows Spring Boot startup, SQL operations, HikariCP connection pool logs, and authentication filters.
2. **Inspect H2 Database**: Visit `http://localhost:8080/h2-console` with JDBC URL `jdbc:h2:file:./data/tiffindb;AUTO_SERVER=TRUE` to run SQL queries directly on `USERS`, `SUBSCRIPTIONS`, `PAUSE_PERIODS`, `OUTBOX_MESSAGES`, and `SUBSCRIPTION_TRANSFERS`.
3. **Common Pitfalls & Fixes**:
   - *Database locked (`MVStoreException`)*: Ensured `AUTO_SERVER=TRUE` in `application.properties` so multiple connections (CLI, Console, Server) share the database file without lock contention.
   - *Port 8080 already in use*: Kill lingering Java processes via PowerShell:
     ```powershell
     Get-Process -Name java | Stop-Process -Force
     ```

### Frontend Debugging
1. **Browser DevTools (F12)**:
   - **Network Tab**: Inspect HTTP requests sent with `Authorization: Bearer <token>`.
   - **Console Tab**: Check for any client-side JavaScript/Angular errors.
2. **Angular Production Build Verification**:
   ```powershell
   cd frontend
   npm run build
   ```
   Ensures bundle budget and TypeScript types strictly pass without compilation warnings.

---

## 🌐 Complete REST API Endpoint Catalog

### 1. Authentication & Public Endpoints
| HTTP Method | Path | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | No | Register a new user (`name`, `email`, `phone`, `password`, `role`) |
| `POST` | `/api/auth/login` | No | Authenticate user and receive JWT bearer token |

### 2. Customer & Kitchen Directory
| HTTP Method | Path | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/customers` | `ROLE_OWNER` | List all registered customers (supports pagination) |
| `GET` | `/api/customers/search` | `ROLE_OWNER` | Search customer by phone number |
| `GET` | `/api/tiffin-services` | `ROLE_CUSTOMER` | Browse registered tiffin kitchen providers |

### 3. Subscriptions & Lifecycle Management
| HTTP Method | Path | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/subscriptions` | Authenticated | Create a new meal subscription (`customerId`, `planName`) |
| `GET` | `/api/subscriptions` | `ROLE_OWNER` | Retrieve all subscriptions across all customers |
| `GET` | `/api/subscriptions/my` | `ROLE_CUSTOMER` | Retrieve current authenticated customer's subscription |
| `POST` | `/api/subscriptions/{id}/pause` | Authenticated | Pause weekday deliveries with optional reason |
| `POST` | `/api/subscriptions/{id}/resume` | Authenticated | Resume weekday deliveries |
| `POST` | `/api/subscriptions/{id}/transfer` | Authenticated | **Twist T6**: Transfer subscription mid-cycle to another customer |

### 4. Month-End Pro-Rated Billing
| HTTP Method | Path | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/billing/generate` | `ROLE_OWNER` | Compute pro-rated invoices for all subscriptions in month/year |
| `GET` | `/api/billing/my` | `ROLE_CUSTOMER` | Retrieve billing history & pro-rated statements for current user |
| `GET` | `/api/billing/customer/{id}` | `ROLE_OWNER` | Retrieve invoices for a specific customer |
| `GET` | `/api/billing/subscription/{id}` | Authenticated | Retrieve invoices for a specific subscription |

### 5. Evaluation Twist Endpoints (Public for Grading Bots)
| HTTP Method | Path | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/clock` or `/api/clock` | No | **Twist T1**: Morning clock runner. Simulates a date (`{"date":"YYYY-MM-DD"}`), queues weekday deliveries for active, non-paused customers into the outbox |
| `GET` | `/outbox` or `/api/outbox` | No | **Twist T1**: Retrieve queued morning delivery notification messages |
| `DELETE` | `/outbox` | No | **Twist T1**: Clear outbox notifications |
| `POST` | `/import` or `/api/customers/import` | No | **Twist T4**: Ingests messy customer records, normalizes phone & dates, dedupes, and returns `{ imported, deduped, rejected }` |
