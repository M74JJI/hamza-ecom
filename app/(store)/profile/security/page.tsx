// app/(store)/profile/security/page.tsx
import ProfileNav from '../_components/ProfileNav';
import { SectionCard } from '../_components/SectionCard';
import { ProfileInfoForm, PasswordForm, VerifyEmailBanner } from '../_components/SecurityForms';
import { AnimatedBackground } from '../_components/AnimatedBackground';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { Shield, User, Lock, Key, Award } from 'lucide-react';

export default async function SecurityPage(){
  const { user } = await requireUser();
  const u = await prisma.user.findUnique({ where: { id: user.id } });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800">Account Security</h1>
            <p className="text-gray-600 font-medium">Manage your profile and security settings</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          <ProfileNav />
          
          <div className="space-y-6 lg:space-y-8">
            {/* Security Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-4 border-2 border-gray-300 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-800">
                      {u?.emailVerified ? 'Secure' : 'Pending'}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Email Status</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-4 border-2 border-gray-300 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-800">Active</div>
                    <div className="text-sm text-gray-600 font-medium">Account Status</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-4 border-2 border-gray-300 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-800">Member</div>
                    <div className="text-sm text-gray-600 font-medium">Tier Level</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Verification Banner */}
            <VerifyEmailBanner verified={!!u?.emailVerified}/>

            {/* Profile Information */}
            <SectionCard 
              title="Profile Information" 
              subtitle="Update your personal details and avatar"
              right={
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              }
            >
              <ProfileInfoForm user={u}/>
            </SectionCard>

            {/* Password Security */}
            <SectionCard 
              title="Password & Security" 
              subtitle="Change your password to keep your account secure"
              right={
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
              }
            >
              <PasswordForm/>
            </SectionCard>

            {/* Security Tips */}
            <SectionCard 
              title="Security Tips" 
              subtitle="Best practices to keep your account safe"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Key className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Strong Passwords</h3>
                      <p className="text-gray-600 text-sm">Use unique, complex passwords</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Create passwords with a mix of letters, numbers, and symbols. Avoid using the same password across multiple sites.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Regular Updates</h3>
                      <p className="text-gray-600 text-sm">Keep your information current</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Regularly update your password and ensure your email address is verified for important security notifications.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}