import express from 'express'
import Student from '../models/Student.js'

const router = express.Router()

const starterStudents = [
  { name: 'Ali Hassan', studentId: 'S001', isPaid: true, paymentDate: new Date('2026-01-09') },
  { name: 'Sara Ahmed', studentId: 'S002', isPaid: false, paymentDate: null },
  { name: 'Omar Khalid', studentId: 'S003', isPaid: true, paymentDate: new Date('2026-01-11') },
  { name: 'Fatima Noor', studentId: 'S004', isPaid: false, paymentDate: null },
  { name: 'Yusuf Ibrahim', studentId: 'S005', isPaid: true, paymentDate: new Date('2026-01-14') },
  { name: 'Amina Tesfaye', studentId: 'S006', isPaid: true, paymentDate: new Date('2026-01-07') },
  { name: 'Bilal Mohammed', studentId: 'S007', isPaid: false, paymentDate: null },
  { name: 'Hana Bekele', studentId: 'S008', isPaid: true, paymentDate: new Date('2026-01-13') },
  { name: 'Dawit Alemu', studentId: 'S009', isPaid: false, paymentDate: null },
  { name: 'Meron Abate', studentId: 'S010', isPaid: true, paymentDate: new Date('2026-01-18') },
  { name: 'Nati Solomon', studentId: 'S011', isPaid: false, paymentDate: null },
  { name: 'Ruth Daniel', studentId: 'S012', isPaid: true, paymentDate: new Date('2026-01-20') },
]

async function ensureSeedData() {
  await Promise.all(
    starterStudents.map((student) =>
      Student.findOneAndUpdate(
        { studentId: student.studentId },
        {
          $setOnInsert: {
            name: student.name,
            studentId: student.studentId,
            isPaid: student.isPaid,
            paymentDate: student.paymentDate,
          },
        },
        { upsert: true, new: false }
      )
    )
  )
}

router.get('/payment-status', async (_req, res, next) => {
  try {
    await ensureSeedData()
    const students = await Student.find({})
      .sort({ name: 1 })
      .select('name studentId isPaid paymentDate')
    res.json(students)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/payment-status', async (req, res, next) => {
  try {
    const { isPaid, paymentDate } = req.body
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      {
        isPaid: Boolean(isPaid),
        paymentDate: isPaid ? (paymentDate || new Date()) : null,
      },
      { new: true, runValidators: true }
    ).select('name studentId isPaid paymentDate')

    if (!updated) {
      return res.status(404).json({ message: 'Student not found' })
    }

    return res.json(updated)
  } catch (error) {
    return next(error)
  }
})

router.post('/payment-status/reset-sample', async (_req, res, next) => {
  try {
    await Student.deleteMany({})
    await Student.insertMany(starterStudents)
    const students = await Student.find({})
      .sort({ name: 1 })
      .select('name studentId isPaid paymentDate')

    return res.json({
      message: 'Sample payment data reset successfully',
      count: students.length,
      students,
    })
  } catch (error) {
    return next(error)
  }
})

export default router
