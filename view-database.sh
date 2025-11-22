#!/bin/bash
# Database Viewer Script

echo "=========================================="
echo "📊 SkillPilot Database Overview"
echo "=========================================="
echo ""

echo "📋 All Tables:"
docker exec skillpilot-postgres psql -U skillpilot -d skillpilot_db -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 2>&1 | grep -v "table_name" | grep -v "---" | grep -v "row" | grep -v "^$"

echo ""
echo "📊 Table Row Counts:"
docker exec skillpilot-postgres psql -U skillpilot -d skillpilot_db -c "
SELECT 
  'users' as table_name, COUNT(*) as rows FROM users
UNION ALL SELECT 'learners', COUNT(*) FROM learners
UNION ALL SELECT 'githubProfiles', COUNT(*) FROM \"githubProfiles\"
UNION ALL SELECT 'jiraData', COUNT(*) FROM \"jiraData\"
UNION ALL SELECT 'contentResults', COUNT(*) FROM \"contentResults\"
UNION ALL SELECT 'skillProfiles', COUNT(*) FROM \"skillProfiles\"
UNION ALL SELECT 'learningPaths', COUNT(*) FROM \"learningPaths\"
UNION ALL SELECT 'externalLinks', COUNT(*) FROM \"externalLinks\"
UNION ALL SELECT 'userExternalLinks', COUNT(*) FROM \"userExternalLinks\"
ORDER BY table_name;
" 2>&1

echo ""
echo "👥 Users:"
docker exec skillpilot-postgres psql -U skillpilot -d skillpilot_db -c "SELECT id, email, role FROM users;" 2>&1

echo ""
echo "👤 Learners (first 5):"
docker exec skillpilot-postgres psql -U skillpilot -d skillpilot_db -c "SELECT id, name, email, role, department FROM learners LIMIT 5;" 2>&1

echo ""
echo "📈 Content Results Summary:"
docker exec skillpilot-postgres psql -U skillpilot -d skillpilot_db -c "SELECT \"contentType\", COUNT(*) as count, AVG(percentage) as avg_score FROM \"contentResults\" GROUP BY \"contentType\";" 2>&1

