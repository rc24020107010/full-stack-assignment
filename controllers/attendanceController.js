import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

/**
 * Normalizes any Date string or object to UTC midnight (00:00:00.000Z)
 */
const normalizeDate = (inputDate) => {
  const d = new Date(inputDate);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/**
 * @desc    Mark attendance for a student (Present / Absent)
 * @route   POST /api/attendance
 * @access  Admin / Faculty
 */
export const markAttendance = async (req, res, next) => {
  try {
    const { student: studentId, date, status } = req.body;

    // Check if the student exists
    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID: ${studentId}`,
      });
    }

    const normalizedDate = normalizeDate(date);

    // Check for duplicate attendance record for this student on the same date
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      date: normalizedDate,
    });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: `Duplicate attendance: Attendance for student '${studentExists.name}' (${studentExists.rollNumber}) has already been recorded for ${normalizedDate.toISOString().split('T')[0]}.`,
      });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      student: studentId,
      date: normalizedDate,
      status,
    });

    // Populate student information
    const populatedAttendance = await attendance.populate(
      'student',
      'name rollNumber email course semester'
    );

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully.',
      data: populatedAttendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all attendance records with populated student details
 * @route   GET /api/attendance
 * @access  Public / Faculty / Admin
 */
export const getAllAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find()
      .populate('student', 'name rollNumber email course semester')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance records of an individual student
 * @route   GET /api/attendance/student/:studentId
 * @access  Public / Faculty / Admin / Student
 */
export const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID: ${studentId}`,
      });
    }

    const records = await Attendance.find({ student: studentId })
      .populate('student', 'name rollNumber email course semester')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        course: student.course,
        semester: student.semester,
      },
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Calculate and get attendance percentage for an individual student
 * @route   GET /api/attendance/percentage/:studentId
 * @access  Public / Faculty / Admin / Student
 */
export const getAttendancePercentage = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student not found with ID: ${studentId}`,
      });
    }

    // Retrieve all attendance records for this student
    const records = await Attendance.find({ student: studentId });

    const totalAttendanceRecords = records.length;

    // Handle case where no attendance records exist
    if (totalAttendanceRecords === 0) {
      return res.status(200).json({
        success: true,
        student: {
          id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          course: student.course,
          semester: student.semester,
        },
        totalRecords: 0,
        presentDays: 0,
        absentDays: 0,
        attendancePercentage: 0,
        message: 'No attendance records exist for this student yet.',
      });
    }

    const presentDays = records.filter(
      (record) => record.status === 'Present'
    ).length;

    const absentDays = totalAttendanceRecords - presentDays;

    // Formula: (Present Days / Total Attendance Records) * 100
    const rawPercentage = (presentDays / totalAttendanceRecords) * 100;
    const attendancePercentage = Number(rawPercentage.toFixed(2));

    res.status(200).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        course: student.course,
        semester: student.semester,
      },
      totalRecords: totalAttendanceRecords,
      presentDays,
      absentDays,
      attendancePercentage,
      statusRemark:
        attendancePercentage >= 75
          ? 'Eligible (Attendance criteria >= 75% met)'
          : 'Shortage (Attendance below 75%)',
    });
  } catch (error) {
    next(error);
  }
};

