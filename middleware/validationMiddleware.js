import mongoose from 'mongoose';

/**
 * Validates whether the given route parameter is a valid MongoDB ObjectId
 * @param {string} paramName - Name of the route parameter (e.g., 'id', 'studentId')
 */
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID: '${id}' is not a valid MongoDB ObjectId.`,
      });
    }
    next();
  };
};

/**
 * Validates request payload for adding a student
 */
export const validateStudentInput = (req, res, next) => {
  const { name, rollNumber, email, course, semester } = req.body;

  const missingFields = [];
  if (!name) missingFields.push('name');
  if (!rollNumber) missingFields.push('rollNumber');
  if (!email) missingFields.push('email');
  if (!course) missingFields.push('course');
  if (semester === undefined || semester === null) missingFields.push('semester');

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Validation Error: Missing required fields: ${missingFields.join(', ')}`,
    });
  }

  if (typeof semester !== 'number' || semester < 1 || semester > 12) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Semester must be a valid number between 1 and 12.',
    });
  }

  next();
};

/**
 * Validates request payload for marking attendance
 */
export const validateAttendanceInput = (req, res, next) => {
  const { student, date, status } = req.body;

  if (!student || !date || !status) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: student (ID), date, and status are required fields.',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(student)) {
    return res.status(400).json({
      success: false,
      message: `Validation Error: '${student}' is not a valid student ObjectId.`,
    });
  }

  const allowedStatuses = ['Present', 'Absent'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Validation Error: Status must be either 'Present' or 'Absent'. Received: '${status}'`,
    });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Invalid date format. Please provide a valid date string (e.g., YYYY-MM-DD).',
    });
  }

  next();
};

