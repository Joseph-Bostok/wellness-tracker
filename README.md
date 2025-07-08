🌱 Upcoming Features
🔆 Sunlight & Hydration Tracking
Track daily wellness metrics beyond mood and sleep:

Sunlight Exposure

Log minutes spent outdoors each day

Hydration

Log daily water intake in ounces

🔧 Implementation:

New table: wellness_logs

Fields: user_id, date, sunlight_minutes, water_oz

Dashboard components:

Daily entry form

Visual summary (charts, rings, or progress bars)

👩‍⚕️ Clinician Feedback Dashboard
Enable clinicians to monitor client progress and provide personalized feedback.

Clinician capabilities:

View assigned clients' mood, sleep, hydration, etc.

Leave feedback/comments per category

View client history across time

Client capabilities:

See new clinician feedback on their dashboard

(Optional) Reply to or acknowledge comments

🔧 Implementation:

New tables:

clinicians: clinician accounts

clients_clinicians: many-to-many relationships

feedback_comments: messages tied to specific logs or categories

Clinician view to browse & comment on clients

Client dashboard alert: “📬 New feedback from your clinician”
