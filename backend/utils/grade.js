const gradeBands = [
  { min: 70, grade: 'A', remarks: 'Excellent' },
  { min: 60, grade: 'B', remarks: 'Very Good' },
  { min: 50, grade: 'C', remarks: 'Good' },
  { min: 45, grade: 'D', remarks: 'Fair' },
  { min: 40, grade: 'E', remarks: 'Pass' },
  { min: 0, grade: 'F', remarks: 'Needs Improvement' }
];

function calculateGrade(assessmentScore = 0, examScore = 0) {
  const totalScore = Number(assessmentScore || 0) + Number(examScore || 0);
  const band = gradeBands.find((item) => totalScore >= item.min) || gradeBands[gradeBands.length - 1];
  return { totalScore, grade: band.grade, remarks: band.remarks };
}

module.exports = { calculateGrade };
