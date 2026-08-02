"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Star, Calendar, Clock, Video, CheckCircle2, Search,
  ShieldCheck, CreditCard, Filter, AlertCircle, ArrowRight, UserCheck, X
} from 'lucide-react';
import { API_URL } from '@/config';

interface TherapistBookingProps {
  accessToken?: string;
  onBookingSuccess?: () => void;
}

const DOCTORS_LIST = [
  {
    id: 'doc-1',
    name: 'Dr. Ananya Roy, Ph.D.',
    title: 'Senior Clinical Psychologist',
    rating: 4.9,
    reviewsCount: 124,
    experienceYears: 12,
    fee: '₹1,500 / 45 mins',
    specialties: ['Anxiety & Panic', 'CBT Therapy', 'Burnout Relief'],
    availability: ['10:00 AM - 10:45 AM', '02:00 PM - 02:45 PM', '06:00 PM - 06:45 PM'],
    bio: 'Specialist in Cognitive Behavioral Therapy with over 12 years of experience managing acute anxiety, work stress, and mood disorders.'
  },
  {
    id: 'doc-2',
    name: 'Dr. Vikram Malhotra, M.D.',
    title: 'Consultant Psychiatrist',
    rating: 4.8,
    reviewsCount: 98,
    experienceYears: 15,
    fee: '₹2,000 / 45 mins',
    specialties: ['Depression Management', 'Sleep Disorders', 'Psychopharmacology'],
    availability: ['11:00 AM - 11:45 AM', '03:00 PM - 03:45 PM'],
    bio: 'Experienced psychiatrist focusing on comprehensive diagnostic assessments, medical treatment planning, and holistic therapy integration.'
  },
  {
    id: 'doc-3',
    name: 'Dr. Meera Sen, M.Sc.',
    title: 'Mindfulness & Trauma Counselor',
    rating: 5.0,
    reviewsCount: 86,
    experienceYears: 9,
    fee: '₹1,200 / 45 mins',
    specialties: ['Trauma & Somatics', 'Mindfulness CBT', 'Relationship Therapy'],
    availability: ['09:00 AM - 09:45 AM', '04:00 PM - 04:45 PM'],
    bio: 'Compassionate somatic practitioner dedicated to trauma-informed mindfulness therapies and emotional resilience building.'
  }
];

export default function TherapistBooking({ accessToken, onBookingSuccess }: TherapistBookingProps) {
  const [doctors, setDoctors] = useState<any[]>(DOCTORS_LIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  
  // Booking Form State
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedSessionType, setSelectedSessionType] = useState('Cognitive Behavioral Therapy (CBT)');
  const [selectedMeetingType, setSelectedMeetingType] = useState('Online Video Call');
  const [bookingStep, setBookingStep] = useState<'details' | 'payment' | 'confirmed'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetchLiveDoctors();
  }, []);

  const fetchLiveDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/doctors/public/`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setDoctors(data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch live doctors:', e);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || doc.specialties.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSpec = selectedSpecialty === 'All' || doc.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpec;
  });

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);

    try {
      if (accessToken && selectedDoctor) {
        const res = await fetch(`${API_URL}/api/auth/admin/assign-patient/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            doctor_id: selectedDoctor.id,
            time_slot: selectedSlot || selectedDoctor.availability[0],
            session_type: selectedSessionType,
            meeting_type: selectedMeetingType,
          }),
        });
      }
    } catch (e) {
      console.error('Booking error:', e);
    }

    setBookingStep('confirmed');
    setIsSubmitting(false);
    if (onBookingSuccess) onBookingSuccess();
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl bg-gradient-to-r from-[#0284c7] via-sky-800 to-indigo-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sky-300 font-semibold text-xs uppercase tracking-wider">
            <Stethoscope className="w-4 h-4" /> Verified Clinical Specialists
          </div>
          <h2 className="text-2xl font-bold font-outfit">Therapist & Doctor Booking</h2>
          <p className="text-xs text-sky-100/80 max-w-xl">
            Book confidential 1-on-1 consultations with licensed psychologists and psychiatrists.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl bg-white border border-sky-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search doctor by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-400"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
          {['All', 'Anxiety & Panic', 'CBT Therapy', 'Depression Management', 'Sleep Disorders'].map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSpecialty === spec ? 'bg-[#0284c7] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredDoctors.map(doc => (
          <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0284c7] font-bold text-lg flex items-center justify-center font-outfit">
                  {doc.name.split(' ')[1]?.[0] || 'D'}
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified License
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 font-outfit">{doc.name}</h3>
                <p className="text-xs text-sky-600 font-medium">{doc.title}</p>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {doc.rating} ({doc.reviewsCount})
                </span>
                <span>•</span>
                <span>{doc.experienceYears} Years Exp.</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {doc.specialties.map((s: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                    {s}
                  </span>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2">{doc.bio}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">{doc.fee}</span>
              <button
                onClick={() => { setSelectedDoctor(doc); setSelectedSlot(doc.availability[0]); setBookingStep('details'); }}
                className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-sky-600 text-white text-xs font-bold"
              >
                Book Session
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button onClick={() => setSelectedDoctor(null)} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>

            {bookingStep === 'details' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-sky-600 uppercase">Consultation Booking</span>
                  <h3 className="text-base font-bold text-slate-900 font-outfit">{selectedDoctor.name}</h3>
                  <p className="text-xs text-slate-500">{selectedDoctor.title}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Select Available Time Slot</label>
                  <div className="space-y-1.5">
                    {selectedDoctor.availability.map((slot: string) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                          selectedSlot === slot ? 'bg-sky-50 border-sky-400 text-[#0284c7]' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {slot}</span>
                        {selectedSlot === slot && <CheckCircle2 className="w-4 h-4 text-[#0284c7]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Consultation Type</label>
                  <select
                    value={selectedSessionType}
                    onChange={(e) => setSelectedSessionType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-xs bg-white"
                  >
                    <option>Cognitive Behavioral Therapy (CBT)</option>
                    <option>Mindfulness & Stress Management</option>
                    <option>Psychiatric Evaluation</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border flex items-center justify-between text-xs">
                  <span className="text-slate-600">Consultation Fee</span>
                  <span className="font-bold text-slate-900">{selectedDoctor.fee}</span>
                </div>

                <button
                  onClick={() => setBookingStep('payment')}
                  className="w-full py-3 rounded-2xl bg-[#0284c7] hover:bg-sky-600 text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  Proceed to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {bookingStep === 'payment' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-outfit">Simulated Checkout</h3>
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{selectedDoctor.name}</span>
                    <span>{selectedDoctor.fee}</span>
                  </div>
                  <div className="text-slate-500">{selectedSlot} • {selectedSessionType}</div>
                </div>

                <div className="p-4 rounded-2xl border bg-slate-50 space-y-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-[#0284c7]" /> Payment Gateway Demo</span>
                  <p className="text-[11px] text-slate-500">Click below to authorize simulated consultation booking fee.</p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setBookingStep('details')} className="w-1/3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600">Back</button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting}
                    className="w-2/3 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Confirming...' : 'Pay & Confirm Session'}
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 'confirmed' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 font-outfit">Session Confirmed!</h3>
                  <p className="text-xs text-slate-500">Your appointment with {selectedDoctor.name} is scheduled for {selectedSlot}.</p>
                </div>
                <button onClick={() => setSelectedDoctor(null)} className="px-6 py-2.5 rounded-xl bg-[#0284c7] text-white text-xs font-bold">
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
