# HustleHub+
HustleHub+ is a secure freelance marketplace platform. Its main purpose is to allow freelancers to advertise services and clients to browse and book those services.

Part 3 extends the MERN application with an approval-based booking workflow, a freelancer Financial Dashboard, a South African annual income-tax estimator, and Docker Compose containerisation. Clients submit booking requests and freelancers approve them before the system records simulated completed transactions. No real payments are processed.

The Financial Dashboard shows total recorded earnings, earnings for the current South African tax year, estimated annual taxable income and estimated income tax. Users can enter additional annual taxable income and estimated deductible expenses. The estimator uses the 2027 South African tax year (1 March 2026 to 28 February 2027), assumes an individual younger than 65, and is for educational purposes only.

Security is essential to HustleHub+ as it handles sensitive information such as user details, bookings, transactions, and income data.

The system has three main user roles:

- **Clients** - Browse and book available services.

- **Freelancers** - Create and manage services, view bookings, and track income.

- **Admins** - Provide administrative oversight and user management.

## System Architecture
The HustleHub+ system follows the MERN architecture: MongoDB, Express, React and Node.js. The application integrates a React/Vite frontend, an Express REST API and MongoDB persistence. Part 3 adds Docker images for the frontend and backend, orchestrated with Docker Compose. The production frontend build is served by Nginx.

The React frontend provides the user interface and communicates with the backend through HTTPS requests. The backend is responsible for processing API requests, authentication, validation, application logic, and communication with the data layer.

Part 1 used temporary in-memory storage. Part 2 uses MongoDB to persist users, gigs, bookings and transactions.

<img width="582" height="1477" alt="POE UML System Architecture" src="https://github.com/user-attachments/assets/f7c3b5b7-f5da-435f-a3ff-0b3e50eb556b" />

## Request Flow
A request begins when a user performs an action through the frontend or sends an API request using a tool such as Postman. The request is sent securely to the Node.js and Express backend over HTTPS.

The request is directed to the appropriate Express route and passes through the required middleware. Middleware is responsible for functions such as input validation and JWT authentication before the request is processed by the controller. (expressjs, 2026).

The controller handles the required application logic and interacts with the model or data layer where necessary. The backend then returns an appropriate HTTP response to the client.

During login, the user's email and password are validated. If the credentials are correct, a JSON Web Token (JWT) is generated and returned to the client. The JWT contains the user's ID and role and expires after one hour.

For protected routes, the JWT must be included in the `Authorization` header as a Bearer token:
```text
Authorization: Bearer <token>
```

The authentication middleware verifies the token before allowing access to the protected resource.

## Project Structure
```text
HustleHub_backend/

├── Data/mongoDb.js

├── config/

├── controllers/          # Authentication, gigs, bookings, transactions

├── middleware/           # JWT, roles, validation, rate limits, errors

├── models/               # User, gig, booking, transaction models

├── routes/               # REST API route definitions

├── postman/              # API test collection

├── reports/              # Newman test output

├── ssl/                  # Local development TLS certificate files

├── utils/

├── package.json

└── server.js

HustleHub_Frontend/

├── src/

│   ├── components/

│   ├── context/

│   ├── pages/

│   ├── services/               # API service and taxCalculator.js

│   └── test/              # Vitest and React Testing Library tests

└── package.json
```

- ***Routes*** define the API endpoints.

- ***Controllers*** contain the main application logic for registration and login.

- ***Middleware*** performs validation, authentication, and controlled error handling before requests are processed.

- ***Models*** represent persisted MongoDB collections for users, gigs, bookings and transactions.

- ***Utilities*** contain reusable functionality such as JWT generation.

- ***Config*** manages configuration values used by the application.

- ***SSL files*** contain locally generated certificate and private key files for HTTPS development. Never commit private keys.

- ***Frontend components and pages*** render the marketplace, registration/login and role-specific views.

- ***Frontend services*** use Axios to call the backend API.

## Part 2 Features
### Clients
- Register and sign in, then browse gigs and view gig details.

- Submit booking requests with a `pending` status; freelancers must approve requests before a simulated transaction is recorded.

- View their bookings and associated transaction records.

### Freelancers
- Register and sign in as a freelancer.

- Create, view, update and delete their own gigs.

- Review and approve booking requests for their gigs.
- View recorded simulated earnings and use the annual Financial Dashboard and tax estimator.

### Roles and Access Control
The platform recognises client, freelancer and admin roles. The implemented user-facing workflows focus on clients and freelancers. JWT authentication protects restricted API endpoints; role middleware restricts operations to permitted roles. Gig modification also requires ownership checks in the application logic. Administrative oversight is part of the broader system design; this README does not claim a completed admin dashboard.

## API Endpoints
| Method | Endpoint | Description | Access |

|---|---|---|---|

| POST | `/api/auth/register` | Create an account | Public |

| POST | `/api/auth/login` | Sign in and receive JWT | Public |

| GET | `/api/protected/profile` | View authenticated profile | JWT |

| GET | `/api/gigs` | Browse gigs | Public API |

| GET | `/api/gigs/:id` | View gig details | Public API |

| GET | `/api/gigs/mine` | Freelancer's gigs | Freelancer JWT |

| POST | `/api/gigs` | Create gig | Freelancer JWT |

| PUT | `/api/gigs/:id` | Update owned gig | Freelancer JWT |

| DELETE | `/api/gigs/:id` | Delete owned gig | Freelancer JWT |

| POST | `/api/bookings` | Book a gig | Client JWT |

| GET | `/api/bookings/client` | Client bookings | Client JWT |

| GET | `/api/bookings/freelancer` | Freelancer bookings | Freelancer JWT |

| GET | `/api/transactions/client` | Client transactions | Client JWT |

| GET | `/api/transactions/freelancer` | Freelancer transactions | Freelancer JWT |

| GET | `/api/transactions/freelancer/income` | Freelancer income total | Freelancer JWT |

The freelancer approval endpoint is implemented in the booking routes; verify its exact path in `HustleHub_backend/routes/bookingRoutes.js` before adding it to this table.

### Booking Approval and Transaction Workflow

1. A client browses a gig and submits a booking request.
2. The booking is created with `pending` status; no transaction is created at this stage.
3. The freelancer reviews the request in their bookings page and approves it.
4. The backend updates the booking to `approved` and creates a simulated transaction with `completed` status.
5. The approval and transaction insertion use a MongoDB transaction to keep the records consistent.
6. The client can view the transaction, and the freelancer's income dashboard includes the recorded amount.

The `completed` transaction status indicates completion of the **simulated transaction record**, not proof that a real payment was received. There is no payment gateway.

## Part 3 — Freelancer Financial Dashboard and Tax Estimator

The freelancer Income page has been upgraded to a Financial Dashboard. It retrieves the authenticated freelancer's total income from `GET /api/transactions/freelancer/income` and transaction records from `GET /api/transactions/freelancer`.

The dashboard displays four summary cards:

- **Total earnings:** All-time income reported by the existing completed-transaction income endpoint.
- **Tax-year earnings:** Sum of completed transactions dated within the current South African tax year (1 March through the following February), using each transaction's `createdAt` date.
- **Estimated taxable income:** Tax-year earnings plus user-entered additional annual income, minus user-entered deductible expenses, floored at zero.
- **Estimated annual tax:** Progressive South African individual income tax estimate after the primary rebate.

The tax estimator is implemented in `HustleHub_Frontend/src/services/taxCalculator.js` and integrated into `src/pages/FreelancerIncomePage.jsx`. It updates immediately as the freelancer edits the additional-income and expense fields. The calculator uses the 2027 South African individual tax brackets and primary rebate for a taxpayer younger than 65. It does not account for every personal tax circumstance, tax credit, age-related rebate, provisional tax payment or SARS determination. Entered expenses are assumptions and have not been verified as allowable deductions.

**Illustrative tested example:** With R890 recorded tax-year earnings, R150,000 additional income and R20,000 estimated deductible expenses, the dashboard displayed R130,890 estimated taxable income and R5,740.20 estimated annual tax. The example is a calculation test, not a tax assessment.

**Important:** HustleHub+ transactions are simulated and do not represent verified receipts or payments. This estimator is educational, not professional tax advice.

## Part 3 — Docker and Docker Compose

Docker Compose runs the backend and frontend as separate containers. The backend runs Node.js/Express over HTTPS on port **3000** and connects to MongoDB Atlas using local environment variables. The frontend is built with Vite and served by Nginx on port **8080**. Local SSL certificate files are mounted read-only into the backend container and must not be baked into the Docker image or committed to Git.

### Docker prerequisites

- Docker Desktop with Docker Compose available
- `HustleHub_backend/.env` containing valid local environment configuration
- Local development certificate files at `HustleHub_backend/ssl/cert.pem` and `HustleHub_backend/ssl/key.pem`
- Access to the configured MongoDB Atlas deployment

From the repository root (the directory containing `docker-compose.yml`), run:
```bash
docker compose up -d --build
docker compose ps
```

Open the frontend at **http://localhost:8080**. The backend API is available at **https://localhost:3000**. If the browser blocks the local self-signed certificate, trust it only for the local development environment before attempting API login.

Useful commands:
```bash
docker compose logs backend --tail=30
docker compose logs frontend --tail=30
docker compose down
```

Docker Compose reads `HustleHub_backend/.env` through `env_file`; do not put actual passwords, tokens or connection strings into the README or Compose file. The Compose configuration mounts `HustleHub_backend/ssl` into `/app/ssl:ro` and starts the frontend after the backend service has been started. `depends_on` does not guarantee the backend or database is ready to accept requests; use logs to verify readiness.

### Docker verification performed

The frontend and backend images were built and both containers showed **Up** in `docker compose ps`, with port mappings `8080:80` and `3000:3000`. The Docker-served frontend loaded, freelancer authentication worked, and the Financial Dashboard displayed the expected R890 earnings, R130,890 estimated taxable income and R5,740.20 estimated annual tax for the test inputs. The login-page layout was also updated so that the authenticated sidebar is not shown on `/login` and `/register`; the corrected login layout was verified in Docker.

## Part 3 — CI/CD, Logging and Security Review

The team has divided these responsibilities as follows:

- **Tori:** Docker and Docker Compose, freelancer Financial Dashboard and tax estimator, README documentation.
- **Kiaan:** GitHub Actions CI/CD, static analysis and outstanding end-to-end testing.
- **Megan:** Logging, additional security features and security review.

**Verification required before submission:** Add the actual GitHub Actions workflow names, build/test results, static-analysis output, logging evidence and security-review findings after confirming them with the responsible teammates. Do not describe unverified checks as passing.

## Security Implementation
### Password Hashing
Passwords are never stored in plain text. HustleHub+ uses `bcrypt` to hash passwords before they are stored.

During registration, the user's password is converted into a secure hash before the user information is stored.

During login, `bcrypt` compares the password entered by the user with the stored password hash. This allows the application to verify the user's password without storing the original plain-text password.

### JWT Authentication and Tokens (MDN, 2026)
After a successful login, HustleHub+ generates a JSON Web Token (JWT).

The token contains:

- The user's ID.

- The user's role.

The JWT is configured to expire after one hour.

Protected requests must send the token using the `Authorization` header in the following format:
```text
Authorization: Bearer <token>
```

The authentication middleware verifies the JWT before allowing the request to continue.

If the token is missing, invalid, or expired, the API responds with a `401 Unauthorized` response and access to the protected resource is denied.

### Input Validation (express-validator, 2026).
Input validation uses `express-validator` across authentication and relevant marketplace endpoints. Inputs are checked and normalised/sanitised before processing where appropriate.

Registration validation includes:

***Name***

- Required.

- Must be between 2 and 50 characters.

***Email***

- Required.

- Must be a valid email address.

- Normalised before processing.

***Password***

- Required.

- Must be at least 8 characters long.

- Must contain at least one uppercase letter.

- Must contain at least one lowercase letter.

- Must contain at least one number.

Invalid input returns a `400 Bad Request` response.

### HTTPS and SSL/TLS
The backend runs over HTTPS using a locally configured SSL certificate.

The server uses the following files:
```text
ssl/cert.pem

ssl/key.pem
```

The API runs locally at:
```text
https://localhost:3000
```

HTTPS encrypts information while it travels between the client and server. This is important for protecting sensitive information such as passwords and authentication tokens from interception.

### Secure Error Handling
HustleHub+ uses controlled error handling so that internal server information is not exposed to users.

If an error occurs, the API returns an appropriate controlled message rather than displaying sensitive technical information such as file paths, stack traces, or configuration details.

For example:
```text
Invalid email or password
```

For unexpected errors, the API returns a generic error response rather than exposing internal application details.

## Security Rationale
HustleHub+ uses multiple security measures to protect user information and prevent unauthorised access.

- ***Password hashing with bcrypt*** ensures that passwords are not stored in plain text. This reduces the risk of user passwords being exposed if stored user information is compromised.

- ***JWT authentication*** allows the backend to verify authenticated users before granting access to protected API endpoints.

- ***Token expiration*** limits the amount of time a generated JWT remains valid. HustleHub+ tokens expire after one hour.

- ***Input validation*** ensures that invalid or incorrectly formatted information is rejected before it is processed by the application.

- ***HTTPS using SSL/TLS*** encrypts communication between the client and server, protecting sensitive information such as passwords and authentication tokens while they are transmitted.

- ***Controlled error handling*** prevents sensitive internal application information from being exposed through API responses.

Part 2 builds on these controls with role-based authorisation, ownership checks, rate limiting and security headers. Part 3 security review, logging and CI/CD work are assigned to other team members; verify the final implementation and test evidence before documenting these as completed.

### Additional Part 2 Security Controls
- ***Role-based access control:*** `authenticateToken` and `authorizeRoles` middleware protect role-specific routes; controllers enforce ownership rules for user-owned resources.

- ***Rate limiting:*** Express rate limiting is applied to sensitive operations, including booking and authentication-related endpoints, to reduce abuse.

- ***Security headers:*** Helmet configures protective HTTP headers, including a Content Security Policy (CSP). Configuration should be tested against all required frontend resources.

- ***Validation and sanitisation:*** Express Validator validates incoming values; unsafe or malformed requests are rejected with controlled errors.

- ***CORS:*** The Express backend configures cross-origin access for the frontend.

- ***HTTPS:*** The development API uses a locally generated SSL certificate. Browsers may require explicitly trusting that certificate for local testing.

## Running the Application
### Prerequisites
- Node.js and npm

- Git

- A MongoDB deployment (such as MongoDB Atlas) with an appropriate connection URI

- Postman (optional for manual API testing)

### 1. Clone and install
```bash
git clone <your-repository-url>

cd <repository-folder>
```

Install dependencies in ***both*** project folders:
```bash
cd HustleHub_backend

npm install
```

In a second terminal, from the repository root:
```bash
cd HustleHub_Frontend

npm install
```

### 2. Configure backend environment variables
Create `HustleHub_backend/.env` locally with values appropriate for your development environment:
```dotenv
PORT=3000

JWT_SECRET=replace_with_a_long_random_secret

MONGODB_URI=replace_with_your_mongodb_connection_uri
```

Never commit `.env`, MongoDB credentials, JWT secrets or SSL private keys to GitHub. If any real secrets have already been committed, rotate them and remove them from repository history.

### 3. Configure local HTTPS
The backend expects `ssl/key.pem` and `ssl/cert.pem`. If absent, create them locally using OpenSSL and the repository's SSL configuration file:
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/key.pem -out ssl/cert.pem -config ssl/openssl.cnf
```

The certificate is self-signed for local development only. Do not deploy the development private key or use this certificate as a production trust solution.

### 4. Start the backend
From `HustleHub_backend`:
```bash
npm run dev
```

Expected local API: `https://localhost:3000`.

### 5. Start the frontend
From `HustleHub_Frontend`, in a separate terminal:
```bash
npm run dev
```

Vite usually serves the frontend at `http://localhost:5173`. The Axios service points to `https://localhost:3000/api`. Keep both development servers running. If requests fail because of the self-signed certificate, visit the local backend URL in your browser and accept the certificate for your own development server only.

### 6. Basic manual verification
Register a client and a freelancer. Sign in with each role; create and edit a gig as the freelancer; browse and request it as the client; approve the pending request as the freelancer; then confirm the booking, simulated transaction and freelancer income views show the expected records. Also test invalid input and attempts to access another user's protected resources.

## Testing
### API Testing with Postman
The HustleHub+ API has been tested using Postman. The Postman collection demonstrates successful registration and login requests, token generation, protected endpoint access, and appropriate handling of invalid scenarios.

### Screenshots
The following screenshots provide evidence of testing performed using Postman.

<img width="2880" height="1704" alt="Screenshot 2026-10-12 083830" src="https://github.com/user-attachments/assets/8b20848b-bd13-4390-aa73-34418f28588a" />

<img width="2880" height="1704" alt="Screenshot 2026-10-12 083836" src="https://github.com/user-attachments/assets/c0c6eb38-836c-43fb-a3ff-f86dc6737610" />

 <img width="1516" height="834" alt="Screenshot 2026-10-10 182214" src="https://github.com/user-attachments/assets/a2161d8f-d227-40ea-ba5d-2a06ce0a1611" />

<img width="1518" height="970" alt="Screenshot 2026-10-10 182249" src="https://github.com/user-attachments/assets/b122b4f1-385c-472d-9e50-763a37f56583" />

### Automated API Testing with Newman
The backend includes a Postman collection at `HustleHub_backend/postman/HustleHub Authentication API Tests.postman_collection.json` and a Newman script. With the backend running, execute:
```bash
cd HustleHub_backend

npm run test:api
```

The script runs the `1. Main API Tests` and `2. Validation Tests` folders with the `--insecure` flag for the local self-signed certificate, outputs console results and writes `reports/newman-results.xml`. The `--insecure` flag is for local development testing only. Include a fresh Newman result or screenshot with the submission.

<img width="2880" height="1704" alt="Screenshot 2026-10-12 083508" src="https://github.com/user-attachments/assets/7d9a62af-094f-44f7-afd1-dd6fdb94dee5" />

<img width="2880" height="1704" alt="Screenshot 2026-10-12 083830" src="https://github.com/user-attachments/assets/48b0efa5-ca04-48db-b164-c91bc8a8c396" />

<img width="2880" height="1704" alt="Screenshot 2026-10-12 083830" src="https://github.com/user-attachments/assets/6d43ada3-818c-4aa5-ba7e-04538383040b" />

### Frontend Automated Testing
The frontend contains tests for login, registration, protected routes and gig cards using Vitest and React Testing Library. From `HustleHub_Frontend`:
```bash
npm test

npm run build
```

The first command runs the test suite; the second verifies that the production frontend builds. Record the actual results rather than assuming that all tests pass.

<img width="1920" height="1022" alt="Screenshot 2026-10-10 191252" src="https://github.com/user-attachments/assets/731e07b4-d3ab-40a5-b3d0-be15c8396a84" />

### Part 3 Manual Verification

The following scenarios were manually checked in the browser:

| Scenario | Observed result |
|---|---|
| Current tax-year recorded income | R890.00 |
| Additional income R150,000 and expenses R20,000 | Taxable income R130,890.00; estimated tax R5,740.20 |
| Additional income R300,000 and expenses R20,000 | Taxable income R280,890.00; estimated tax R35,603.40 |
| Additional income R2,000,000 and expenses R20,000 | Taxable income R1,980,890.00; estimated tax R694,549.50 |
| Docker containers | Both services reported `Up` |
| Login page in Docker | Sidebar hidden on authentication page |

These are manual checks, not a substitute for automated unit, integration, security or end-to-end tests. Add screenshots and actual test reports as appropriate for the final submission.

## Part 2 – Application Screenshots
The following screenshots demonstrate the main functionality implemented in Part 2 of HustleHub+. These include user authentication, freelancer gig management, client bookings, transaction recording and freelancer income tracking.

### 1. User Registration
The registration page allows users to create an account as either a client or freelancer. User inputs are validated before account creation.

<img width="959" height="599" alt="Screenshot 2026-10-12 153148" src="https://github.com/user-attachments/assets/882b1022-c43a-489f-bd7a-e8162fb92a5d" />

### 2. User Login
The login page allows registered users to authenticate using their email address and password. Successful authentication generates a JWT for accessing protected features.

<img width="959" height="599" alt="Screenshot 2026-10-12 153136" src="https://github.com/user-attachments/assets/619026c4-9a0a-4b55-95db-91d530491a47" />

### 3. Freelancer Gig Management
Freelancers can create, view, update and delete their own service listings. Each gig includes a title, description, category and price.

<img width="956" height="595" alt="Screenshot 2026-10-12 153749" src="https://github.com/user-attachments/assets/08262e95-5ad6-4e4f-afbe-e09cdb9f37a1" />

### 4. Client Bookings
Clients can browse available services and create bookings. Bookings are linked to the selected gig, client and freelancer.

<img width="951" height="577" alt="Screenshot 2026-10-12 153912" src="https://github.com/user-attachments/assets/57e94f43-5eaf-4d70-961f-138b01cba824" />

### 5. Client Transactions
After a freelancer approves a booking, the backend records a simulated completed transaction. Clients can view their transaction history.

<img width="959" height="590" alt="Screenshot 2026-10-12 153945" src="https://github.com/user-attachments/assets/3d726b5f-2075-4a16-917a-1fdaa6faf2fe" />

### 6. Freelancer Income Tracking
Freelancers can view income information calculated from completed transactions associated with their services.

<img width="959" height="599" alt="Screenshot 2026-10-12 153229" src="https://github.com/user-attachments/assets/3fc1ffec-88ba-48b0-b3cb-1699aca0f21f" />

## Demonstration Videos
### Part 1 API Demonstration
The demonstration video shows the HustleHub+ API running over HTTPS, successful user registration, successful login with JWT token generation, and authentication of a protected API endpoint using the generated Bearer token.

[Watch the HustleHub+ API Demonstration Video](https://youtu.be/8xgTJL0f6uY)

### Part 2 Full-Stack Demonstration
The Part 2 demonstration covers registration/login, freelancer gig creation, client booking, booking views and transaction-related functionality at the time of recording. The Part 3 approval-based workflow supersedes the earlier immediate-transaction behaviour.&#x20;

[Part 2 demonstration video URL](https://youtu.be/XcPS2bMd1NM)  

# References
expressjs, 2026. Routing. [Online]&#x20;

Available at: https://expressjs.com/en/guide/routing/

[Accessed 21 September 2026].

IETF, 2015. JSON Web Token (JWT), RFC 7519. [Online]&#x20;

Available at: https://www.rfc-editor.org/rfc/rfc7519

[Accessed 21 September 2026].

express-validator, 2026. Documentation. [Online]&#x20;

Available at: https://express-validator.github.io/docs/

[Accessed 21 September 2026].

MDN, 2026. HTTP authentication. [Online]&#x20;

Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication

[Accessed 21 September 2026].
