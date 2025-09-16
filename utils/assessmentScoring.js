// utils/assessmentScoring.js
function calculatePHQ9Score(answers) {
  const totalScore = answers.reduce((sum, answer) => sum + parseInt(answer), 0);
  
  let severity, recommendations;
  
  if (totalScore >= 20) {
    severity = 'severe';
    recommendations = [
      'Immediate professional help recommended',
      'Consider medication evaluation',
      'Regular counseling sessions advised',
      'Build strong support network'
    ];
  } else if (totalScore >= 15) {
    severity = 'moderately-severe';
    recommendations = [
      'Professional counseling recommended',
      'Regular monitoring needed',
      'Consider therapy options',
      'Lifestyle modifications helpful'
    ];
  } else if (totalScore >= 10) {
    severity = 'moderate';
    recommendations = [
      'Consider counseling support',
      'Practice self-care techniques',
      'Monitor symptoms regularly',
      'Engage in physical activity'
    ];
  } else if (totalScore >= 5) {
    severity = 'mild';
    recommendations = [
      'Continue self-monitoring',
      'Practice stress management',
      'Maintain social connections',
      'Consider preventive measures'
    ];
  } else {
    severity = 'minimal';
    recommendations = [
      'Continue current positive habits',
      'Regular self-assessment',
      'Maintain healthy lifestyle',
      'Stay connected with support system'
    ];
  }
  
  return { totalScore, severity, recommendations };
}

function calculateGAD7Score(answers) {
  const totalScore = answers.reduce((sum, answer) => sum + parseInt(answer), 0);
  
  let severity, recommendations;
  
  if (totalScore >= 15) {
    severity = 'severe';
    recommendations = [
      'Professional help strongly recommended',
      'Consider anxiety management therapy',
      'Medication evaluation may be helpful',
      'Learn anxiety coping strategies'
    ];
  } else if (totalScore >= 10) {
    severity = 'moderate';
    recommendations = [
      'Counseling support beneficial',
      'Practice relaxation techniques',
      'Regular exercise recommended',
      'Mindfulness meditation helpful'
    ];
  } else if (totalScore >= 5) {
    severity = 'mild';
    recommendations = [
      'Monitor anxiety levels',
      'Practice stress reduction',
      'Maintain regular routine',
      'Consider counseling if worsens'
    ];
  } else {
    severity = 'minimal';
    recommendations = [
      'Continue current management',
      'Regular self-monitoring',
      'Healthy lifestyle maintenance',
      'Build resilience skills'
    ];
  }
  
  return { totalScore, severity, recommendations };
}

function calculateGHQScore(answers) {
  const totalScore = answers.reduce((sum, answer) => sum + parseInt(answer), 0);
  
  let severity, recommendations;
  
  if (totalScore >= 24) {
    severity = 'severe';
    recommendations = [
      'Comprehensive mental health evaluation',
      'Professional support recommended',
      'Multiple intervention strategies',
      'Regular monitoring essential'
    ];
  } else if (totalScore >= 16) {
    severity = 'moderate';
    recommendations = [
      'Consider professional guidance',
      'Focus on stress management',
      'Improve work-life balance',
      'Social support important'
    ];
  } else if (totalScore >= 8) {
    severity = 'mild';
    recommendations = [
      'Self-care practices important',
      'Monitor mental health',
      'Maintain social connections',
      'Regular physical activity'
    ];
  } else {
    severity = 'minimal';
    recommendations = [
      'Good mental health maintenance',
      'Continue positive habits',
      'Regular health check-ins',
      'Preventive measures'
    ];
  }
  
  return { totalScore, severity, recommendations };
}

module.exports = {
  calculatePHQ9Score,
  calculateGAD7Score,
  calculateGHQScore
};