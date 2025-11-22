# Employee Creation Flow - Updated

## ✅ Current Implementation

### Backend Logic (No Email)

**Endpoint:** `POST /employees` (requires JWT token)

**Process:**
1. Admin creates employee with:
   - Name, Email, Password, Role
   - Position, Phone, Location (optional)
   - Skills (for learners)

2. Backend creates:
   - **Learner record** in `learners` table:
     - Status: `active`
     - Growth Plan Status: `active`
     - All provided information stored
   
   - **User account** in `users` table:
     - Email
     - Password (hashed with bcrypt)
     - Role (admin or learner)

3. **No email sending** - completely removed

4. Employee can login immediately with:
   - Email (from form)
   - Password (from form)

### Database Schema

**learners table:**
```sql
- id (SERIAL)
- name
- email (UNIQUE)
- role
- department
- status = 'active'
- growthPlanStatus = 'active'
- phone
- location
- linkedinConnected (BOOLEAN, default false)
- jiraConnected (BOOLEAN, default false)
- teamsConnected (BOOLEAN, default false)
- createdAt
- updatedAt
```

**users table:**
```sql
- id (SERIAL)
- email (UNIQUE)
- password (hashed with bcrypt)
- role (admin/learner/super_admin)
- created_at
- updated_at
```

### Employee Login Flow

1. Employee uses credentials set by admin
2. Login via `POST /auth/login`
3. Receives JWT token
4. Can access:
   - Dashboard (`/dashboard`)
   - Profile update (`GET /profile`, `PUT /profile`)
   - Connect integrations (LinkedIn, Jira, Teams)

### Profile Update

Employee can update:
- Phone
- Location
- Connect LinkedIn (with profile URL)
- Connect Jira
- Connect Teams

All updates saved to `learners` table.

## 🚀 To Start Project

```bash
# Create .env file (optional - defaults provided)
cp .env.example .env
# Edit .env with your credentials

# Start all services
docker compose up -d --build

# Wait for services (30 seconds)
sleep 30

# Seed admin user (first time only)
docker compose exec api node scripts/seed-admin.js
```

## 📝 API Endpoints

### Create Employee
```bash
POST /employees
Headers: Authorization: Bearer <JWT_TOKEN>
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "learner",
  "position": "Frontend Developer",
  "phone": "+1234567890",
  "location": "New York",
  "skills": ["React", "JavaScript"]
}
```

### Employee Login
```bash
POST /auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
Response: {
  "access_token": "JWT_TOKEN",
  "user": { "id": 1, "email": "john@example.com", "role": "learner" }
}
```

### Get Profile
```bash
GET /profile
Headers: Authorization: Bearer <JWT_TOKEN>
```

### Update Profile
```bash
PUT /profile
Headers: Authorization: Bearer <JWT_TOKEN>
Body: {
  "phone": "+1234567890",
  "location": "New York",
  "linkedinConnected": true,
  "linkedinProfile": "https://linkedin.com/in/johndoe"
}
```

## ✅ What Was Removed

- ❌ Email invitation flow
- ❌ MailerSend email sending from employee creation
- ❌ Invitation link generation for employees
- ❌ Redis token storage for employee invitations

## ✅ What Was Added

- ✅ Direct password setting during employee creation
- ✅ Immediate user account creation
- ✅ Active status from creation
- ✅ Profile update endpoints
- ✅ Integration connection (LinkedIn, Jira, Teams)

