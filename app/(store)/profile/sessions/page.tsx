// app/(store)/profile/sessions/page.tsx
import ProfileNav from '../_components/ProfileNav';
import { SectionCard } from '../_components/SectionCard';
import { SessionList } from '../_components/SessionList';
import { AnimatedBackground } from '../_components/AnimatedBackground';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { cookies } from 'next/headers';
import { Shield, Monitor, Smartphone, Globe, Cpu } from 'lucide-react';

export default async function SessionsPage(){
  const { user } = await requireUser();
  const c = await cookies();
  const token = c.get('session')?.value || null;
  const [sessions, current] = await Promise.all([
    prisma.session.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
    token ? prisma.session.findFirst({ where: { userId: user.id, token } }) : Promise.resolve(null)
  ]);

  // Calculate session stats
  const activeSessions = sessions.length;
  const currentSession = current;
  const otherSessions = sessions.filter(s => s.id !== current?.id).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800">Active Sessions</h1>
            <p className="text-gray-600 font-medium">Manage your logged-in devices and browsers</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          <ProfileNav />
          
          <div className="space-y-6 lg:space-y-8">
            {/* Session Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-4 border-2 border-gray-300 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-800">{activeSessions}</div>
                    <div className="text-sm text-gray-600 font-medium">Active Sessions</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-4 border-2 border-gray-300 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-800">
                      {currentSession ? '1' : '0'}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">This Device</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-2xl rounded-2xl p-4 border-2 border-gray-300 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-800">{otherSessions}</div>
                    <div className="text-sm text-gray-600 font-medium">Other Devices</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <SectionCard 
              title="Active Sessions" 
              subtitle={`Manage your logged-in devices (${activeSessions} active)`}
              right={
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              }
            >
              <SessionList sessions={sessions} currentId={current?.id ?? ''}/>
            </SectionCard>

            {/* Security Information */}
            <SectionCard 
              title="Session Security" 
              subtitle="Keep your account secure by managing active sessions"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Session Management</h3>
                      <p className="text-gray-600 text-sm">Control your active logins</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Regularly review your active sessions and sign out of devices you no longer use. 
                    This helps protect your account from unauthorized access.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Device Recognition</h3>
                      <p className="text-gray-600 text-sm">Automatic device tracking</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    We automatically track devices and browsers where you're logged in. 
                    You can revoke access to any suspicious or unused sessions at any time.
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