# AtomTrack AI — In-House Goal Setting & Tracking Portal

AtomTrack AI is a web-based enterprise Goal Setting and Tracking Portal built for the AtomQuest Hackathon 1.0 problem statement. It digitizes the complete employee goal lifecycle: goal creation, validation, manager approval, locked goal sheets, quarterly check-ins, achievement tracking, shared departmental KPIs, audit governance, analytics, and reporting.

The portal is designed around three role-based journeys:

- Employee
- Manager / L1
- Admin / HR

---

## Live Demo

✅ Fully functional deployed link: https://atomtrack-kwe6.vercel.app/

---

## Source Code

GitHub repository: https://github.com/Shalinijha0701/ATOMTRACK

---

## Project Objective

Organizations often depend on spreadsheets, emails, and offline review cycles for goal tracking. This creates blind spots for managers, employees, and HR teams.

AtomTrack AI solves this by providing a structured digital portal that supports:

- Goal creation and alignment
- Manager approval workflow
- Quarterly achievement capture
- Performance visibility
- Shared departmental KPIs
- Audit-ready change tracking
- Admin-level governance dashboards

---

## Problem Statement Coverage

### Phase 1 — Goal Creation and Approval

AtomTrack AI supports the complete Phase 1 flow:

- Employee-facing goal sheet creation
- Thrust area selection
- Goal title and description
- Unit of Measurement selection
- Target and weightage setting
- Goal sheet validation
- Manager review workflow
- Inline target and weightage editing
- Return for rework
- Approval and locking
- Shared departmental KPIs

Validation rules implemented:

```txt
Total weightage across goals = 100%
Minimum weightage per goal = 10%
Maximum goals per employee = 8
```

---

### Phase 2 — Achievement Tracking and Quarterly Check-ins

AtomTrack AI supports the quarterly achievement tracking cycle.

Employees can:

- Enter actual achievement
- Update goal status
- Submit quarterly progress

Managers can:

- View planned vs actual achievement
- Add structured check-in comments
- Monitor team progress
- Track pending check-ins

Supported check-in periods:

```txt
Goal Setting  : May
Q1 Check-in   : July
Q2 Check-in   : October
Q3 Check-in   : January
Q4 / Annual   : March / April
```

---

## User Roles and Capabilities

### Employee

Employees can:

- Create goal sheets
- Add up to 8 goals
- Save goals as draft
- Submit goals for manager approval
- View locked goals after approval
- Add quarterly achievement updates
- Track progress status

---

### Manager / L1

Managers can:

- View team goal sheets
- Review submitted goals
- Edit target and weightage inline
- Approve goal sheets
- Return goal sheets for rework
- Conduct quarterly check-ins
- Add manager comments
- Track team completion

---

### Admin / HR

Admins can:

- View all users and goal sheets
- Create shared departmental KPIs
- Push shared goals to multiple employees
- Monitor completion dashboards
- View audit logs
- Track governance activity
- Review analytics

---

## Key Features

### 1. Goal Sheet Management

Employees can create structured goal sheets with goal title, description, thrust area, UoM type, target, and weightage.

The portal prevents invalid submissions using live validation.

Example validation messages:

```txt
Your total weightage is 75%. Add 25% more to submit.
Each goal must have at least 10% weightage.
You can add a maximum of 8 goals only.
```

---

### 2. Manager Approval Workflow

After submission, goal sheets move to the manager dashboard.

Manager actions:

```txt
Review goal sheet
Edit target inline
Edit weightage inline
Approve goal sheet
Return for rework with comment
```

Once approved, goals are locked and cannot be edited by the employee.

---

### 3. Goal Locking

Approved goals are locked.

This ensures:

- No unauthorized changes after approval
- Better governance
- Cleaner audit trail
- Appraisal-ready data integrity

Only Admin / HR can unlock goals in a production extension.

---

### 4. Shared Goals / Department KPIs

Admin can create a departmental KPI and assign it to multiple employees.

Shared goal behavior:

```txt
Goal title      : Read-only
Target          : Read-only
Weightage       : Editable by recipient
Achievement     : Synced from primary owner
```

This supports department-level goal alignment.

---

### 5. Quarterly Check-ins

The system supports Q1, Q2, Q3, and annual check-ins.

Each check-in contains:

- Planned target
- Actual achievement
- Goal status
- Manager comment
- Progress score

Goal statuses:

```txt
Not Started
On Track
Completed
Overdue
```

---

### 6. Progress Score Engine

AtomTrack AI calculates progress using UoM-based formulas.

#### UoM Types

```txt
MAX       Higher is better
MIN       Lower is better
ZERO      Zero means success
TIMELINE  Completion against deadline
```

#### Score Formula

```txt
MAX Score      = Actual / Target
MIN Score      = Target / Actual
ZERO Score     = 100% if Actual is 0, else 0%
TIMELINE Score = 100% if completed before deadline, else 0%
```

#### Score Band

```txt
>= 90%     On Track
60% - 89%  At Risk
< 60%      Behind
```

---

### 7. Analytics Dashboard

The analytics module provides organization-level visibility.

It includes:

- Goal distribution by thrust area
- UoM distribution
- Goal sheet status count
- Average progress score
- Completion overview
- Manager performance overview

Charts are rendered using Chart.js.

---

### 8. Audit Trail

The audit trail logs important system actions.

Logged details include:

```txt
Actor
Action
Goal sheet
Resource changed
Old value
New value
Timestamp
Message
```

Examples:

```txt
Employee submitted goal sheet
Manager approved goal sheet
Admin added shared goal
Employee recorded Q1 check-in
```

This directly supports audit-ready governance.

---

### 9. Reporting and Export Readiness

The current demo supports reporting views.

Production-ready extensions can include:

- CSV export
- Excel export
- Achievement report
- Completion dashboard export
- Audit log export

---

### 10. Bonus Feature Readiness

The project architecture supports further bonus features:

- Microsoft Entra ID integration
- Email notifications
- Microsoft Teams notifications
- Escalation engine
- QoQ analytics
- Manager effectiveness dashboard
- AI SMART goal assistant

---

# System Architecture

## High-Level Architecture

```txt
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                                                             │
│  Employee UI        Manager UI        Admin / HR UI          │
│      │                 │                  │                  │
└──────┼─────────────────┼──────────────────┼──────────────────┘
       │                 │                  │
       └─────────────────┴──────────────────┴──────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
│                                                             │
│  public/index.html                                           │
│  React via CDN                                               │
│  Tailwind CSS via CDN                                        │
│  Chart.js via CDN                                            │
│                                                             │
│  Responsibilities:                                           │
│  - Role-based screens                                        │
│  - Goal form UI                                              │
│  - Validation messages                                       │
│  - Dashboards                                                │
│  - Charts                                                    │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Serverless API                     │
│                                                             │
│  /api/users                                                  │
│  /api/goalsheets                                             │
│  /api/goalsheets/submit                                      │
│  /api/goalsheets/approve                                     │
│  /api/checkins                                               │
│  /api/sharedGoals                                            │
│  /api/analytics                                              │
│  /api/audit                                                  │
│                                                             │
│  Responsibilities:                                           │
│  - Business logic                                            │
│  - Role workflows                                            │
│  - Goal validation                                           │
│  - Approval state transitions                                │
│  - Check-in updates                                          │
│  - Shared KPI assignment                                     │
│  - Audit logging                                             │
│  - Analytics aggregation                                     │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                         Data Layer                           │
│                                                             │
│  data.json                                                   │
│  /tmp serverless runtime storage                             │
│                                                             │
│  Demo entities:                                              │
│  - users                                                     │
│  - goalSheets                                                │
│  - goals                                                     │
│  - sharedGoals                                               │
│  - quarterlyCheckins                                         │
│  - auditLogs                                                 │
│  - notifications                                             │
│                                                             │
│  Production replacement:                                     │
│  Supabase PostgreSQL / NeonDB / MongoDB Atlas                │
└─────────────────────────────────────────────────────────────┘
```

---

## Request Flow

### Employee Goal Submission Flow

```txt
Employee
   │
   ▼
Create / edit goals in frontend
   │
   ▼
Frontend validates weightage and max goal count
   │
   ▼
POST /api/goalsheets
   │
   ▼
Goal sheet saved as draft
   │
   ▼
POST /api/goalsheets/submit
   │
   ▼
Status becomes SUBMITTED
   │
   ▼
Manager sees it in approval dashboard
```

---

### Manager Approval Flow

```txt
Manager
   │
   ▼
GET /api/goalsheets?managerId=u3
   │
   ▼
Review submitted employee goal sheets
   │
   ▼
Edit target / weightage if required
   │
   ▼
POST /api/goalsheets/approve
   │
   ├── action = approve
   │       ▼
   │   status = APPROVED
   │
   └── action = return
           ▼
       status = RETURNED
```

---

### Quarterly Check-in Flow

```txt
Employee
   │
   ▼
Select quarter
   │
   ▼
Enter actual achievement
   │
   ▼
POST /api/checkins
   │
   ▼
Backend stores achievement
   │
   ▼
Analytics recomputes progress
   │
   ▼
Manager can review planned vs actual
```

---

### Shared KPI Flow

```txt
Admin / HR
   │
   ▼
Create shared KPI
   │
   ▼
POST /api/sharedGoals
   │
   ▼
Backend creates shared goal
   │
   ▼
Goal is inserted into selected employee goal sheets
   │
   ▼
Audit log records the change
```

---

# Deployment

## Vercel Deployment Guide

### Required Structure

```txt
ATOMTRACK/
│
├── api/
│   ├── users.js
│   ├── checkins.js
│   ├── analytics.js
│   ├── audit.js
│   ├── utils.js
│   │
│   ├── goalsheets/
│   │   ├── index.js
│   │   ├── submit.js
│   │   └── approve.js
│   │
│   └── sharedGoals/
│       └── index.js
│
├── public/
│   └── index.html
│
├── data.json
├── package.json
├── vercel.json
└── README.md
```

### Recommended Vercel Settings

```txt
Framework Preset : Other
Build Command    : Leave empty
Output Directory : public
Install Command  : npm install
```

### Local Development

Install Vercel CLI:

```bash
npm install -g vercel
```

Run locally:

```bash
vercel dev
```

Open:

```txt
http://localhost:3000
```

---

## Production Notes

The current demo uses JSON-based storage and temporary `/tmp` persistence in the serverless environment. For production, replace with a persistent data service such as Supabase PostgreSQL or MongoDB Atlas.

---

## Author

Shalini Jha
GitHub: https://github.com/Shalinijha0701
