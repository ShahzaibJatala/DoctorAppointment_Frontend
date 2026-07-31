'use client';

import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  User, 
  MapPin, 
  FileText, 
  UploadCloud, 
  DollarSign, 
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Info,
  Loader2,
  Heart,
  ArrowLeft,
  CreditCard,
  Building2
} from 'lucide-react';

import axios from 'axios';
import { getToken } from '@/app/actions/token';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- Reusable Form Components ---

const Label = ({ children, required }: { children: React.ReactNode, required?: boolean }) => (
  <label className="block text-sm font-bold text-slate-700 mb-2">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const Input = ({ type = "text", placeholder, icon: Icon, name, value, onChange, required }: any) => (
  <div className="relative">
    {Icon && (
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon size={18} className="text-slate-300" />
      </div>
    )}
    <input 
      type={type} 
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      placeholder={placeholder} 
      className={`w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-[#16BCC8]/15 focus:border-[#16BCC8] block p-3 transition-all duration-200 ${Icon ? 'pl-11' : ''}`}
    />
  </div>
);

const Select = ({ options, name, value, onChange, required }: any) => (
  <select 
    name={name}
    value={value || ''}
    onChange={onChange}
    required={required}
    className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-[#16BCC8]/15 focus:border-[#16BCC8] block p-3 transition-all duration-200 cursor-pointer"
  >
    <option value="" disabled>Select an option...</option>
    {options.map((opt: string, i: number) => <option key={i} value={opt}>{opt}</option>)}
  </select>
);

const SectionCard = ({ title, icon: Icon, description, children }: { title: string, icon: any, description: string, children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden mb-6 hover:shadow-elevated transition-shadow duration-300">
    <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-slate-100 text-[#16BCC8] shadow-sm shrink-0">
        <Icon size={22} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// --- Main Page Component ---

export default function DoctorProfileForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    language: '', 
    specialization: '',
    experienceYears: 0, 
    LicenseNumber: '',  
    medicalBoard: '',    
    Bio: '',             
    clinicName: '',      
    clinicAddress: '',   
    city: '',            
    province: '',        
    consultationFee: '',
    // Bank details
    bankName: '',
    accountHolderName: '',
    accountNumber: ''
  });

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  if (!serverUrl) {
    console.log('NEXT_PUBLIC_SERVER_URL is missing');
  }

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [documents, setDocuments] = useState<FileList | null>(null);
  
  const router = useRouter();

  // FETCH EXISTING PROFILE DATA
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        console.log("fetching profile data");
        const Token = await getToken();
        const response = await axios.get(`${serverUrl}/doctor/getProfile`, {
          headers: { Authorization: `Bearer ${Token}` },
          withCredentials: true
        });

        const data = response.data;
        console.log("profile data", data);
        setFormData({
          fullName: data.fullName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          language: Array.isArray(data.language) ? data.language.join(', ') : (data.language || ''),
          specialization: data.specialization || '',
          experienceYears: data.experienceYears || '',
          LicenseNumber: data.LicenseNumber || '',
          medicalBoard: data.medicalBoard || '',
          Bio: data.Bio || '',
          clinicName: data.clinicName || '',
          clinicAddress: data.clinicAddress || '',
          city: data.city || '',
          province: data.province || '',
          consultationFee: data.consultationFee || '',
          bankName: data.bankName || '',
          accountHolderName: data.accountHolderName || '',
          accountNumber: data.accountNumber || ''
        });

        if (data.profilePictureUrl) {
          console.log("profile photo url", data.profilePictureUrl);
          setExistingPhotoUrl(data.profilePictureUrl);
        }

      } catch (error: any) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const finalPayload = new FormData();

      finalPayload.append('fullName', formData.fullName);
      finalPayload.append('email', formData.email);
      finalPayload.append('phoneNumber', formData.phoneNumber);
      finalPayload.append('specialization', formData.specialization);

      if (formData.language) {
          const languagesArray = formData.language.split(',').map(l => l.trim()).filter(Boolean);
          languagesArray.forEach(lang => {
              finalPayload.append('language', lang); 
          });
      }

      if(formData.experienceYears) finalPayload.append('experienceYears', String(formData.experienceYears));
      if(formData.LicenseNumber) finalPayload.append('LicenseNumber', String(formData.LicenseNumber));
      if(formData.medicalBoard) finalPayload.append('medicalBoard', String(formData.medicalBoard));
      if(formData.Bio) finalPayload.append('Bio', formData.Bio);

      if(formData.clinicName) finalPayload.append('clinicName', formData.clinicName);
      if(formData.clinicAddress) finalPayload.append('clinicAddress', formData.clinicAddress);
      if(formData.city) finalPayload.append('city', formData.city);
      if(formData.province) finalPayload.append('province', formData.province);
      if(formData.consultationFee) finalPayload.append('consultationFee', String(formData.consultationFee));

      // Bank details
      if(formData.bankName) finalPayload.append('bankName', formData.bankName);
      if(formData.accountHolderName) finalPayload.append('accountHolderName', formData.accountHolderName);
      if(formData.accountNumber) finalPayload.append('accountNumber', formData.accountNumber);
      
      if (profilePhoto) {
          finalPayload.append('Image', profilePhoto);
      }
      
      const Token = await getToken();
      
      const response = await axios.post(`${serverUrl}/doctor/createProfile/`, finalPayload, {
        headers: {Authorization: `Bearer ${Token}`}, 
        withCredentials: true
      });

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error: any) {
      console.log("error :", error, error.response?.data);
      setErrorMessage(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Loading View ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#16BCC8] animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  // --- Success View ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-elevated border border-slate-100 p-8 text-center animate-fade-up">
          <div className="w-20 h-20 bg-[#20AC6B]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-[#20AC6B]" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Profile Updated!</h2>
          <p className="text-slate-400 mb-8">
            Your professional profile has been successfully saved and updated.
          </p>
          <button 
            onClick={() => router.push('/doctor/dashboard')}
            className="w-full py-3.5 bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] hover:from-[#14b0bc] hover:to-[#0d9a9e] text-white font-bold rounded-xl transition-all duration-300 shadow-[0_2px_12px_rgba(22,188,200,0.3)] hover:shadow-[0_4px_20px_rgba(22,188,200,0.4)]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }


  // --- Main Form View ---
  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#16BCC8] to-[#0ea5a9] shadow-[0_2px_8px_rgba(22,188,200,0.3)] transition-transform duration-300 group-hover:scale-105">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">MediBook</span>
          </Link>
          <span className="text-sm font-semibold text-[#16BCC8] bg-[#16BCC8]/8 px-4 py-1.5 rounded-xl border border-[#16BCC8]/10">
            Doctor Profile
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="mb-8 flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Your Professional Profile</h1>
            <p className="text-slate-400">Update your details. This information aligns directly with your platform profile.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200/50 rounded-xl text-sm font-medium flex items-center gap-3 animate-slide-down">
            <Info size={18} className="shrink-0" />
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* 1. Basic Information */}
          <SectionCard title="Personal Information" icon={User} description="Your basic contact and identification details.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label required>Full Name</Label>
                <Input name="fullName" value={formData.fullName} onChange={handleInputChange} required placeholder="e.g. Dr. Sarah Jenkins" />
              </div>
              <div>
                <Label required>Email Address</Label>
                <Input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="doctor@example.com" />
              </div>
              <div>
                <Label required>Phone Number</Label>
                <Input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required placeholder="+1 (555) 000-0000" />
              </div>
              <div className="md:col-span-2">
                <Label>Languages Spoken <span className="text-xs text-slate-300 font-normal">(Optional)</span></Label>
                <Input name="language" value={formData.language} onChange={handleInputChange} placeholder="e.g. English, Spanish, Mandarin (Comma separated)" />
              </div>
            </div>
          </SectionCard>

          {/* 2. Professional Details */}
          <SectionCard title="Professional Details" icon={Stethoscope} description="Your medical specialty, experience, and educational background.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label required>Primary Specialization</Label>
                <Select name="specialization" value={formData.specialization} onChange={handleInputChange} required options={['Cardiology', 'Dermatology', 'General Practice', 'Neurology', 'Pediatrics', 'Orthopedics', 'Psychiatry']} />
              </div>
              <div>
                <Label required>Years of Experience</Label>
                <Input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} required placeholder="e.g. 10" />
              </div>
              <div>
                <Label>Medical License Number <span className="text-xs text-slate-300 font-normal">(Optional)</span></Label>
                <Input type="number" name="LicenseNumber" value={formData.LicenseNumber} onChange={handleInputChange} placeholder="e.g. 12345678" />
                <p className="text-xs text-slate-300 mt-1.5">Numbers only based on current requirements.</p>
              </div>
              <div>
                <Label>Issuing Medical Board <span className="text-xs text-slate-300 font-normal">(Optional)</span></Label>
                <Input name="medicalBoard" value={formData.medicalBoard} onChange={handleInputChange} placeholder="e.g. California Medical Board" />
              </div>
              <div className="md:col-span-2">
                <Label>Professional Biography <span className="text-xs text-slate-300 font-normal">(Optional)</span></Label>
                <textarea 
                  name="Bio"
                  value={formData.Bio}
                  onChange={handleInputChange}
                  rows={4} 
                  placeholder="Write a brief professional bio..."
                  className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-[#16BCC8]/15 focus:border-[#16BCC8] block p-3 transition-all duration-200 resize-y"
                ></textarea>
              </div>
            </div>
          </SectionCard>

          {/* 3. Clinic & Consultation Info */}
          <SectionCard title="Clinic & Pricing" icon={MapPin} description="Where you practice and your consultation fees.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label>Clinic / Hospital Name <span className="text-xs text-slate-300 font-normal">(Optional)</span></Label>
                <Input name="clinicName" value={formData.clinicName} onChange={handleInputChange} placeholder="e.g. Heart & Vascular Institute" />
              </div>
              <div className="md:col-span-2">
                <Label>Clinic Address <span className="text-xs text-slate-300 font-normal">(Optional)</span></Label>
                <Input name="clinicAddress" value={formData.clinicAddress} onChange={handleInputChange} placeholder="Street address, Suite, Floor..." />
              </div>
              <div>
                <Label>City <span className="text-xs text-slate-300 font-normal">(Optional)</span></Label>
                <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. San Francisco" />
              </div>
              <div>
                <Label>Province / State <span className="text-xs text-slate-300 font-normal">(Optional)</span></Label>
                <Input name="province" value={formData.province} onChange={handleInputChange} placeholder="e.g. CA" />
              </div>
              
              <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Consultation Fee ($) <span className="text-xs text-slate-300 font-normal">(Optional)</span></Label>
                    <Input type="number" icon={DollarSign} name="consultationFee" value={formData.consultationFee} onChange={handleInputChange} placeholder="120" />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 4. Bank Account Details */}
          <SectionCard title="Bank Account Details" icon={CreditCard} description="Your bank account information for receiving patient consultation payments.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-700 font-medium flex items-center gap-2">
                  <Building2 size={16} />
                  These details will be shown to patients for bank transfer payments. Keep them accurate.
                </p>
              </div>
              <div>
                <Label>Bank Name <span className="text-xs text-slate-300 font-normal">(Optional)</span></Label>
                <Input name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="e.g. HBL, Meezan, UBL" />
              </div>
              <div>
                <Label>Account Holder Name <span className="text-xs text-slate-300 font-normal">(Optional)</span></Label>
                <Input name="accountHolderName" value={formData.accountHolderName} onChange={handleInputChange} placeholder="e.g. Dr. Ahmed Ali" />
              </div>
              <div className="md:col-span-2">
                <Label>Account Number / IBAN <span className="text-xs text-slate-300 font-normal">(Optional)</span></Label>
                <Input name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} placeholder="e.g. PK36SCBL0000001123456702" />
                <p className="text-xs text-slate-400 mt-1.5">Enter your full IBAN or account number used for receiving payments.</p>
              </div>
            </div>
          </SectionCard>

          {/* 5. Document Uploads */}
          <SectionCard title="Profile & Documents" icon={FileText} description="Upload your profile photo and medical credentials for verification.">
            <div className="space-y-6">
              
              <div>
                <Label>Profile Photo</Label>
                <div className="mt-2 flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 overflow-hidden shrink-0">
                    {profilePhoto ? (
                      <img src={URL.createObjectURL(profilePhoto)} alt="Preview" className="w-full h-full object-cover" />
                    ) : existingPhotoUrl ? (
                      <img src={existingPhotoUrl} alt="Existing Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-[#16BCC8]/[0.03] hover:border-[#16BCC8]/20 transition-all duration-200">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud size={24} className="text-[#16BCC8] mb-2" />
                        <p className="text-sm text-slate-500 font-medium">Click to upload new photo</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => setProfilePhoto(e.target.files ? e.target.files[0] : null)} 
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Label>Medical License & Certifications</Label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-[#16BCC8]/[0.03] hover:border-[#16BCC8]/20 transition-all duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ShieldCheck size={32} className="text-[#16BCC8] mb-2" />
                    <p className="text-sm text-slate-600"><span className="font-bold text-[#16BCC8]">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {documents && documents.length > 0 ? `${documents.length} file(s) selected` : 'PDF up to 10MB'}
                    </p>
                  </div>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    multiple 
                    className="hidden" 
                    onChange={(e) => setDocuments(e.target.files)} 
                  />
                </label>
              </div>

            </div>
          </SectionCard>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
            <button type="button" onClick={() => router.back()} className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2">
              Go Back
            </button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-gradient-to-r from-[#16BCC8] to-[#0ea5a9] hover:from-[#14b0bc] hover:to-[#0d9a9e] disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-[0_2px_12px_rgba(22,188,200,0.3)] hover:shadow-[0_4px_20px_rgba(22,188,200,0.4)] transition-all duration-300 flex items-center gap-2">
              {isSubmitting ? (
                <><Loader2 size={18} className="animate-spin" /> Updating...</>
              ) : (
                <>Update Profile <ChevronRight size={18} /></>
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}