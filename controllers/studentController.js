import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';

/**
 * @desc    Add a new student
 * @route   POST /api/students
 * @access  Admin
 */
export const addStudent = async (req, res, next) => {
  try {
    const { name, rollNumber, email, course, semester } = req.body;

    // Check if roll number already exists
    const existingStudentByRoll = await Student.findOne({
      rollNumber: rollNumber.toUpperCase(),
    });

    if (existingStudentByRoll) {
      return res.status(409).json({
        success: false,
        message: `Student with roll number '${rollNumber}' already exists.`,
      });
    }

    // Check if email already exists
    const existingStudentByEmail = await Student.findOne({
      email: email.toLowerCase(),
    });

    if (existingStudentByEmail) {
      return res.status(409).json({
        success: false,
        message: `Student with email '${email}' already exists.`,
      });
    }

    const student = await Student.create({
      name,
      rollNumber,
      email,
      course,
      semester,
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully.',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Public / Faculty / Admin
 */
export const getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a student by ID
 * @route   GET /api/students/:id
 * @access  Public / Faculty / Admin
 */
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a student by ID and remove their attendance history
 * @route   DELETE /api/students/:id
 * @access  Admin
 */
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID: ${req.params.id}`,
      });
    }

    // Delete student
    await Student.findByIdAndDelete(req.params.id);

    // Cascade delete student's attendance records
    const attendanceDeleteResult = await Attendance.deleteMany({
      student: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: 'Student and associated attendance records deleted successfully.',
      deletedStudent: student,
      attendanceRecordsRemoved: attendanceDeleteResult.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

