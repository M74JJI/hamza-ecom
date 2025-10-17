// app/(store)/profile/_components/StatCard.tsx
import { LucideIcon } from 'lucide-react';

export function StatCard({ 
  label, 
  value, 
  hint, 
  icon: Icon,
  color = "text-gray-600"
}: { 
  label: string; 
  value: string | number; 
  hint?: string; 
  icon?: LucideIcon;
  color?: string;
}) {
  return (
    <div className="relative bg-white/80 backdrop-blur-2xl rounded-2xl p-5 border-2 border-gray-300 shadow-lg hover:shadow-xl transition-all group overflow-hidden">
      {/* Hover effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-gray-600">{label}</div>
          {Icon && (
            <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        
        <div className="text-2xl lg:text-3xl font-black text-gray-800 mb-1">
          {value}
        </div>
        
        {hint && (
          <div className="text-xs text-gray-500 font-medium">{hint}</div>
        )}
      </div>
    </div>
  );
}