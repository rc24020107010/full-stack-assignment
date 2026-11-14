import express from 'express';
import {
  addStudent,
  getAllStudents,
  getStudentById,
  deleteStudent,
} from '../controllers/studentController.js';
import {
  validateObjectId,
  validateStudentInput,
} from '../middleware/validationMiddleware.js';
import { authorizeRoles } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Routes for /api/students
router
  .route('/')
  .post(authorizeRoles('admin'), validateStudentInput, addStudent)
  .get(getAllStudents);

// Routes for /api/students/:id
router
  .route('/:id')
  .get(validateObjectId('id'), getStudentById)
  .delete(authorizeRoles('admin'), validateObjectId('id'), deleteStudent);

export default router;

