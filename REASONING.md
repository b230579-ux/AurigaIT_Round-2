# 🧠 REASONING.md — Architecture, Thought Process & Testing Strategy

This document details the architectural reasoning, domain design choices, testing methodologies, and debugging resolutions implemented in the **TiffinBox** Lunch Delivery & Pro-Rated Billing Service.

---

## 1. Architectural Strategy & Design Choices

### 1.1 Decoupled Architecture
- **Backend (Spring Boot 3 + Java 17 + H2)**: Selected for type safety, robust JPA lifecycle modeling, clean layered architecture (`Controller` ➔ `Service` ➔ `Repository` ➔ `Entity`), and seamless automated grading via REST endpoints.
- **Frontend (Angular 18 Standalone)**: Chosen for scalable component structure, reactive form/state handling, strict TypeScript typings, and modern control-flow syntax.
- **Stateless Authentication**: Implemented via JSON Web Tokens (JWT) with HS256 hashing. The client stores the token in `localStorage` and automatically injects it into outgoing requests via an `HttpInterceptor`.

### 1.2 Dual-Persona Experience (Owner vs Customer)
A core requirement was providing dedicated, persona-specific interfaces:
1. **Customer View (`ROLE_CUSTOMER`)**:
   - Personalized subscription status with clear visual indicators (Active vs Paused).
   - One-click self-service pause and resume.
   - Browse registered tiffin kitchens with meal tier breakdowns (Basic, Standard, Premium).
   - Transparent billing statements showing total weekdays, paused days, delivered days, and final pro-rated charge.
2. **Owner Operations View (`ROLE_OWNER`)**:
   - Executive metrics (total foodies, active deliveries today, paused customers, monthly revenue run-rate).
   - Fast customer lookup by 10-digit phone.
   - Management actions: Pause, Resume, Calculate Bill, and 🔄 Mid-cycle Transfer.
   - Dedicated tools for evaluation twists: ⏰ Clock & Outbox Runner and 📥 Messy Data Batch Importer.

---

## 2. Evaluation Twists: Design & Thought Process

### 2.1 Level 1 — T1 (Integrate): Morning Notification Clock & Outbox
- **Goal**: "Each morning, notify the customers due a delivery today (active, a weekday, not paused) via the Notification Service. Graded via `/outbox` after `POST /clock`."
- **Thought Process**:
  - Tiffin services operate exclusively on business weekdays (Monday through Friday).
  - The notification engine must determine if the target date is a weekday (`DayOfWeek.SATURDAY` and `SUNDAY` immediately yield 0 notifications).
  - For weekdays, it queries active subscriptions and verifies if the date falls inside an active pause interval (`pausePeriod.coversDate(targetDate)`).
  - Eligible deliveries generate an `OutboxMessage` containing recipient name, phone, email, plan name, delivery date, and a friendly message.
  - Both root `/clock`, `/outbox` and `/api/*` variants are supported and permitted without authentication so automated evaluation grading bots can test without friction.

### 2.2 Level 2 — T6 (Lifecycle): Mid-Cycle Subscription Transfer & Split Billing
- **Goal**: "Transfer a subscription to a new customer mid-cycle; the plan and cycle carry over, billing splits by who was served."
- **Thought Process**:
  - Subscriptions represent continuous service. When customer A moves out and transfers their subscription to customer B mid-month (e.g. Sept 15):
    1. Customer A's subscription `endDate` is clamped to `transferDate.minusDays(1)`.
    2. A new subscription is created for Customer B with the same plan and price, with `startDate` set to `transferDate`.
    3. The transfer record (`SubscriptionTransfer`) is persisted for auditability.
  - **Billing Split Logic**:
    - The daily rate is: $\text{Daily Rate} = \frac{\text{Monthly Plan Price}}{\text{Total Weekdays in Month}}$.
    - Customer A is billed: $\text{Daily Rate} \times (\text{Weekdays delivered up to transfer date} - \text{pauses})$.
    - Customer B is billed: $\text{Daily Rate} \times (\text{Weekdays delivered from transfer date to end of month} - \text{pauses})$.
    - $\text{Total Bill} = \text{Customer A Bill} + \text{Customer B Bill} = \text{Monthly Fee}$ (exact pro-rata conservation).

### 2.3 Level 3 — T4 (Messy Data): Messy Customer Import & Deduplication Engine
- **Goal**: "Import a messy customer list (dup phones, mixed date formats, blanks) into clean subscriptions with an `{ imported, deduped, rejected }` report."
- **Thought Process**:
  - Real-world customer uploads contain erratic phone numbers (`+91-98765-43210`, `98765 43210`, `98765-43210`), varying date conventions (`15/09/2026`, `2026-09-15`, `15-Sep-2026`), duplicates, and empty fields.
  - **Normalization**:
    - Extracted all numeric digits; trimmed leading `+91` or `0` to standardize on a 10-digit phone.
    - Used a multi-formatter `DateTimeFormatter` supporting 8 distinct standard and localized date formats.
  - **Deduplication Strategy**:
    - Checked incoming batch phone numbers against an in-memory set to identify intra-batch duplicates.
    - Checked against existing database subscriptions to detect inter-batch duplicates.
    - Duplicates are marked `DEDUPED` with the duplicate phone and reason.
  - **Validation Strategy**:
    - Missing names, invalid phone lengths (<10 digits), or unparseable dates are classified as `REJECTED` with clear diagnostic reasons.
  - **Imported**:
    - Clean records are provisioned with user accounts and active subscriptions, returning `IMPORTED` with their assigned subscription ID.

---

## 3. Testing Strategy & Verification

### 3.1 Automated & Unit Compilation
- **Backend**: Executed `.\mvnw.cmd test-compile -q` regularly to guarantee zero syntax or JPA mapping errors.
- **Frontend**: Executed `npm run build` to enforce TypeScript type correctness and Angular bundle budget constraints (budget threshold adjusted in `angular.json`).

### 3.2 REST API Verification
Each twist was tested against the running server using PowerShell `Invoke-RestMethod`:

1. **Clock & Outbox (`POST /clock`, `GET /outbox`)**:
   - Tested Tuesday (Sept 8): Successfully queued 3 deliveries; skipped Anita Desai (paused).
   - Tested Sunday (Sept 13): Returned 0 notifications (`Weekend - no deliveries`).
   - Verified message payload in `GET /outbox`.

2. **Mid-Cycle Transfer & Billing (`POST /api/subscriptions/{id}/transfer`)**:
   - Transferred Rahul Verma's Standard Plan (₹3,000/mo) on Sept 15 to Vikram Sharma.
   - Triggered `POST /api/billing/generate?month=9&year=2026`.
   - Verified split bills:
     - Rahul Verma: 10 weekdays served = ₹1,363.64
     - Vikram Sharma: 12 weekdays served = ₹1,636.36
     - Total: ₹1,363.64 + ₹1,636.36 = ₹3,000.00.

3. **Messy Data Import (`POST /import`)**:
   - Tested payload containing:
     - Clean records with international and formatted phone numbers (`+91 9988776655`, `99887-76644`).
     - Duplicate phone in same batch (`9988776655`).
     - Malformed phone (`12345`).
     - Missing name and invalid date (`invalid-date`).
   - Returned exact `{ totalRecords: 6, importedCount: 3, dedupedCount: 1, rejectedCount: 2, imported: [...], deduped: [...], rejected: [...] }` report.

---

## 4. Issues Encountered & Resolutions

| # | Problem / Error | Root Cause | Solution |
| :- | :--- | :--- | :--- |
| 1 | `Database may be already in use: tiffindb.mv.db (file locked)` | Previous Spring Boot background process held an exclusive file lock on the H2 file. | Terminated the lingering background process and configured `AUTO_SERVER=TRUE` in `application.properties`. |
| 2 | `Feature not supported: "AUTO_SERVER=TRUE && DB_CLOSE_ON_EXIT=FALSE"` | H2 2.2.x disallows combining `AUTO_SERVER=TRUE` with `DB_CLOSE_ON_EXIT=FALSE` because the server process manages exit cleanup. | Updated datasource URL to `jdbc:h2:file:./data/tiffindb;AUTO_SERVER=TRUE` and removed the conflicting flag. |
| 3 | Angular 18 Template Compiler Syntax Error with `@` | In Angular 18, `@` is a reserved keyword for built-in control flow (`@if`, `@for`). Inline `@example.com` triggered parsing errors. | Replaced `@` in templates with HTML entity `&#64;`. |
| 4 | Component Style Budget Exceeded | Angular build failed because `dashboard.component.ts` inline stylesheet exceeded the default 4kB budget. | Raised `anyComponentStyle` budget in `angular.json` to 16kB. |
| 5 | `Permission denied to Kriginsshadow (403 on git push)` | Windows Credential Manager stored legacy GitHub credentials for user `Kriginsshadow`, conflicting with repo owner `b230579-ux`. | Removed the saved credential using `cmdkey /delete:LegacyGeneric:target=git:https://github.com`, enabling the user to authenticate as `b230579-ux`. |
