import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

declare global {
  interface Window {
    Dropbox?: {
      choose: (options: {
        success: (files: unknown[]) => void;
        linkType: string;
        multiselect: boolean;
        extensions: string[];
      }) => void;
    };
    gapi?: {
      load: (api: string, callback: () => void) => void;
    };
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: unknown) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
      picker: {
        Action: { PICKED: string };
        DocsView: new () => {
          setIncludeFolders: (include: boolean) => unknown;
          setSelectFolderEnabled: (enabled: boolean) => unknown;
          setMimeTypes: (types: string) => unknown;
        };
        PickerBuilder: new () => {
          setAppId: (id: string) => unknown;
          setOAuthToken: (token: string) => unknown;
          setDeveloperKey: (key: string) => unknown;
          addView: (view: unknown) => unknown;
          setCallback: (callback: (data: unknown) => void) => unknown;
          build: () => { setVisible: (visible: boolean) => void };
        };
      };
    };
  }
}

export interface Job {
  title: string;
  location: string;
  description: string[];
  responsibilities: string[];
  requirements: string[];
  detailsHtml?: string; // for extra HTML if needed
  culture?: string[];           // New
  whyJoinUs?: string[];         // New
  extraRequirements?: string[]; // New
  lookingFor?: string[];
}

interface JobPopupProps {
  open: boolean;
  onClose: () => void;
  job: Job | null;
}

const CustomDropdown = ({ options, value, onChange, placeholder }: { options: { label: string, value: string }[], value: string, onChange: (v: string) => void, placeholder?: string }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        className="w-full text-left bg-white border border-gray-300 rounded px-3 py-2 text-black font-arsenal focus:outline-none focus:ring-1 focus:ring-[#BF608F] flex justify-between items-center"
        onClick={() => setOpen(o => !o)}
      >
        <span className={selected && selected.value ? '' : 'text-gray-500'}>{selected && selected.value ? selected.label : placeholder || 'Select...'}</span>
        <svg className="w-4 h-4 ml-2 text-[#BF608F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow-lg">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`px-4 py-2 cursor-pointer font-arsenal text-black hover:bg-pink-50 ${value === opt.value ? 'bg-pink-100' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DROPBOX_APP_KEY = 'nbgft722jci6jy2'; // <-- Replace with your Dropbox App Key
const GOOGLE_CLIENT_ID = '647527313249-d18gkeqi55ncdei8hccoteo9s0v6egpo.apps.googleusercontent.com'; // <-- Replace with your Google OAuth Client ID
const GOOGLE_API_KEY = 'AIzaSyDFns9XmNKIXcYZVgqsJ5vlMZ2ifRSl_r4'; // <-- Replace with your Google API Key

const JobPopup: React.FC<JobPopupProps> = ({ open, onClose, job }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    preferredFirstName: '',
    email: '',
    phone: '',
    resume: '',
    resumeType: '',
    resumeFileName: '',
    resumeFileData: '',
    school: '',
    degree: '',
    linkedin: '',
    portfolio: '',
    experience: '',
    improvement: '',
    visa: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [resumeModal, setResumeModal] = useState<'dropbox' | 'gdrive' | 'manual' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGoogleAPILoaded, setIsGoogleAPILoaded] = useState(false);

  // Load Dropbox Chooser script
  useEffect(() => {
    if (!window.Dropbox) {
      const script = document.createElement('script');
      script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
      script.id = 'dropboxjs';
      script.type = 'text/javascript';
      script.setAttribute('data-app-key', DROPBOX_APP_KEY);
      document.body.appendChild(script);
    }
  }, []);

  // Load Google APIs script
  useEffect(() => {
    const loadGoogleAPIs = () => {
      // Load Google Identity Services
      const gsiScript = document.createElement('script');
      gsiScript.src = 'https://accounts.google.com/gsi/client';
      gsiScript.async = true;
      gsiScript.defer = true;
      gsiScript.onload = () => {
        // Load Google Picker API
        const pickerScript = document.createElement('script');
        pickerScript.src = 'https://apis.google.com/js/api.js';
        pickerScript.async = true;
        pickerScript.onload = () => {
          window.gapi?.load('picker', () => {
            setIsGoogleAPILoaded(true);
          });
        };
        document.body.appendChild(pickerScript);
      };
      document.body.appendChild(gsiScript);
    };

    if (!window.google?.accounts) {
      loadGoogleAPIs();
    } else {
      setIsGoogleAPILoaded(true);
    }
  }, []);

  // Dropbox Chooser handler (currently unused)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDropboxChooser = () => {
    if (window.Dropbox) {
      window.Dropbox.choose({
        success: (files: unknown[]) => {
          if (files && files.length > 0) {
            const file = files[0] as { link: string; name: string };
            setFormData(prev => ({
              ...prev,
              resume: file.link,
              resumeFileName: file.name,
              resumeType: 'dropbox',
              resumeFileData: '',
            }));
          }
        },
        linkType: 'direct',
        multiselect: false,
        extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
      });
    }
  };

  // Google Drive Picker handler
  const handleGoogleDrivePicker = async () => {
    if (!isGoogleAPILoaded) {
      console.error('Google APIs are still loading...');
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const googleAuth = window.google?.accounts as any;
      const tokenClient = googleAuth?.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
        callback: (tokenResponse: unknown) => {
          const response = tokenResponse as { access_token: string };
          if (tokenResponse && response.access_token && window.google) {
            // Create and show the picker
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const googleAPI = window.google as any;
            const view = new googleAPI.picker.DocsView()
              .setIncludeFolders(false)
              .setSelectFolderEnabled(false)
              .setMimeTypes('application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/rtf');

            const picker = new googleAPI.picker.PickerBuilder()
              .setAppId(GOOGLE_CLIENT_ID)
              .setOAuthToken(response.access_token)
              .setDeveloperKey(GOOGLE_API_KEY)
              .addView(view)
              .setCallback((data: unknown) => {
                const pickerData = data as { action: string; docs: { url: string; name: string }[] };
                if (pickerData.action === googleAPI.picker.Action.PICKED && pickerData.docs && pickerData.docs.length > 0) {
                  setFormData(prev => ({
                    ...prev,
                    resume: pickerData.docs[0].url,
                    resumeFileName: pickerData.docs[0].name,
                    resumeType: 'gdrive',
                    resumeFileData: '',
                  }));
                }
              })
              .build();

            picker.setVisible(true);
          }
        },
      });

      // Request access token
      tokenClient?.requestAccessToken();
    } catch {
      console.error('Error initializing Google Drive Picker');
      setSubmitStatus('error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResumeType = (type: string) => {
    if (type === 'attach') {
      setFormData(prev => ({ ...prev, resumeType: type, resume: '', resumeFileName: '', resumeFileData: '' }));
      fileInputRef.current?.click();
    } else if (type === 'manual') {
      setFormData(prev => ({ ...prev, resumeType: type, resume: '', resumeFileName: '', resumeFileData: '' }));
      setResumeModal(null);
    } else {
      setFormData(prev => ({ ...prev, resumeType: type, resume: '', resumeFileName: '', resumeFileData: '' }));
      setResumeModal(type as 'dropbox' | 'gdrive');
    }
  };

  const handleResumeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          resumeFileName: file.name,
          resumeFileData: event.target?.result?.toString().split(',')[1] || '',
          resume: file.name // for display
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeModalSave = (value: string) => {
    setFormData(prev => ({ ...prev, resume: value }));
    setResumeModal(null);
  };

  const handleResumeModalClose = () => {
    setResumeModal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      const payload = { ...formData };
      if (formData.resumeType !== 'attach') {
        payload.resumeFileName = '';
        payload.resumeFileData = '';
      }
      const response = await fetch('/api/send-application-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          preferredFirstName: '',
          email: '',
          phone: '',
          resume: '',
          resumeType: 'attach',
          resumeFileName: '',
          resumeFileData: '',
          school: '',
          degree: '',
          linkedin: '',
          portfolio: '',
          experience: '',
          improvement: '',
          visa: '',
        });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the button rendering in the form
  const renderGoogleDriveButton = () => (
    <button
      type="button"
      className={`border-1 border-[#BF608F] text-[#BF608F] rounded-full py-2 font-arsenal transition-colors duration-200 hover:bg-pink-50 ${formData.resumeType === 'gdrive' ? 'bg-pink-50 border-2' : ''}`}
      onClick={handleGoogleDrivePicker}
      disabled={!isGoogleAPILoaded}
    >
      {!isGoogleAPILoaded ? 'Loading...' : 'Google Drive'}
    </button>
  );

  if (!open || !job) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto min-h-screen flex flex-col">
      {/* Main content area */}
      <div className="w-full px-4 sm:px-4 md:px-0 sm:max-w-4xl mx-auto pb-16">
        {/* Back to jobs */}
        <button onClick={onClose} className="text-[#BF608F] flex flex-col text-sm hover:underline flex items-center mb-6 mt-2">
          <Image src="/joinsangha-logo.svg" alt="Company Logo" width={60} height={32} className="h-auto w-auto mb-0 mr-10 mb-10 mt-10" />
          &#60; Back to jobs
        </button>
        {/* Job title, location, apply button row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="font-arsenal text-3xl font-bold text-[#BF608F] mb-1 text-left">{job.title}</h1>
            <div className="flex items-center text-gray-500 mb-2 text-left">
              <svg className="w-5 h-5 mr-1 text-[#BF608F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span className="font-arsenal text-base">United States of America</span>
            </div>
          </div>
          <button className="mt-4 md:mt-0 px-7 py-2 rounded-full bg-[#BF608F] text-white font-arsenal font-bold text-base shadow hover:bg-[#a34e7a] transition-colors duration-200">Apply</button>
        </div>
        {/* Description paragraphs */}
        <div className="text-gray-700 font-arsenal text-base mb-8 text-left">
          {job.description.map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
        {/* What You'll Do */}
        <div className="mb-8">
          <h2 className="font-bold text-black text-lg font-arsenal mb-2 text-left">What You&apos;ll Do:</h2>
          <ul className="list-disc list-inside ml-8 text-gray-700 font-arsenal text-base space-y-1 text-left">
            {job.responsibilities.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        {/* What We're Looking For */}
        <div className="mb-8">
          <h2 className="font-bold text-black text-lg font-arsenal mb-2 text-left">What We&apos;re Looking For:</h2>
          <ul className="list-disc list-inside ml-8 text-gray-700 font-arsenal text-base space-y-1 text-left">
            {job.lookingFor?.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        {/* Optional extra details */}
        {job.detailsHtml && (
          <div className="mb-8 text-left" dangerouslySetInnerHTML={{ __html: job.detailsHtml }} />
        )}
        {/* Our Culture */}
        {job.culture && (
          <div className="mb-8">
            <h2 className="font-bold text-black text-lg font-arsenal mb-2 text-left">Our Culture:</h2>
            <ul className="list-disc list-inside ml-8 text-gray-700 font-arsenal text-base space-y-1 text-left">
              {job.culture.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Why Join Us */}
        {job.whyJoinUs && (
          <div className="mb-8">
            <h2 className="font-bold text-black text-lg font-arsenal mb-2 text-left">Why Join Us:</h2>
            <ul className="list-disc list-inside ml-8 text-gray-700 font-arsenal text-base space-y-1 text-left">
              {job.whyJoinUs.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Extra Requirements */}
        {job.extraRequirements && (
          <div className="mb-8">
            <h2 className="font-bold text-black text-lg font-arsenal mb-2 text-left">Additional Requirements:</h2>
            <ul className="list-disc list-inside ml-8 text-gray-700 font-arsenal text-base space-y-1 text-left">
              {job.extraRequirements.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        <h2 className="font-bold text-black text-lg font-arsenal mb-2 text-left">Apply now and help us build the future of mental wellness at a global scale!</h2>
        <hr className="my-10" />
        <h3 className="text-[#BF608F] text-2xl font-arsenal font-bold mb-2 text-left">Apply for this job</h3>
        <p className="text-sm font-arsenal text-gray-500 mb-8 text-left"> <span className="text-pink-500">*</span> indicates a required field</p>
        {/* Job Application Form */}
        <form className="bg-white rounded-lg p-0 m-0" onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block font-arsenal text-black text-sm font-bold mb-1 text-left">First Name <span className="text-pink-500">*</span></label>
            <input name="firstName" type="text" className="w-full text-black border border-gray-300 rounded px-3 py-2" value={formData.firstName} onChange={handleInputChange} required />
          </div>
          <div className="mb-6">
            <label className="block font-arsenal text-black text-sm font-bold mb-1 text-left">Last Name <span className="text-pink-500">*</span></label>
            <input name="lastName" type="text" className="w-full text-black border border-gray-300 rounded px-3 py-2" value={formData.lastName} onChange={handleInputChange} required />
          </div>
          <div className="mb-6">
            <label className="block font-arsenal text-black text-sm font-bold mb-1 text-left">Preferred First Name</label>
            <input name="preferredFirstName" type="text" className="w-full text-black border border-gray-300 rounded px-3 py-2" value={formData.preferredFirstName} onChange={handleInputChange} />
          </div>
          <div className="mb-6">
            <label className="block font-arsenal text-black text-sm font-bold mb-1 text-left">Email <span className="text-pink-500">*</span></label>
            <input name="email" type="email" className="w-full text-black border border-gray-300 rounded px-3 py-2" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className="mb-6">
            <label className="block font-arsenal text-black text-sm font-bold mb-1 text-left">Phone <span className="text-pink-500">*</span></label>
            <input name="phone" type="tel" className="w-full text-black border border-gray-300 rounded px-3 py-2" value={formData.phone} onChange={handleInputChange} required />
          </div>
          <div className="mb-6">
            <label className="block font-arsenal text-black text-sm font-bold mb-1 text-left">Resume/CV <span className="text-pink-500">*</span></label>
            <div className="flex w-full sm:w-1/2 md:w-1/3 flex-col gap-3 mb-2">
              <button type="button" className={`border-1 border-[#BF608F] text-[#BF608F] rounded-full py-2 font-arsenal transition-colors duration-200 hover:bg-pink-50 ${formData.resumeType === 'attach' ? 'bg-pink-50 border-2' : ''}`} onClick={() => handleResumeType('attach')}>Attach</button>
              {renderGoogleDriveButton()}
              <button type="button" className={`border-1 border-[#BF608F] text-[#BF608F] rounded-full py-2 font-arsenal transition-colors duration-200 hover:bg-pink-50 ${formData.resumeType === 'manual' ? 'bg-pink-50 border-2' : ''}`} onClick={() => handleResumeType('manual')}>Enter manually</button>
              <input ref={fileInputRef} name="resumeFile" type="file" accept=".pdf,.doc,.docx,.txt,.rtf" className="hidden" onChange={handleResumeFile} />
            </div>
            {/* Inline textarea for manual entry */}
            {formData.resumeType === 'manual' && (
              <textarea
                className="w-full text-gray-700 font-arsenal border border-gray-300 rounded px-3 py-2 mb-2 mt-2"
                rows={6}
                value={formData.resume}
                onChange={e => setFormData(prev => ({ ...prev, resume: e.target.value }))}
                placeholder="Paste or type your resume here"
                required
              />
            )}
            {/* Show selected value/filename */}
            {formData.resume && (
              <div className="text-xs text-gray-700 mt-1">
                {formData.resumeType === 'attach' && `Selected file: ${formData.resume}`}
                {formData.resumeType === 'dropbox' && (
                  <span>Dropbox file: <a href={formData.resume} target="_blank" rel="noopener noreferrer" className="underline text-[#BF608F]">{formData.resumeFileName || formData.resume}</a></span>
                )}
                {formData.resumeType === 'gdrive' && (
                  <span>Google Drive file: <a href={formData.resume} target="_blank" rel="noopener noreferrer" className="underline text-[#BF608F]">{formData.resumeFileName || formData.resume}</a></span>
                )}
                {formData.resumeType === 'manual' && `Manual entry provided.`}
              </div>
            )}
            <p className="text-xs text-gray-500 text-left">Accepted file types: pdf, doc, docx, txt, rtf</p>
          </div>
          {/* Resume Modal */}
          {resumeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h4 className="font-bold mb-4 capitalize">Paste your {resumeModal === 'dropbox' ? 'Dropbox' : 'Google Drive'} link</h4>
                <input className="w-full border border-gray-300 rounded px-3 py-2 mb-4" type="text" defaultValue={formData.resume} autoFocus />
                <div className="flex justify-end gap-2">
                  <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-bold mr-2" onClick={handleResumeModalClose}>Cancel</button>
                  <button type="button" className="px-4 py-2 rounded bg-[#BF608F] text-white font-bold" onClick={() => {
                    const input = document.querySelector('.fixed input') as HTMLInputElement;
                    handleResumeModalSave(input?.value || '');
                  }}>Save</button>
                </div>
              </div>
            </div>
          )}
          <hr className="my-10" />
          <div className="mb-8">
            <h4 className="font-arsenal text-black font-bold text-base mb-2 text-left">Education</h4>
            <div className="mb-4">
              <label className="block font-arsenal text-black text-sm font-bold mb-1 text-left">School <span className="text-pink-500">*</span></label>
              <input name="school" type="text" className="w-full text-black border border-gray-300 rounded px-3 py-2" value={formData.school} onChange={handleInputChange} required />
            </div>
            <div>
              <label className="block font-arsenal text-black text-sm font-bold mb-1 text-left">Degree <span className="text-pink-500">*</span></label>
              <input name="degree" type="text" className="w-full text-black border border-gray-300 rounded px-3 py-2" value={formData.degree} onChange={handleInputChange} required />
            </div>
          </div>
          <hr className="my-10" />
          <div className="mb-6">
            <label className="block font-arsenal text-black text-sm font-bold mb-1 text-left">LinkedIn Profile </label>
            <input name="linkedin" type="url" className="w-full text-black border border-gray-300 rounded px-3 py-2" value={formData.linkedin} onChange={handleInputChange} />
          </div>
          <div className="mb-6">
            <label className="block font-arsenal text-black text-sm font-bold mb-1 text-left">Portfolio Link </label>
            <input name="portfolio" type="url" className="w-full text-black border border-gray-300 rounded px-3 py-2" value={formData.portfolio} onChange={handleInputChange} />
          </div>
          <div className="mb-6">
            <label className="block font-arsenal text-black text-sm font-bold mb-1 text-left">Do you have experience in 0 to 1 product design experience? <span className="text-pink-500">*</span></label>
            <CustomDropdown
              options={[
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' }
              ]}
              value={formData.experience}
              onChange={v => handleDropdownChange('experience', v)}
              placeholder="Select..."
            />
          </div>
          <div className="mb-6">
            <label className="block font-arsenal text-black text-sm font-bold mb-1 text-left">What do you think we could improve in meditation today? <span className="text-pink-500">*</span></label>
            <textarea name="improvement" className="w-full text-black border border-gray-300 rounded px-3 py-2" rows={3} value={formData.improvement} onChange={handleInputChange} required></textarea>
          </div>
          <div className="mb-8">
            <label className="block font-arsenal text-black text-sm font-bold mb-1 text-left">Will you now or in the future require work visa sponsorship in the country of employment? <span className="text-pink-500">*</span></label>
            <CustomDropdown
              options={[
                { label: 'No', value: 'no' },
                { label: 'Yes', value: 'yes' }
              ]}
              value={formData.visa}
              onChange={v => handleDropdownChange('visa', v)}
              placeholder="Select..."
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-7 py-2 rounded-full bg-[#BF608F] text-white font-arsenal font-bold text-base shadow hover:bg-[#a34e7a] transition-colors duration-200" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit application'}
            </button>
          </div>
          {submitStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              Thank you! Your application has been sent successfully.
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              Sorry, there was an error sending your application. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default JobPopup; 