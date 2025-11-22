# 🐘 DBeaver Database Connection Setup

## 📋 Connection Details

### PostgreSQL Connection Settings
- **Host**: `localhost`
- **Port**: `5433` ⚠️ (NOT 5432 - this is the mapped port)
- **Database**: `skillpilot_db`
- **Username**: `skillpilot`
- **Password**: `skillpilot123`
- **Driver**: PostgreSQL

## 🔧 Step-by-Step Setup in DBeaver

### Step 1: Open DBeaver
1. Launch DBeaver application

### Step 2: Create New Connection
1. Click **"New Database Connection"** button (plug icon) or
2. Go to **Database** → **New Database Connection**
3. Select **PostgreSQL** from the list
4. Click **Next**

### Step 3: Enter Connection Details
Fill in the following:

**Main Tab:**
- **Host**: `localhost`
- **Port**: `5433` ⚠️ **IMPORTANT: Use 5433, not 5432**
- **Database**: `skillpilot_db`
- **Username**: `skillpilot`
- **Password**: `skillpilot123`
- ✅ Check **"Save password"** (optional)

**Driver Properties Tab (Optional):**
- Leave defaults

### Step 4: Test Connection
1. Click **"Test Connection"** button
2. If driver is missing, DBeaver will prompt to download it - click **Download**
3. Wait for download and installation
4. Click **Test Connection** again
5. Should see: ✅ **"Connected"**

### Step 5: Finish
1. Click **Finish**
2. Connection will appear in Database Navigator panel

## 🔍 Verify Connection

After connecting, you should see:
- ✅ `skillpilot_db` database in the navigator
- ✅ All 18 tables listed under the database
- ✅ Can expand tables to see columns
- ✅ Can right-click tables to view data

## 📊 Quick View Commands

Once connected, you can:

1. **View Table Data**:
   - Right-click on any table → **View Data**
   - Or double-click the table

2. **Run SQL Queries**:
   - Right-click database → **SQL Editor** → **New SQL Script**
   - Enter your query and press **Ctrl+Enter** (or Cmd+Enter on Mac)

3. **View Table Structure**:
   - Right-click table → **Properties** → **Columns** tab

## 🐛 Troubleshooting

### Connection Refused
- **Check Docker**: Make sure PostgreSQL container is running
  ```bash
  docker-compose ps
  ```
- **Verify Port**: Ensure port 5433 is correct (not 5432)

### Authentication Failed
- **Check Credentials**: 
  - Username: `skillpilot`
  - Password: `skillpilot123`
- **Verify Database**: Database name is `skillpilot_db`

### Driver Not Found
- DBeaver will auto-download PostgreSQL driver
- If it fails, manually download from: https://jdbc.postgresql.org/

## 📋 Useful SQL Queries for DBeaver

### View All Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### View All Users
```sql
SELECT id, email, role FROM users;
```

### View All Learners
```sql
SELECT id, name, email, role, department FROM learners;
```

### View Content Results
```sql
SELECT 
  l.name,
  cr."contentType",
  cr.score,
  cr.percentage,
  cr."completedAt"
FROM "contentResults" cr
JOIN learners l ON cr."learnerId" = l.id
ORDER BY cr."completedAt" DESC;
```

### View Skill Profiles
```sql
SELECT 
  l.name,
  sp.status,
  sp."generatedAt"
FROM "skillProfiles" sp
JOIN learners l ON sp."learnerId" = l.id;
```

## ✅ Connection Summary

```
Host: localhost
Port: 5433
Database: skillpilot_db
Username: skillpilot
Password: skillpilot123
```

**Status**: Ready to connect! 🚀
