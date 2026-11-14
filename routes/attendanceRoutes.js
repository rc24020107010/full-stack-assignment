import express from 'express';
import {
  markAttendance,
  getAllAttendance,
  getStudentAttendance,
  getAttendancePercentage,
} from '../controllers/attendanceController.js';
import {
  validateObjectId,
  validateAttendanceInput,
} from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Route: /api/attendance
router
  .route('/')
  .post(authorizeRoles('admin', 'faculty'), validateAttendanceInput, markAttendance)
  .get(getAllAttendance);

// Route: /api/attendance/student/:studentId
router
  .route('/student/:studentId')
  .get(validateObjectId('studentId'), getStudentAttendance);

// Route: /api/attendance/percentage/:studentId
router
  .route('/percentage/:studentId')
  .get(validateObjectId('studentId'), getAttendancePercentage);

export default router;

