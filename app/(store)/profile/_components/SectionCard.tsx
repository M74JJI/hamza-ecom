// app/(store)/profile/_components/SectionCard.tsx
import { ReactNode } from 'react';

export function SectionCard({ 
  title, 
  subtitle, 
  children, 
  right 
}: { 
  title: string; 
  subtitle?: string; 
  children: ReactNode; 
  right?: ReactNode;
}) {
  return (
    <div className="relative bg-white/80 backdrop-blur-2xl rounded-2xl lg:rounded-3xl p-6 border-2 border-gray-300 shadow-xl overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-purple-500" />
      
      <div className="flex items-start justify-between mb-6 ml-2">
        <div>
          <h2 className="text-2xl font-black text-gray-800 mb-1">{title}</h2>
          {subtitle && (
            <p className="text-gray-600 font-medium">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
      
      <div className="ml-2">{children}</div>
    </div>
  );
}