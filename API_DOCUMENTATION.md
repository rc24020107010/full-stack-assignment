# API Documentation - Student Attendance Management System

**Course:** B.Voc (Software Development)  
**Semester:** 5  
**Subject:** Full Stack Web Development - 2  

---

## Base URL
```text
http://localhost:5000
```

All student APIs are prefixed with `/api/students` and all attendance APIs are prefixed with `/api/attendance`.

---

## Authentication & Role-Based Access Control (RBAC)

This system implements a simple header-based RBAC mechanism (without JWT complexity).

- **Header Key:** `x-user-role`
- **Supported Roles:** `admin`, `faculty`, `student`
- **Default Value:** If the header is omitted in Postman, it defaults to `admin` so all endpoints can be evaluated immediately without friction.

| Role | Permitted Actions |
|---|---|
| `admin` | Add Student, Delete Student, Mark Attendance, View All Records, View Percentages |
| `faculty` | Mark Attendance, View All Records, View Percentages |
| `student` | View Attendance History, View Attendance Percentage, View Student Details |

---

## Summary of API Endpoints

### Student APIs
| Method | Endpoint | RBAC Role | Purpose |
|---|---|---|---|
| `POST` | `/api/students` | `admin` | Add a new student |
| `GET` | `/api/students` | Any | Get all students |
| `GET` | `/api/students/:id` | Any | Get a student by ID |
| `DELETE` | `/api/students/:id` | `admin` | Delete a student and cascade-remove their attendance records |

### Attendance APIs
| Method | Endpoint | RBAC Role | Purpose |
|---|---|---|---|
| `POST` | `/api/attendance` | `admin`, `faculty` | Mark daily attendance (`Present` / `Absent`) |
| `GET` | `/api/attendance` | Any | Get all attendance records (with populated student data) |
| `GET` | `/api/attendance/student/:studentId` | Any | Get attendance records of an individual student |
| `GET` | `/api/attendance/percentage/:studentId` | Any | Calculate attendance percentage for a student |

---

## 1. Student APIs

### 1.1 Add Student
Registers a new student into the system.

- **Method:** `POST`
- **Endpoint:** `/api/students`
- **Headers:**
  - `Content-Type: application/json`
  - `x-user-role: admin`
- **Request Body:**
```json
{
  "name": "Aarav Sharma",
  "rollNumber": "BVOC-2024-001",
  "email": "aarav.sharma@college.edu",
  "course": "B.Voc (Software Development)",
  "semester": 5
}
```

#### Field Specifications:
- `name` (String, required): Full name of the student.
- `rollNumber` (String, required, unique): Unique roll number.
- `email` (String, required, unique): Valid email address.
- `course` (String, required): Enrolled degree program.
- `semester` (Number, required): Semester between 1 and 12.

#### Responses:
- **`201 Created` - Success:**
```json
{
  "success": true,
  "message": "Student added successfully.",
  "data": {
    "_id": "6736274092bcda1248000101",
    "name": "Aarav Sharma",
    "rollNumber": "BVOC-2024-001",
    "email": "aarav.sharma@college.edu",
    "course": "B.Voc (Software Development)",
    "semester": 5,
    "createdAt": "2026-11-14T15:50:00.000Z",
    "updatedAt": "2026-11-14T15:50:00.000Z"
  }
}
```

- **`409 Conflict` - Duplicate Roll Number / Email:**
```json
{
  "success": false,
  "message": "Student with roll number 'BVOC-2024-001' already exists."
}
```

- **`400 Bad Request` - Validation Error:**
```json
{
  "success": false,
  "message": "Validation Error: Missing required fields: email, semester"
}
```

---

### 1.2 Get All Students
Retrieves a list of all registered students, sorted from newest to oldest.

- **Method:** `GET`
- **Endpoint:** `/api/students`
- **Headers:** None required
- **Response (`200 OK`):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "6736274092bcda1248000102",
      "name": "Priya Verma",
      "rollNumber": "BVOC-2024-002",
      "email": "priya.verma@college.edu",
      "course": "B.Voc (Software Development)",
      "semester": 5,
      "createdAt": "2026-11-14T15:52:00.000Z",
      "updatedAt": "2026-11-14T15:52:00.000Z"
    },
    {
      "_id": "6736274092bcda1248000101",
      "name": "Aarav Sharma",
      "rollNumber": "BVOC-2024-001",
      "email": "aarav.sharma@college.edu",
      "course": "B.Voc (Software Development)",
      "semester": 5,
      "createdAt": "2026-11-14T15:50:00.000Z",
      "updatedAt": "2026-11-14T15:50:00.000Z"
    }
  ]
}
```

---

### 1.3 Get Student by ID
Retrieves details of a single student using their MongoDB ObjectId.

- **Method:** `GET`
- **Endpoint:** `/api/students/:id`
- **URL Parameter:** `id` (e.g. `6736274092bcda1248000101`)

#### Responses:
- **`200 OK` - Success:**
```json
{
  "success": true,
  "data": {
    "_id": "6736274092bcda1248000101",
    "name": "Aarav Sharma",
    "rollNumber": "BVOC-2024-001",
    "email": "aarav.sharma@college.edu",
    "course": "B.Voc (Software Development)",
    "semester": 5,
    "createdAt": "2026-11-14T15:50:00.000Z",
    "updatedAt": "2026-11-14T15:50:00.000Z"
  }
}
```

- **`404 Not Found` - Student Does Not Exist:**
```json
{
  "success": false,
  "message": "Student not found with ID: 6736274092bcda1248000199"
}
```

- **`400 Bad Request` - Malformed ObjectId:**
```json
{
  "success": false,
  "message": "Invalid ID: 'invalid-id-format' is not a valid MongoDB ObjectId."
}
```

---

### 1.4 Delete Student
Deletes a student record and automatically cascade-removes all attendance entries associated with that student.

- **Method:** `DELETE`
- **Endpoint:** `/api/students/:id`
- **Headers:**
  - `x-user-role: admin`
- **URL Parameter:** `id` (e.g. `6736274092bcda1248000101`)

#### Responses:
- **`200 OK` - Success:**
```json
{
  "success": true,
  "message": "Student and associated attendance records deleted successfully.",
  "deletedStudent": {
    "_id": "6736274092bcda1248000101",
    "name": "Aarav Sharma",
    "rollNumber": "BVOC-2024-001",
    "email": "aarav.sharma@college.edu",
    "course": "B.Voc (Software Development)",
    "semester": 5
  },
  "attendanceRecordsRemoved": 5
}
```

- **`403 Forbidden` - Unauthorized Role:**
```json
{
  "success": false,
  "message": "Forbidden: Role 'student' is not authorized to access this resource. Required role(s): admin"
}
```

---

## 2. Attendance APIs

### 2.1 Mark Attendance
Marks attendance for a student as either `Present` or `Absent`. Automatically normalizes dates and enforces duplicate prevention for the same student on the same date.

- **Method:** `POST`
- **Endpoint:** `/api/attendance`
- **Headers:**
  - `Content-Type: application/json`
  - `x-user-role: faculty` (or `admin`)
- **Request Body:**
```json
{
  "student": "6736274092bcda1248000101",
  "date": "2026-11-14",
  "status": "Present"
}
```

#### Field Specifications:
- `student` (ObjectId, required): Valid MongoDB ObjectId of an existing student.
- `date` (Date/String, required): Valid date string (e.g., `YYYY-MM-DD`).
- `status` (String, required): Must be strictly `"Present"` or `"Absent"`.

#### Responses:
- **`201 Created` - Success:**
```json
{
  "success": true,
  "message": "Attendance marked successfully.",
  "data": {
    "_id": "6736281292bcda1248000105",
    "student": {
      "_id": "6736274092bcda1248000101",
      "name": "Aarav Sharma",
      "rollNumber": "BVOC-2024-001",
      "email": "aarav.sharma@college.edu",
      "course": "B.Voc (Software Development)",
      "semester": 5
    },
    "date": "2026-11-14T00:00:00.000Z",
    "status": "Present",
    "createdAt": "2026-11-14T15:55:00.000Z",
    "updatedAt": "2026-11-14T15:55:00.000Z"
  }
}
```

- **`409 Conflict` - Duplicate Attendance on Same Date:**
```json
{
  "success": false,
  "message": "Duplicate attendance: Attendance for student 'Aarav Sharma' (BVOC-2024-001) has already been recorded for 2026-11-14."
}
```

- **`404 Not Found` - Student Does Not Exist:**
```json
{
  "success": false,
  "message": "Student not found with ID: 6736274092bcda1248000199"
}
```

- **`400 Bad Request` - Invalid Status Enum:**
```json
{
  "success": false,
  "message": "Validation Error: Status must be either 'Present' or 'Absent'. Received: 'Late'"
}
```

---

### 2.2 Get All Attendance Records
Retrieves all attendance records across all students, with student details populated.

- **Method:** `GET`
- **Endpoint:** `/api/attendance`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "6736281292bcda1248000106",
      "student": {
        "_id": "6736274092bcda1248000102",
        "name": "Priya Verma",
        "rollNumber": "BVOC-2024-002",
        "email": "priya.verma@college.edu",
        "course": "B.Voc (Software Development)",
        "semester": 5
      },
      "date": "2026-11-14T00:00:00.000Z",
      "status": "Present",
      "createdAt": "2026-11-14T15:56:00.000Z",
      "updatedAt": "2026-11-14T15:56:00.000Z"
    },
    {
      "_id": "6736281292bcda1248000105",
      "student": {
        "_id": "6736274092bcda1248000101",
        "name": "Aarav Sharma",
        "rollNumber": "BVOC-2024-001",
        "email": "aarav.sharma@college.edu",
        "course": "B.Voc (Software Development)",
        "semester": 5
      },
      "date": "2026-11-14T00:00:00.000Z",
      "status": "Present",
      "createdAt": "2026-11-14T15:55:00.000Z",
      "updatedAt": "2026-11-14T15:55:00.000Z"
    }
  ]
}
```

---

### 2.3 Get Attendance Records of an Individual Student
Retrieves the complete attendance timeline for a single student.

- **Method:** `GET`
- **Endpoint:** `/api/attendance/student/:studentId`
- **URL Parameter:** `studentId` (e.g. `6736274092bcda1248000101`)

#### Responses:
- **`200 OK` - Success:**
```json
{
  "success": true,
  "student": {
    "id": "6736274092bcda1248000101",
    "name": "Aarav Sharma",
    "rollNumber": "BVOC-2024-001",
    "course": "B.Voc (Software Development)",
    "semester": 5
  },
  "count": 2,
  "data": [
    {
      "_id": "6736289092bcda1248000108",
      "student": "6736274092bcda1248000101",
      "date": "2026-11-15T00:00:00.000Z",
      "status": "Absent",
      "createdAt": "2026-11-15T10:00:00.000Z",
      "updatedAt": "2026-11-15T10:00:00.000Z"
    },
    {
      "_id": "6736281292bcda1248000105",
      "student": "6736274092bcda1248000101",
      "date": "2026-11-14T00:00:00.000Z",
      "status": "Present",
      "createdAt": "2026-11-14T15:55:00.000Z",
      "updatedAt": "2026-11-14T15:55:00.000Z"
    }
  ]
}
```

- **`404 Not Found` - Student Does Not Exist:**
```json
{
  "success": false,
  "message": "Student not found with ID: 6736274092bcda1248000199"
}
```

---

### 2.4 Calculate Attendance Percentage
Calculates the attendance percentage of an individual student using the formula:
$$\text{Attendance Percentage} = \left(\frac{\text{Present Days}}{\text{Total Attendance Records}}\right) \times 100$$

- **Method:** `GET`
- **Endpoint:** `/api/attendance/percentage/:studentId`
- **URL Parameter:** `studentId` (e.g. `6736274092bcda1248000101`)

#### Responses:
- **`200 OK` - When Attendance Records Exist:**
```json
{
  "success": true,
  "student": {
    "id": "6736274092bcda1248000101",
    "name": "Aarav Sharma",
    "rollNumber": "BVOC-2024-001",
    "course": "B.Voc (Software Development)",
    "semester": 5
  },
  "totalRecords": 4,
  "presentDays": 3,
  "absentDays": 1,
  "attendancePercentage": 75,
  "statusRemark": "Eligible (Attendance criteria >= 75% met)"
}
```

- **`200 OK` - When NO Attendance Records Exist:**
```json
{
  "success": true,
  "student": {
    "id": "6736274092bcda1248000101",
    "name": "Aarav Sharma",
    "rollNumber": "BVOC-2024-001",
    "course": "B.Voc (Software Development)",
    "semester": 5
  },
  "totalRecords": 0,
  "presentDays": 0,
  "absentDays": 0,
  "attendancePercentage": 0,
  "message": "No attendance records exist for this student yet."
}
```

- **`404 Not Found` - Student Does Not Exist:**
```json
{
  "success": false,
  "message": "Student not found with ID: 6736274092bcda1248000199"
}
```

---

## 3. Postman Collection Import

A ready-to-use Postman collection is included in the project:
- File: `postman_collection.json`

### Steps to import into Postman:
1. Open **Postman**.
2. Click **Import** in the upper left corner.
3. Select or drag-and-drop `postman_collection.json`.
4. The collection **"Student Attendance Management System API"** will appear with pre-configured requests and sample payloads for every endpoint.

