const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const HealthRecord = require('./models/HealthRecord');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await User.deleteMany();
  await HealthRecord.deleteMany();
  console.log('🗑️  Cleared existing data');

  // Create users
  const users = await User.create([
    {
      username: 'john.patient',
      password: 'demo1234',
      fullName: 'John Smith',
      email: 'john@patient.com',
      role: 'patient'
    },
    {
      username: 'priya.nurse',
      password: 'demo1234',
      fullName: 'Priya Sharma',
      email: 'priya@hospital.com',
      role: 'nurse'
    },
    {
      username: 'raj.doctor',
      password: 'demo1234',
      fullName: 'Dr. Raj Kumar',
      email: 'raj@hospital.com',
      role: 'doctor'
    },
    {
      username: 'admin.secure',
      password: 'demo1234',
      fullName: 'System Admin',
      email: 'admin@quantumshield.com',
      role: 'admin'
    }
  ]);

  console.log(`✅ Created ${users.length} users`);

  const patient = users[0];
  const doctor = users[2];

  // Create health records
  await HealthRecord.create([
    {
      patientId: patient._id,
      patientName: patient.fullName,
      recordType: 'diagnosis',
      title: 'Type 2 Diabetes Diagnosis',
      description: 'Patient diagnosed with Type 2 Diabetes. HbA1c level: 8.2%. Starting metformin 500mg twice daily.',
      sensitivityLevel: 'high',
      data: { hba1c: 8.2, medication: 'Metformin 500mg', frequency: 'twice daily' },
      createdBy: doctor._id,
      createdByName: doctor.fullName,
      createdByRole: doctor.role,
      tags: ['diabetes', 'chronic']
    },
    {
      patientId: patient._id,
      patientName: patient.fullName,
      recordType: 'vital_signs',
      title: 'Routine Vital Signs Check',
      description: 'BP: 128/84 mmHg, HR: 72 bpm, Temp: 98.6°F, SpO2: 98%',
      sensitivityLevel: 'low',
      data: { bp: '128/84', hr: 72, temp: 98.6, spo2: 98 },
      createdBy: doctor._id,
      createdByName: doctor.fullName,
      createdByRole: doctor.role,
      tags: ['vitals', 'routine']
    },
    {
      patientId: patient._id,
      patientName: patient.fullName,
      recordType: 'lab_result',
      title: 'Complete Blood Count (CBC)',
      description: 'WBC: 7.2, RBC: 4.8, Hemoglobin: 14.2, Platelets: 220. All values within normal range.',
      sensitivityLevel: 'medium',
      data: { wbc: 7.2, rbc: 4.8, hemoglobin: 14.2, platelets: 220 },
      createdBy: doctor._id,
      createdByName: doctor.fullName,
      createdByRole: doctor.role,
      tags: ['lab', 'blood']
    },
    {
      patientId: patient._id,
      patientName: patient.fullName,
      recordType: 'prescription',
      title: 'Monthly Prescription',
      description: 'Metformin 500mg x60 tablets. Refill in 30 days.',
      sensitivityLevel: 'medium',
      data: { drug: 'Metformin', dose: '500mg', quantity: 60, refillDate: '2025-08-01' },
      createdBy: doctor._id,
      createdByName: doctor.fullName,
      createdByRole: doctor.role,
      isPrivate: false,
      tags: ['prescription', 'diabetes']
    },
    {
      patientId: patient._id,
      patientName: patient.fullName,
      recordType: 'allergy',
      title: 'Penicillin Allergy',
      description: 'Severe allergic reaction (anaphylaxis) to Penicillin. Avoid all beta-lactam antibiotics.',
      sensitivityLevel: 'critical',
      data: { allergen: 'Penicillin', reaction: 'Anaphylaxis', severity: 'Severe' },
      createdBy: doctor._id,
      createdByName: doctor.fullName,
      createdByRole: doctor.role,
      isPrivate: false,
      tags: ['allergy', 'critical']
    }
  ]);

  console.log('✅ Created health records');
  console.log('\n🔐 Demo Users:');
  console.log('  Patient  → john.patient   / demo1234');
  console.log('  Nurse    → priya.nurse    / demo1234');
  console.log('  Doctor   → raj.doctor     / demo1234');
  console.log('  Admin    → admin.secure   / demo1234');

  await mongoose.disconnect();
  console.log('\n✅ Seeding complete!');
}

seed().catch(console.error);
