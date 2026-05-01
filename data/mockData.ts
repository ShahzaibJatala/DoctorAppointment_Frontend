export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  reviewCount: number;
  experience: number;
  location: string;
  availability: string[];
  bio: string;
  education: string;
  languages: string[];
  consultationFee: number;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: 'in-person' | 'video';
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  image: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    specialty: "Cardiologist",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    rating: 4.9,
    reviewCount: 127,
    experience: 12,
    location: "Medical Center, Building A",
    availability: ["Mon", "Tue", "Wed", "Fri"],
    bio: "Dr. Sarah Chen is a board-certified cardiologist with over 12 years of experience in treating heart conditions. She specializes in preventive cardiology and heart failure management.",
    education: "Harvard Medical School",
    languages: ["English", "Mandarin"],
    consultationFee: 150,
  },
  {
    id: "2",
    name: "Dr. Michael Roberts",
    specialty: "Dermatologist",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    rating: 4.8,
    reviewCount: 98,
    experience: 8,
    location: "Skin Care Clinic",
    availability: ["Mon", "Wed", "Thu", "Sat"],
    bio: "Dr. Michael Roberts specializes in medical and cosmetic dermatology. He has extensive experience in treating skin conditions and performing aesthetic procedures.",
    education: "Stanford University",
    languages: ["English", "Spanish"],
    consultationFee: 120,
  },
  {
    id: "3",
    name: "Dr. Emily Watson",
    specialty: "Pediatrician",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
    rating: 4.9,
    reviewCount: 215,
    experience: 15,
    location: "Children's Health Center",
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    bio: "Dr. Emily Watson is a compassionate pediatrician dedicated to providing comprehensive care for children from infancy through adolescence.",
    education: "Johns Hopkins University",
    languages: ["English", "French"],
    consultationFee: 100,
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    specialty: "Orthopedic Surgeon",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
    rating: 4.7,
    reviewCount: 89,
    experience: 20,
    location: "Orthopedic Institute",
    availability: ["Tue", "Thu", "Fri"],
    bio: "Dr. James Wilson is an experienced orthopedic surgeon specializing in sports medicine and joint replacement surgery.",
    education: "Mayo Clinic School of Medicine",
    languages: ["English"],
    consultationFee: 200,
  },
  {
    id: "5",
    name: "Dr. Lisa Park",
    specialty: "Neurologist",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face",
    rating: 4.8,
    reviewCount: 156,
    experience: 10,
    location: "Neurology Center",
    availability: ["Mon", "Wed", "Fri"],
    bio: "Dr. Lisa Park is a neurologist with expertise in treating headaches, epilepsy, and neurodegenerative disorders.",
    education: "UCLA Medical School",
    languages: ["English", "Korean"],
    consultationFee: 175,
  },
  {
    id: "6",
    name: "Dr. David Thompson",
    specialty: "General Practitioner",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
    rating: 4.6,
    reviewCount: 342,
    experience: 18,
    location: "Family Health Clinic",
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    bio: "Dr. David Thompson provides comprehensive primary care for patients of all ages, focusing on preventive medicine and chronic disease management.",
    education: "Columbia University",
    languages: ["English", "German"],
    consultationFee: 80,
  },
];

export const appointments: Appointment[] = [
  {
    id: "apt-1",
    doctorId: "1",
    doctorName: "Dr. Sarah Chen",
    doctorSpecialty: "Cardiologist",
    doctorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    patientId: "p-1",
    patientName: "John Smith",
    date: "2026-01-15",
    time: "09:00",
    duration: 30,
    status: "confirmed",
    type: "in-person",
    notes: "Regular checkup",
  },
  {
    id: "apt-2",
    doctorId: "3",
    doctorName: "Dr. Emily Watson",
    doctorSpecialty: "Pediatrician",
    doctorImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
    patientId: "p-1",
    patientName: "John Smith",
    date: "2026-01-18",
    time: "14:30",
    duration: 30,
    status: "pending",
    type: "video",
  },
  {
    id: "apt-3",
    doctorId: "2",
    doctorName: "Dr. Michael Roberts",
    doctorSpecialty: "Dermatologist",
    doctorImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    patientId: "p-1",
    patientName: "John Smith",
    date: "2026-01-05",
    time: "11:00",
    duration: 30,
    status: "completed",
    type: "in-person",
    notes: "Skin condition follow-up",
  },
  {
    id: "apt-4",
    doctorId: "5",
    doctorName: "Dr. Lisa Park",
    doctorSpecialty: "Neurologist",
    doctorImage: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face",
    patientId: "p-1",
    patientName: "John Smith",
    date: "2025-12-28",
    time: "10:00",
    duration: 45,
    status: "cancelled",
    type: "in-person",
  },
];

export const timeSlots: TimeSlot[] = [
  { time: "09:00", available: true },
  { time: "09:30", available: true },
  { time: "10:00", available: false },
  { time: "10:30", available: true },
  { time: "11:00", available: true },
  { time: "11:30", available: false },
  { time: "14:00", available: true },
  { time: "14:30", available: true },
  { time: "15:00", available: true },
  { time: "15:30", available: false },
  { time: "16:00", available: true },
  { time: "16:30", available: true },
];

export const specialties = [
  "All Specialties",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Orthopedic Surgeon",
  "Neurologist",
  "General Practitioner",
  "Psychiatrist",
  "Ophthalmologist",
  "Gynecologist",
];

export const currentPatient: Patient = {
  id: "p-1",
  name: "John Smith",
  email: "john.smith@email.com",
  phone: "+1 (555) 123-4567",
  dateOfBirth: "1985-06-15",
  gender: "Male",
  address: "123 Main Street, New York, NY 10001",
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
};
