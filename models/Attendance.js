import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      set: (val) => {
        if (!val) return val;
        const d = new Date(val);
        // Normalize date to start of UTC day to ensure strict single-day uniqueness
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      },
    },
    status: {
      type: String,
      required: [true, 'Attendance status is required'],
      enum: {
        values: ['Present', 'Absent'],
        message: '{VALUE} is not a valid status. Allowed values are "Present" or "Absent".',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to strictly enforce one attendance entry per student per day
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;

