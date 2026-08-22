import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    isPaid: { type: Boolean, default: false },
    paymentDate: { type: Date, default: null },
  },
  { timestamps: true }
)

const Student = mongoose.model('Student', studentSchema)

export default Student
