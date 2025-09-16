// controllers/adminController.js
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Assessment = require('../models/Assessment');
const ForumPost = require('../models/ForumPost');
const ChatSession = require('../models/ChatSession');

class AdminController {
  async renderDashboard(req, res) {
    try {
      const [
        totalUsers,
        totalAppointments,
        totalAssessments,
        highRiskUsers,
        recentActivity
      ] = await Promise.all([
        User.countDocuments(),
        Appointment.countDocuments(),
        Assessment.countDocuments(),
        User.countDocuments({ 'mentalHealthStatus.riskLevel': 'high' }),
        this.getRecentActivity()
      ]);

      const stats = {
        totalUsers,
        totalAppointments,
        totalAssessments,
        highRiskUsers
      };

      res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        stats,
        recentActivity
      });
    } catch (error) {
      console.error('Admin dashboard error:', error);
      req.flash('error', 'Failed to load dashboard');
      res.redirect('/');
    }
  }

  async getAnalytics(req, res) {
    try {
      const [
        userGrowth,
        assessmentTrends,
        riskLevelDistribution,
        departmentStats
      ] = await Promise.all([
        this.getUserGrowthData(),
        this.getAssessmentTrendsData(),
        this.getRiskLevelDistribution(),
        this.getDepartmentStats()
      ]);

      res.render('admin/analytics', {
        title: 'Analytics Dashboard',
        userGrowth,
        assessmentTrends,
        riskLevelDistribution,
        departmentStats
      });
    } catch (error) {
      console.error('Analytics error:', error);
      req.flash('error', 'Failed to load analytics');
      res.redirect('/admin/dashboard');
    }
  }

  async listUsers(req, res) {
    try {
      const { role, riskLevel, search } = req.query;
      let query = {};
      
      if (role) query.role = role;
      if (riskLevel) query['mentalHealthStatus.riskLevel'] = riskLevel;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } }
        ];
      }

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 });

      res.render('admin/users', {
        title: 'User Management',
        users,
        currentRole: role,
        currentRiskLevel: riskLevel,
        searchQuery: search
      });
    } catch (error) {
      console.error('List users error:', error);
      req.flash('error', 'Failed to load users');
      res.redirect('/admin/dashboard');
    }
  }

  async getReports(req, res) {
    try {
      const { startDate, endDate, type } = req.query;
      
      let reportData = {};
      switch (type) {
        case 'mental-health':
          reportData = await this.getMentalHealthReport(startDate, endDate);
          break;
        case 'usage':
          reportData = await this.getUsageReport(startDate, endDate);
          break;
        case 'appointments':
          reportData = await this.getAppointmentsReport(startDate, endDate);
          break;
        default:
          reportData = await this.getOverallReport(startDate, endDate);
      }

      res.render('admin/reports', {
        title: 'Reports',
        reportData,
        reportType: type,
        startDate,
        endDate
      });
    } catch (error) {
      console.error('Get reports error:', error);
      req.flash('error', 'Failed to generate reports');
      res.redirect('/admin/dashboard');
    }
  }

  async getModerationQueue(req, res) {
    try {
      const [
        reportedPosts,
        highRiskSessions,
        flaggedContent
      ] = await Promise.all([
        ForumPost.find({ reportCount: { $gt: 0 } })
          .populate('author', 'name')
          .sort({ reportCount: -1 }),
        ChatSession.find({ riskLevel: 'high', needsHumanIntervention: true })
          .populate('user', 'name email'),
        Assessment.find({ 'counselorReview.reviewed': false, severity: { $in: ['severe', 'moderately-severe'] } })
          .populate('user', 'name email')
      ]);

      res.render('admin/moderation', {
        title: 'Moderation Queue',
        reportedPosts,
        highRiskSessions,
        flaggedContent
      });
    } catch (error) {
      console.error('Moderation queue error:', error);
      req.flash('error', 'Failed to load moderation queue');
      res.redirect('/admin/dashboard');
    }
  }

  async moderateContent(req, res) {
    try {
      const { type, id } = req.params;
      const { action, notes } = req.body;
      
      let result = {};
      switch (type) {
        case 'post':
          result = await this.moderatePost(id, action, notes, req.session.user.id);
          break;
        case 'session':
          result = await this.moderateSession(id, action, notes, req.session.user.id);
          break;
        case 'assessment':
          result = await this.moderateAssessment(id, action, notes, req.session.user.id);
          break;
      }

      res.json({ success: true, message: 'Content moderated successfully' });
    } catch (error) {
      console.error('Moderate content error:', error);
      res.status(500).json({ error: 'Failed to moderate content' });
    }
  }

  // Helper methods
  async getRecentActivity() {
    const activities = [];
    
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentAssessments = await Assessment.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name');
    const recentAppointments = await Appointment.find().sort({ createdAt: -1 }).limit(5).populate('student', 'name');
    
    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registered',
        description: `${user.name} registered`,
        timestamp: user.createdAt
      });
    });
    
    recentAssessments.forEach(assessment => {
      activities.push({
        type: 'assessment_taken',
        description: `${assessment.user.name} took ${assessment.type} assessment`,
        timestamp: assessment.createdAt
      });
    });
    
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }

  async getUserGrowthData() {
    return await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
  }

  async getAssessmentTrendsData() {
    return await Assessment.aggregate([
      {
        $group: {
          _id: {
            type: '$type',
            severity: '$severity'
          },
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getRiskLevelDistribution() {
    return await User.aggregate([
      {
        $group: {
          _id: '$mentalHealthStatus.riskLevel',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getDepartmentStats() {
    return await User.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          highRisk: {
            $sum: {
              $cond: [{ $eq: ['$mentalHealthStatus.riskLevel', 'high'] }, 1, 0]
            }
          }
        }
      }
    ]);
  }

  async moderatePost(postId, action, notes, moderatorId) {
    const post = await ForumPost.findById(postId);
    if (!post) throw new Error('Post not found');
    
    post.isModerated = true;
    post.moderatedBy = moderatorId;
    post.moderationNotes = notes;
    
    if (action === 'delete') {
      await ForumPost.deleteOne({ _id: postId });
    } else if (action === 'lock') {
      post.isLocked = true;
      await post.save();
    } else {
      await post.save();
    }
    
    return { success: true };
  }

  async moderateSession(sessionId, action, notes, moderatorId) {
    const session = await ChatSession.findById(sessionId);
    if (!session) throw new Error('Session not found');
    
    if (action === 'escalate') {
      session.escalatedTo = moderatorId;
      session.needsHumanIntervention = false;
    }
    
    await session.save();
    return { success: true };
  }

  async moderateAssessment(assessmentId, action, notes, moderatorId) {
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) throw new Error('Assessment not found');
    
    assessment.counselorReview.reviewed = true;
    assessment.counselorReview.reviewedBy = moderatorId;
    assessment.counselorReview.reviewDate = new Date();
    assessment.counselorReview.notes = notes;
    
    await assessment.save();
    return { success: true };
  }
}

module.exports = new AdminController();