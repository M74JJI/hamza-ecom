// app/(store)/profile/_components/SessionList.tsx
'use client';
import { useTransition } from 'react';
import { revokeSession, revokeAllExceptCurrent } from '../_actions/session.actions';
import { Monitor, Smartphone, Tablet, Globe, LogOut, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function mask(t: string){
  return t ? t.slice(0,6) + '…' + t.slice(-4) : '';
}

function getDeviceIcon(userAgent: string) {
  if (userAgent.includes('Mobile')) return Smartphone;
  if (userAgent.includes('Tablet')) return Tablet;
  if (userAgent.includes('Mac') || userAgent.includes('Windows')) return Monitor;
  return Globe;
}

function getDeviceType(userAgent: string) {
  if (userAgent.includes('Mobile')) return 'Mobile Device';
  if (userAgent.includes('Tablet')) return 'Tablet';
  if (userAgent.includes('Mac')) return 'Mac Computer';
  if (userAgent.includes('Windows')) return 'Windows Computer';
  return 'Web Browser';
}

function getTimeAgo(date: string) {
  const now = new Date();
  const sessionDate = new Date(date);
  const diffInHours = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours === 0) return 'Just now';
  if (diffInHours === 1) return '1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return 'Yesterday';
  return `${Math.floor(diffInHours / 24)} days ago`;
}

export function SessionList({ sessions, currentId }:{ sessions:any[], currentId:string }){
  const [pending, start] = useTransition();

  if(sessions.length === 0){
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Monitor className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Sessions</h3>
        <p className="text-gray-600">You're not logged in on any devices</p>
      </motion.div>
    );
  }

  return (
    <motion.div layout className="space-y-4">
      {/* Bulk Action */}
      {sessions.filter(s => s.id !== currentId).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => start(async () => { await revokeAllExceptCurrent(); })}
            disabled={pending}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:bg-gray-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {pending ? 'Signing Out...' : `Sign Out of ${sessions.filter(s => s.id !== currentId).length} Other Devices`}
          </motion.button>
        </motion.div>
      )}

      {/* Sessions List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sessions.map((session, index) => {
            const DeviceIcon = getDeviceIcon(session.userAgent || '');
            const deviceType = getDeviceType(session.userAgent || '');
            const isCurrent = session.id === currentId;
            
            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                layout
                whileHover={{ y: -2 }}
                className={`bg-white/80 backdrop-blur-2xl rounded-2xl border-2 p-6 transition-all ${
                  isCurrent 
                    ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Device Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isCurrent ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      <DeviceIcon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Session Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-800 text-lg">
                          {isCurrent ? 'This Device' : deviceType}
                        </h3>
                        {isCurrent && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Current
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <div className="text-gray-600">Session ID</div>
                        <div className="font-mono text-gray-800">{mask(session.token)}</div>
                        
                        <div className="text-gray-600">Last Active</div>
                        <div className="text-gray-800">{getTimeAgo(session.createdAt)}</div>
                        
                        <div className="text-gray-600">Created</div>
                        <div className="text-gray-800">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                        
                        <div className="text-gray-600">Expires</div>
                        <div className="text-gray-800">
                          {new Date(session.expires).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  {!isCurrent && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => start(async () => { await revokeSession(session.id); })}
                      disabled={pending}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      {pending ? 'Revoking...' : 'Revoke'}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}