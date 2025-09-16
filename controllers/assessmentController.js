// controllers/assessmentController.js
const { supabase } = require('../utils/supabase');
const { calculatePHQ9Score, calculateGAD7Score, calculateGHQScore } = require('../utils/assessmentScoring');

class AssessmentController {
  // List all assessments for logged-in user
  async listAssessments(req, res) {
    try {
      const { data: assessments, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', req.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.render('assessments/index', {
        title: 'Mental Health Assessments',
        assessments
      });
    } catch (error) {
      console.error('List assessments error:', error.message);
      req.flash('error', 'Failed to load assessments');
      res.redirect('/dashboard');
    }
  }

  // Render PHQ9 form
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

  // Handle PHQ9 submission
  async submitPHQ9(req, res) {
    try {
      const answers = req.body.answers;
      const { totalScore, severity, recommendations } = calculatePHQ9Score(answers);

      const { data, error } = await supabase
        .from('assessments')
        .insert([{
          user_id: req.session.user.id,
          type: 'PHQ9',
          questions: answers.map((ans, i) => ({
            question: `PHQ9_Q${i + 1}`,
            answer: ans,
            score: parseInt(ans)
          })),
          total_score: totalScore,
          severity,
          recommendations
        }])
        .select()
        .single();

      if (error) throw error;

      // Update user's mental health status
      const riskLevel = severity === 'severe' ? 'high' :
                        severity === 'moderate' ? 'medium' : 'low';

      await supabase
        .from('users')
        .update({
          last_assessment: new Date(),
          risk_level: riskLevel
        })
        .eq('id', req.session.user.id);

      res.redirect(`/assessments/results/${data.id}`);
    } catch (error) {
      console.error('Submit PHQ9 error:', error.message);
      req.flash('error', 'Failed to submit assessment');
      res.redirect('/assessments/phq9');
    }
  }

  // Render GAD7
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

  // Submit GAD7
  async submitGAD7(req, res) {
    try {
      const answers = req.body.answers;
      const { totalScore, severity, recommendations } = calculateGAD7Score(answers);

      const { data, error } = await supabase
        .from('assessments')
        .insert([{
          user_id: req.session.user.id,
          type: 'GAD7',
          questions: answers.map((ans, i) => ({
            question: `GAD7_Q${i + 1}`,
            answer: ans,
            score: parseInt(ans)
          })),
          total_score: totalScore,
          severity,
          recommendations
        }])
        .select()
        .single();

      if (error) throw error;

      res.redirect(`/assessments/results/${data.id}`);
    } catch (error) {
      console.error('Submit GAD7 error:', error.message);
      req.flash('error', 'Failed to submit assessment');
      res.redirect('/assessments/gad7');
    }
  }

  // Render GHQ
  renderGHQ(req, res) {
    res.render('assessments/ghq', {
      title: 'GHQ General Health Assessment'
    });
  }

  // Submit GHQ
  async submitGHQ(req, res) {
    try {
      const answers = req.body.answers;
      const { totalScore, severity, recommendations } = calculateGHQScore(answers);

      const { data, error } = await supabase
        .from('assessments')
        .insert([{
          user_id: req.session.user.id,
          type: 'GHQ',
          questions: answers.map((ans, i) => ({
            question: `GHQ_Q${i + 1}`,
            answer: ans,
            score: parseInt(ans)
          })),
          total_score: totalScore,
          severity,
          recommendations
        }])
        .select()
        .single();

      if (error) throw error;

      res.redirect(`/assessments/results/${data.id}`);
    } catch (error) {
      console.error('Submit GHQ error:', error.message);
      req.flash('error', 'Failed to submit assessment');
      res.redirect('/assessments/ghq');
    }
  }

  // Get results
  async getResults(req, res) {
    try {
      const { data: assessment, error } = await supabase
        .from('assessments')
        .select('*, user:users(name)')
        .eq('id', req.params.id)
        .single();

      if (error || !assessment) {
        req.flash('error', 'Assessment not found');
        return res.redirect('/assessments');
      }

      res.render('assessments/results', {
        title: 'Assessment Results',
        assessment
      });
    } catch (error) {
      console.error('Get results error:', error.message);
      req.flash('error', 'Failed to load results');
      res.redirect('/assessments');
    }
  }
}

module.exports = new AssessmentController();
