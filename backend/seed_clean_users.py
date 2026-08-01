import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User, WellnessProfile, Appointment, DoctorCareNote
from apps.mood.models import MoodLog

print("Purging all existing users, appointments, care notes, and mood logs from database...")
User.objects.all().delete()
Appointment.objects.all().delete()
DoctorCareNote.objects.all().delete()
MoodLog.objects.all().delete()

print("\nSeeding 3 clean role accounts (1 Admin, 1 Doctor, 1 Client)...")

# 1. Executive Admin Account
admin_user = User.objects.create_superuser(
    email='admin@manmitra.ai',
    password='AdminPassword123!',
    full_name='Executive Admin',
    occupation='Platform Administrator',
    role=User.Role.ADMIN,
    is_active=True,
    is_verified=True,
)
p1, _ = WellnessProfile.objects.get_or_create(user=admin_user)
p1.onboarding_done = True
p1.save()
print("[OK] Admin Account Created: admin@manmitra.ai / AdminPassword123!")

# 2. Doctor / Specialist Account
doctor_user = User.objects.create_user(
    email='doctor@manmitra.ai',
    password='DoctorPassword123!',
    full_name='Dr. Sarah Smith',
    occupation='Clinical Psychologist & Mindfulness Coach',
    role=User.Role.THERAPIST,
    is_active=True,
    is_verified=True,
)
p2, _ = WellnessProfile.objects.get_or_create(user=doctor_user)
p2.onboarding_done = True
p2.save()
print("[OK] Doctor Account Created: doctor@manmitra.ai / DoctorPassword123!")

# 3. Regular Client / Member Account
client_user = User.objects.create_user(
    email='client@manmitra.ai',
    password='ClientPassword123!',
    full_name='Aarav Sharma',
    occupation='Software Engineer',
    role=User.Role.USER,
    is_active=True,
    is_verified=True,
)
p3, _ = WellnessProfile.objects.get_or_create(user=client_user)
p3.onboarding_done = True
p3.stress_level = 6
p3.primary_goals = ["Reduce daily anxiety", "Improve sleep quality", "Manage work stress"]
p3.save()
print("[OK] Client Account Created: client@manmitra.ai / ClientPassword123!")

# 4. Seed Real DB Mood Logs for Client
today = date.today()
MoodLog.objects.create(user=client_user, mood_score=5, mood_label='anxious', note='Work pressure feeling high today.', date=today - timedelta(days=4))
MoodLog.objects.create(user=client_user, mood_score=6, mood_label='neutral', note='Did 15 min breathing exercise.', date=today - timedelta(days=3))
MoodLog.objects.create(user=client_user, mood_score=7, mood_label='calm', note='Felt peaceful after evening walk.', date=today - timedelta(days=2))
MoodLog.objects.create(user=client_user, mood_score=8, mood_label='happy', note='Good CBT session with Dr. Sarah.', date=today - timedelta(days=1))
MoodLog.objects.create(user=client_user, mood_score=8, mood_label='grateful', note='Sleeping much better.', date=today)
print("[OK] Real DB Mood Check-in History Seeded for Client.")

# 5. Seed Real DB Appointments between Doctor and Client
Appointment.objects.create(
    doctor=doctor_user,
    client=client_user,
    time_slot='09:00 AM - 09:45 AM',
    session_type='Cognitive Behavioral Therapy (CBT)',
    meeting_type='Online Video Call',
    status=Appointment.Status.COMPLETED
)
Appointment.objects.create(
    doctor=doctor_user,
    client=client_user,
    time_slot='02:00 PM - 02:45 PM',
    session_type='Mindfulness & Sleep Restructuring',
    meeting_type='Online Video Call',
    status=Appointment.Status.UPCOMING
)
print("[OK] Real DB Appointments Seeded for Doctor Schedule.")

# 6. Seed Real DB Care Note
DoctorCareNote.objects.create(
    doctor=doctor_user,
    client=client_user,
    content='Patient Aarav Sharma is responding well to CBT reframing exercises. Stress level is currently 6/10.'
)
print("[OK] Real DB Doctor Care Note Seeded.")

print("\nDatabase reset complete! All doctor telemetry and schedules are 100% real database records.")
