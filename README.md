# Student Attendance Management System (Backend API)

**Course:** B.Voc (Software Development)  
**Semester:** 5  
**Subject:** Full Stack Web Development - 2  

---

## 1. Project Introduction

The **Student Attendance Management System** is a pure backend RESTful API service built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** using modern ECMAScript Module (`import/export`) syntax.

It is designed to manage student registration records, track daily attendance statuses (*Present* / *Absent*), enforce relational integrity using MongoDB `ObjectId` references, prevent duplicate attendance records for the same student on the same day, and accurately calculate student attendance percentages.

> **Note:** This project is strictly backend-only. There are no frontend files, HTML, CSS, React, or browser-based UI. All endpoints are designed to be tested using **Postman**.

---

## 2. Project Objectives

- Implement a clean **MVC (Model-View-Controller)** architectural pattern for separation of concerns.
- Provide full **CRUD** operations for student profile management.
- Provide reliable daily **attendance logging** with validation and relational population.
- Enforce business logic constraints:
  - Roll number uniqueness across all students.
  - Strict prevention of duplicate attendance entries for a student on the exact same date.
- Accurately calculate student attendance percentage using the formula:
  $$\text{Attendance Percentage} = \left(\frac{\text{Present Days}}{\text{Total Attendance Records}}\right) \times 100$$
- Safely handle edge cases such as zero attendance records and invalid IDs.
- Implement simple **Role-Based Access Control (RBAC)** without unnecessary third-party overhead.
- Provide centralized error handling with appropriate HTTP status codes (200, 201, 400, 403, 404, 409, 500).

---

## 3. Technologies Used

- **Runtime Environment:** [Node.js](https://nodejs.org/) (v18+)
- **Web Framework:** [Express.js](https://expressjs.com/) (v4.x)
- **Database:** [MongoDB](https://www.mongodb.com/) (Local Community Server or MongoDB Atlas)
- **Object Data Modeling (ODM):** [Mongoose](https://mongoosejs.com/) (v8.x)
- **Environment Configuration:** [dotenv](https://www.npmjs.com/package/dotenv)
- **Development Tool:** [Nodemon](https://nodemon.io/)
- **API Testing:** [Postman](https://www.postman.com/)

---

## 4. Folder Structure

```text
student-attendance-system/
│
├── config/
│   └── db.js                       # Database connection logic using Mongoose
│
├── models/
│   ├── Student.js                  # Student schema and data model
│   └── Attendance.js               # Attendance schema with unique compound index
│
├── controllers/
│   ├── studentController.js        # Logic for Student CRUD operations
│   └── attendanceController.js     # Logic for attendance recording and % calculation
│
├── routes/
│   ├── studentRoutes.js            # Express routes for student endpoints
│   └── attendanceRoutes.js         # Express routes for attendance endpoints
│
├── middleware/
│   ├── errorMiddleware.js          # 404 handler and centralized error handler
│   ├── rbacMiddleware.js           # Lightweight Role-Based Access Control
│   └── validationMiddleware.js     # Input and ObjectId validation logic
│
├── .env                            # Environment variables (port, db uri)
├── .env.example                    # Example template for environment variables
├── .gitignore                      # Git ignored files (node_modules, .env)
├── package.json                    # Project configuration, dependencies, scripts
├── postman_collection.json         # Ready-to-import Postman API collection
├── server.js                       # Express app entry point
├── API_DOCUMENTATION.md            # Detailed API documentation and examples
└── README.md                       # Main project documentation
```

---

## 5. MongoDB Schema Explanation

### 5.1 Student Model (`models/Student.js`)
Represents an enrolled student in the institution.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `name` | String | Required, Trimmed | Full name of the student |
| `rollNumber` | String | Required, Unique, Uppercase, Trimmed | Unique academic roll number |
| `email` | String | Required, Unique, Lowercase, Regex validated | Institutional or personal email |
| `course` | String | Required, Trimmed | Enrolled course/program name |
| `semester` | Number | Required, Min: 1, Max: 12 | Current academic semester |
| `createdAt` | Date | Auto-generated | Timestamp of creation |
| `updatedAt` | Date | Auto-generated | Timestamp of last update |

### 5.2 Attendance Model (`models/Attendance.js`)
Represents a daily attendance entry linked to a specific student.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `student` | ObjectId | Required, Ref: `'Student'` | Reference to the `Student` document |
| `date` | Date | Required, Normalized to UTC midnight | Date of attendance |
| `status` | String | Required, Enum: `['Present', 'Absent']` | Status of student on that day |
| `createdAt` | Date | Auto-generated | Record creation timestamp |
| `updatedAt` | Date | Auto-generated | Record update timestamp |

#### Compound Index for Duplicate Prevention:
```javascript
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });
```
This compound unique index guarantees that MongoDB will reject any attempt to save more than one attendance record for the same student on the same calendar day.

---

## 6. API Endpoints Overview

Detailed API documentation with all request payloads, parameters, and response structures is available in [API_DOCUMENTATION.md](file:///Users/apoorvchaturvedi/Desktop/full-stack-assignment/full-stack-assignment/API_DOCUMENTATION.md).

### 6.1 Student APIs

| Method | Endpoint | RBAC Role | Purpose |
|---|---|---|---|
| `POST` | `/api/students` | `admin` | Register a new student |
| `GET` | `/api/students` | Any | Retrieve all students |
| `GET` | `/api/students/:id` | Any | Retrieve a single student by MongoDB ID |
| `DELETE` | `/api/students/:id` | `admin` | Delete a student and cascade-remove their attendance records |

### 6.2 Attendance APIs

| Method | Endpoint | RBAC Role | Purpose |
|---|---|---|---|
| `POST` | `/api/attendance` | `admin`, `faculty` | Mark daily attendance (`Present` or `Absent`) |
| `GET` | `/api/attendance` | Any | Get all attendance records with populated student details |
| `GET` | `/api/attendance/student/:studentId` | Any | Get all attendance records for a specific student |
| `GET` | `/api/attendance/percentage/:studentId` | Any | Calculate attendance percentage for a student |

### 6.3 Simple RBAC (Role-Based Access Control)
As per assignment specifications, authentication does not require JWT. Instead, a lightweight header-based RBAC middleware is provided:
- Header Name: `x-user-role`
- Permitted values: `admin`, `faculty`, `student`
- Default behavior: If `x-user-role` is omitted in Postman, it defaults to `admin` so all endpoints can be evaluated immediately without friction.

> 📖 **Full API Reference:** For exhaustive request/response bodies, error status codes, and test cases, please view [API_DOCUMENTATION.md](file:///Users/apoorvchaturvedi/Desktop/full-stack-assignment/full-stack-assignment/API_DOCUMENTATION.md).

---

## 7. Request Flow Architecture

```text
Postman (Client)
   │
   ▼
Express Server (server.js)
   │ [Parses JSON payload via express.json()]
   ▼
Routes (studentRoutes.js / attendanceRoutes.js)
   │ [Matches HTTP method and URL endpoint path]
   ▼
Middleware (rbacMiddleware.js & validationMiddleware.js)
   │ [Verifies role permissions and validates parameters/payloads]
   ▼
Controller (studentController.js / attendanceController.js)
   │ [Executes business logic, error trapping via try/catch, % calculation]
   ▼
Model (Student.js / Attendance.js)
   │ [Applies Mongoose schema rules, getters/setters, compound indices]
   ▼
MongoDB (Database)
   │ [Stores documents, queries records, enforces index uniqueness]
   ▼
Response
   │ [Controller returns structured JSON with appropriate HTTP status code]
   ▼
Postman (Client receives response)
```

---

## 8. Installation Instructions

1. Ensure [Node.js](https://nodejs.org/) (version 18 or above) is installed on your computer.
2. Open your terminal and navigate to the project directory:
   ```bash
   cd student-attendance-system
   ```
3. Install project dependencies:
   ```bash
   npm install
   ```

---

## 9. MongoDB Connection Setup

You can use either a local MongoDB server or a free cloud MongoDB Atlas cluster.

### Option A: Local MongoDB
1. Ensure your MongoDB service is running:
   ```bash
   # On macOS (Homebrew):
   brew services start mongodb-community
   # On Linux (systemd):
   sudo systemctl start mongod
   # On Windows:
   net start MongoDB
   ```
2. The default connection URL in `.env` is:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/student_attendance_db
   ```

### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a cluster and generate a database user and password.
3. Obtain your connection string and paste it into `.env`:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/student_attendance_db?retryWrites=true&w=majority
   ```

---

## 10. Environment Variables

Create or inspect the `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/student_attendance_db
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port number on which the Express server listens | `5000` |
| `NODE_ENV` | Application environment (`development` or `production`) | `development` |
| `MONGO_URI` | MongoDB connection URI string | `mongodb://127.0.0.1:27017/student_attendance_db` |

---

## 11. Commands to Run the Project

### Production Mode:
```bash
npm start
```

### Development Mode (with hot-reload via Nodemon):
```bash
npm run dev
```

When started, you will see output similar to:
```text
🚀 Server running in development mode on port 5000
📡 Base API URL: http://localhost:5000
 MongoDB Connected Successfully: 127.0.0.1
```

---

## 12. Future Improvements

1. **Authentication with JWT:** Add JSON Web Tokens (JWT) and bcrypt password hashing for secure authentication.
2. **Subject/Classroom-Wise Attendance:** Extend the attendance model to track attendance per subject or lecture rather than whole-day.
3. **Bulk Attendance Marking:** Add an endpoint to mark attendance for an entire classroom roster in a single request.
4. **Attendance Export:** Generate CSV or PDF attendance reports for college administration.
5. **Automated Email Notifications:** Notify students or guardians when attendance drops below 75%.
