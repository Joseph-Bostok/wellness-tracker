# 🧠 Wellness Tracker App

Track mood, sleep, meals, hydration, and more — with clinician feedback to support long-term mental and physical wellness.

---

## 🔧 Tech Stack

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)  
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase)  
![Tailwind CSS](https://img.shields.io/badge/UI-TailwindCSS-38BDF8?logo=tailwindcss)  
![Recharts](https://img.shields.io/badge/Charts-Recharts-purple)  
![Day.js](https://img.shields.io/badge/Date_Handling-Day.js-orange)  
![Status](https://img.shields.io/badge/Status-In_Development-yellow)

---

## 📊 Features

### ✅ Core Functionality
- Mood tracking with emoji ratings and analytics
- Sleep tracking with hours + quality score
- Meal logging by type with daily log display
- Visual dashboard: wellness score, weekly trends, streaks
- Achievement system based on logged behaviors

---

## 🚀 Upcoming Features

### 🔆 Sunlight & Hydration Tracking
Track key daily wellness habits:
- ☀️ Minutes of sunlight exposure
- 💧 Ounces of water consumed

📈 Displayed with charts or progress rings

### 👩‍⚕️ Clinician Feedback & Insights
- Clinicians can view wellness trends of assigned clients
- Comment on categories (mood, sleep, meals, etc.)
- Clients receive comments in their dashboard (like a support feed)

---

## 🗂️ Planned Database Tables

| Table Name            | Description                                     |
|------------------------|-------------------------------------------------|
| `users`               | Supabase Auth users                             |
| `journal_entries`     | Mood logs with emoji + optional notes           |
| `sleep_logs`          | Sleep hours + quality emoji                     |
| `meal_logs`           | Meals with type and description                 |
| `exercise_logs`       | Exercise entries with duration and date         |
| `wellness_logs`       | Daily sunlight & hydration tracking             |
| `clinicians`          | Authenticated clinician users                   |
| `clients_clinicians`  | Links clients to clinicians (many-to-many)      |
| `feedback_comments`   | Comments/notes per client per category          |

---

## ✅ Development Progress

### Core Wellness Features
- [x] Mood tracker + average score & pie chart
- [x] Sleep tracker with editable logs
- [x] Meal logger with history display
- [ ] Sunlight exposure tracking
- [ ] Hydration logging + chart

### Clinician Tools
- [ ] Clinician login/role setup
- [ ] Assign clients to clinician
- [ ] Clinician dashboard (view client data)
- [ ] Comment & feedback functionality
- [ ] Client dashboard feedback view