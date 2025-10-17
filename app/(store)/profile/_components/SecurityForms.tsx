// app/(store)/profile/_components/SecurityForms.tsx
'use client';
import { useState, useTransition } from 'react';
import { updateProfile, changePassword, resendVerificationEmail } from '../_actions/user.actions';
import { CheckCircle2, Loader2, MailCheck, ImagePlus, User, Lock, Key, Shield } from 'lucide-react';
import { CldUploadWidget } from 'next-cloudinary';
import { motion } from 'framer-motion';

export function ProfileInfoForm({ user }:{ user:any }){
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ name: user?.name ?? '', image: user?.image ?? '' });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    start(async () => { 
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Display Name */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <User className="w-4 h-4" />
          Display Name
        </label>
        <input 
          value={form.name} 
          onChange={e => setForm({...form, name: e.currentTarget.value})}
          placeholder="Enter your display name"
          className="w-full px-4 py-3 text-black bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
        />
      </div>

      {/* Profile Picture */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <ImagePlus className="w-4 h-4" />
          Profile Picture
        </label>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={form.image || '/avatar-placeholder.png'} 
                alt="avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            {form.image && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setForm({...form, image: ''})}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
              >
                ×
              </motion.button>
            )}
          </div>
          
          <div className="flex gap-3">
            <CldUploadWidget
              uploadPreset="ufb48euh"
              onSuccess={(res:any) => {
                const url = res?.info?.secure_url;
                if(url) setForm((f) => ({ ...f, image: url }));
              }}
            >
              {({ open }) => (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => open()}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                >
                  <ImagePlus className="w-4 h-4"/>
                  Upload Photo
                </motion.button>
              )}
            </CldUploadWidget>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        onClick={handleSave}
        disabled={pending}
        whileHover={{ scale: pending ? 1 : 1.02 }}
        whileTap={{ scale: pending ? 1 : 0.98 }}
        className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all ${
          pending
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : saved
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {pending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : saved ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <CheckCircle2 className="w-5 h-5" />
        )}
        {pending ? 'Saving...' : saved ? 'Profile Updated!' : 'Save Changes'}
      </motion.button>
    </motion.div>
  );
}

export function PasswordForm(){
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ current: '', next: '' });
  const [updated, setUpdated] = useState(false);

  const handleUpdate = async () => {
    start(async () => { 
      await changePassword(form); 
      setForm({ current: '', next: '' });
      setUpdated(true);
      setTimeout(() => setUpdated(false), 3000);
    });
  };

  const isFormValid = form.current.length > 0 && form.next.length >= 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        {/* Current Password */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Current Password
          </label>
          <input 
            type="password"
            value={form.current}
            onChange={e => setForm({...form, current: e.currentTarget.value})}
            placeholder="Enter your current password"
            className="w-full px-4 py-3 text-black bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            New Password
          </label>
          <input 
            type="password"
            value={form.next}
            onChange={e => setForm({...form, next: e.currentTarget.value})}
            placeholder="Enter your new password"
            className="w-full px-4 py-3 text-black bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
          <p className="text-xs text-gray-500">
            Use 6+ characters with a mix of letters, numbers & symbols
          </p>
        </div>
      </div>

      {/* Update Button */}
      <motion.button
        onClick={handleUpdate}
        disabled={pending || !isFormValid}
        whileHover={{ scale: (pending || !isFormValid) ? 1 : 1.02 }}
        whileTap={{ scale: (pending || !isFormValid) ? 1 : 0.98 }}
        className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
          pending || !isFormValid
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : updated
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {pending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : updated ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Shield className="w-5 h-5" />
        )}
        {pending ? 'Updating...' : updated ? 'Password Updated!' : 'Update Password'}
      </motion.button>
    </motion.div>
  );
}

export function VerifyEmailBanner({ verified }:{ verified:boolean }){
  if(verified) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-yellow-50 to-amber-100 rounded-2xl p-6 border-2 border-yellow-400 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
            <MailCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Verify Your Email</h3>
            <p className="text-gray-600">Please verify your email address to access all features</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => resendVerificationEmail()}
          className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
        >
          Resend Verification
        </motion.button>
      </div>
    </motion.div>
  );
}