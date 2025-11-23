#!/bin/bash
echo "🧪 Testing Progress Update..."
echo ""
echo "Current state before test:"
docker exec skillpilot-postgres psql -U skillpilot -d skillpilot_db -c "
SELECT 
  l.email,
  (SELECT COUNT(*) FROM \"contentResults\" WHERE \"learnerId\" = l.id AND \"contentType\" IN ('quiz', 'coding-challenge')) as actual,
  lp.\"completedModules\" as stored,
  lp.progress
FROM learners l
JOIN \"learningPaths\" lp ON l.id = lp.\"learnerId\"
WHERE l.email = 'ahad.h@dplit.com';
"

echo ""
echo "📋 Next time you complete a quiz/challenge, check the logs:"
echo "   docker logs skillpilot-api --tail 20 | grep -i progress"
echo ""
echo "The progress should update automatically!"
