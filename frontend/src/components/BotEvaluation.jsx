function BotEvaluation({ evaluation, requirements }) {
  if (!evaluation || !evaluation.isProcessed) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500">
        <span className="text-3xl mb-2 block">⏳</span>
        Evaluation pending...
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const breakdown = evaluation.breakdown || {};
  const categories = [
    { name: 'Skills Match', score: breakdown.skillsScore || 0, weight: requirements?.weights?.skillsMatch || 40, icon: '🎯' },
    { name: 'Experience Match', score: breakdown.experienceScore || 0, weight: requirements?.weights?.experienceMatch || 30, icon: '💼' },
    { name: 'Education Match', score: breakdown.educationScore || 0, weight: requirements?.weights?.educationMatch || 20, icon: '🎓' },
    { name: 'Certifications', score: breakdown.certificationsScore || 0, weight: requirements?.weights?.certificationsMatch || 10, icon: '📜' }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className={`p-6 rounded-2xl border-2 ${getScoreColor(evaluation.score)} text-center`}>
        <div className="text-6xl font-bold mb-2">{evaluation.score}</div>
        <div className="text-lg font-semibold mb-1">Overall Score</div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${
          evaluation.decision === 'passed' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          <span className="text-xl">{evaluation.decision === 'passed' ? '✅' : '❌'}</span>
          <span className="uppercase">{evaluation.decision}</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Detailed Breakdown
        </h4>
        {categories.map((category, i) => (
          <div key={i} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900">{category.name}</div>
                  <div className="text-xs text-gray-500">Weight: {category.weight}%</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{category.score.toFixed(1)}</div>
                <div className="text-xs text-gray-500">out of 100</div>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getProgressColor(category.score)} transition-all duration-500`}
                style={{ width: `${category.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Reasoning */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          AI Feedback
        </h4>
        <p className="text-gray-700">{evaluation.reasoning}</p>
      </div>

      {/* Confidence */}
      {evaluation.confidence && (
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">AI Confidence Level</span>
            <span className="text-2xl font-bold text-indigo-600">{(evaluation.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${evaluation.confidence * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BotEvaluation;
