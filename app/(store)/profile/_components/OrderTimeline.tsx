// app/(store)/profile/_components/OrderTimeline.tsx
'use client';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Package, Truck } from 'lucide-react';

type Step = { label: string; active: boolean; done: boolean };

export function OrderTimeline({ steps }: { steps: Step[] }){
  const getStepIcon = (index: number, step: Step) => {
    if (step.done) return <CheckCircle className="w-4 h-4" />;
    if (step.active) {
      const icons = [<Clock key="clock" className="w-4 h-4" />, <Package key="package" className="w-4 h-4" />, <Truck key="truck" className="w-4 h-4" />, <CheckCircle key="check" className="w-4 h-4" />];
      return icons[index] || <CheckCircle className="w-4 h-4" />;
    }
    return <div className="w-2 h-2 bg-gray-300 rounded-full" />;
  };

  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(steps.filter(s => s.done).length / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-1 bg-green-500 rounded-full"
        />
      </div>

      <ol className="grid grid-cols-4 gap-4">
        {steps.map((step, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                step.done 
                  ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                  : step.active 
                  ? 'bg-blue-500 border-blue-500 text-white shadow-lg' 
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {getStepIcon(index, step)}
            </motion.div>
            
            <div className="mt-3 space-y-1">
              <div className={`text-sm font-semibold ${
                step.done || step.active ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {step.label}
              </div>
              {(step.done || step.active) && (
                <div className={`text-xs ${
                  step.done ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {step.done ? 'Completed' : 'In Progress'}
                </div>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}