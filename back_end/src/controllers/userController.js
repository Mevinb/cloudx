/**
 * User Controller
 * Handles user management operations
 */

const { User, Attendance, Submission } = require('../models');
const { asyncHandler, AppError } = require('../middleware');

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private (Admin/Teacher)
 */
const getUsers = asyncHandler(async (req, res) => {
  const { role, batch, search, page = 1, limit = 20 } = req.query;
  
  // Build query
  const query = { isActive: true };
  
  if (role) {
    query.role = role;
  }
  
  if (batch) {
    query.batch = batch;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [users, total] = await Promise.all([
    User.find(query)
      .select('-__v')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query)
  ]);
  
  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @desc    Get user profile with stats
 * @route   GET /api/v1/users/:id/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Get attendance summary
  const attendanceSummary = await Attendance.getUserSummary(userId);
  
  // Get assignment stats
  const submissions = await Submission.find({ student: userId });
  const assignmentStats = {
    total: submissions.length,
    graded: submissions.filter(s => s.status === 'graded').length,
    pending: submissions.filter(s => s.status === 'submitted' || s.status === 'late').length,
    averageScore: submissions.filter(s => s.score != null).length > 0
      ? Math.round(submissions.filter(s => s.score != null).reduce((a, b) => a + b.score, 0) / 
          submissions.filter(s => s.score != null).length)
      : null
  };
  
  res.status(200).json({
    success: true,
    data: {
      user,
      attendance: attendanceSummary,
      assignments: assignmentStats
    }
  });
});

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private (Admin)
 */
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, batch, skills, bio, isActive } = req.body;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Update fields
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (batch !== undefined) user.batch = batch;
  if (skills) user.skills = skills;
  if (bio !== undefined) user.bio = bio;
  if (isActive !== undefined) user.isActive = isActive;
  
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

/**
 * @desc    Delete user (deactivate)
 * @route   DELETE /api/v1/users/:id
 * @access  Private (Admin)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Prevent deleting yourself
  if (user._id.toString() === req.user._id.toString()) {
    throw new AppError('Cannot delete your own account', 400);
  }
  
  // Soft delete
  user.isActive = false;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'User deactivated successfully'
  });
});

/**
 * @desc    Get all students
 * @route   GET /api/v1/users/students
 * @access  Private (Teacher/Admin)
 */
const getStudents = asyncHandler(async (req, res) => {
  const { batch, search } = req.query;
  
  const query = { role: 'student', isActive: true };
  
  if (batch) {
    query.batch = batch;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  const students = await User.find(query).select('-__v').sort({ name: 1 });
  
  res.status(200).json({
    success: true,
    data: students,
    count: students.length
  });
});

/**
 * @desc    Get member stats for dashboard
 * @route   GET /api/v1/users/stats
 * @access  Private (Teacher/Admin)
 */
const getMemberStats = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    totalTeachers,
    totalAdmins,
    studentsByBatch
  ] = await Promise.all([
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'teacher', isActive: true }),
    User.countDocuments({ role: 'admin', isActive: true }),
    User.aggregate([
      { $match: { role: 'student', isActive: true } },
      { $group: { _id: '$batch', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ])
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      total: totalStudents + totalTeachers + totalAdmins,
      students: totalStudents,
      teachers: totalTeachers,
      admins: totalAdmins,
      byBatch: studentsByBatch
    }
  });
});

module.exports = {
  getUsers,
  getUser,
  getUserProfile,
  updateUser,
  deleteUser,
  getStudents,
  getMemberStats
};
