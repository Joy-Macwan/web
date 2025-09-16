// controllers/assessmentController.js
const Assessment = require('../models/Assessment');
const { calculatePHQ9Score, calculateGAD7Score, calculateGHQScore } = require('../utils/assessmentScoring');

class AssessmentController {
  async listAssessments(req, res) {
    try {
      const assessments = await Assessment.find({ user: req.session.user.id })
        .sort({ createdAt: -1 });

      res.render('assessments/index', {
        title: 'Mental Health Assessments',
        assessments
      });
    } catch (error) {
      console.error('List assessments error:', error);
      req.flash('error', 'Failed to load assessments');
      res.redirect('/dashboard');
    }
  }

  renderPHQ9(req, res) {
    const questions = [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling or staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself or that you are a failure",
      "Trouble concentrating on things",
      "Moving or speaking slowly or being fidgety",
      "Thoughts that you would be better off dead"
    ];

    res.render('assessments/phq9', {
      title: 'PHQ-9 Depression Assessment',
      questions
    });
  }

  async submitPHQ9(req, res) {
    try {
      const answers = req.body.answers;
      const { totalScore, severity, recommendations } = calculatePHQ9Score(answers);

      const assessment = new Assessment({
        user: req.session.user.id,
        type: 'PHQ9',
        questions: answers.map((answer, index) => ({
          question: `PHQ9_Q${index + 1}`,
          answer,
          score: parseInt(answer)
        })),
        totalScore,
        severity,
        recommendations
      });

      await assessment.save();

      // Update user's mental health status
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.session.user.id, {
        'mentalHealthStatus.lastAssessment': new Date(),
        'mentalHealthStatus.riskLevel': severity === 'severe' ? 'high' : 
                                       severity === 'moderate' ? 'medium' : 'low'
      });

      res.redirect(`/assessments/results/${assessment._id}`);
    } catch (error) {
      console.error('Submit PHQ9 error:', error);
      req.flash('error', 'Failed to submit assessment');
      res.redirect('/assessments/phq9');
    }
  }

  renderGAD7(req, res) {
    const questions = [
      "Feeling nervous, anxious, or on edge",
      "Not being able to stop or control worrying",
      "Worrying too much about different things",
      "Trouble relaxing",
      "Being so restless that it's hard to sit still",
      "Becoming easily annoyed or irritable",
      "Feeling afraid as if something awful might happen"
    ];

    res.render('assessments/gad7', {
      title: 'GAD-7 Anxiety Assessment',
      questions
    });
  }

  async submitGAD7(req, res) {
    try {
      const answers = req.body.answers;
      const { totalScore, severity, recommendations } = calculateGAD7Score(answers);

      const assessment = new Assessment({
        user: req.session.user.id,
        type: 'GAD7',
        questions: answers.map((answer, index) => ({
          question: `GAD7_Q${index + 1}`,
          answer,
          score: parseInt(answer)
        })),
        totalScore,
        severity,
        recommendations
      });

      await assessment.save();
      res.redirect(`/assessments/results/${assessment._id}`);
    } catch (error) {
      console.error('Submit GAD7 error:', error);
      req.flash('error', 'Failed to submit assessment');
      res.redirect('/assessments/gad7');
    }
  }

  renderGHQ(req, res) {
    res.render('assessments/ghq', {
      title: 'GHQ General Health Assessment'
    });
  }

  async submitGHQ(req, res) {
    try {
      const answers = req.body.answers;
      const { totalScore, severity, recommendations } = calculateGHQScore(answers);

      const assessment = new Assessment({
        user: req.session.user.id,
        type: 'GHQ',
        questions: answers.map((answer, index) => ({
          question: `GHQ_Q${index + 1}`,
          answer,
          score: parseInt(answer)
        })),
        totalScore,
        severity,
        recommendations
      });

      await assessment.save();
      res.redirect(`/assessments/results/${assessment._id}`);
    } catch (error) {
      console.error('Submit GHQ error:', error);
      req.flash('error', 'Failed to submit assessment');
      res.redirect('/assessments/ghq');
    }
  }

  async getResults(req, res) {
    try {
      const assessment = await Assessment.findById(req.params.id)
        .populate('user', 'name');

      if (!assessment) {
        req.flash('error', 'Assessment not found');
        return res.redirect('/assessments');
      }

      res.render('assessments/results', {
        title: 'Assessment Results',
        assessment
      });
    } catch (error) {
      console.error('Get results error:', error);
      req.flash('error', 'Failed to load results');
      res.redirect('/assessments');
    }
  }
}

module.exports = new AssessmentController();