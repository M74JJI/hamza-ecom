'use client';

import * as React from 'react';
import * as RadixSlider from '@radix-ui/react-slider';

type RangeSliderProps = {
  min?: number;
  max?: number;
  step?: number;
  value: [number, number];
  onChange?: (value: [number, number]) => void;   // live updates
  onCommit?: (value: [number, number]) => void;   // after drag end
  className?: string;
};

export function RangeSlider({
  min = 0,
  max = 10000,
  step = 100,
  value,
  onChange,
  onCommit,
  className = '',
}: RangeSliderProps) {
  const [local, setLocal] = React.useState<[number, number]>(value);

  React.useEffect(() => {
    if (value[0] !== local[0] || value[1] !== local[1]) setLocal(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value[0], value[1]]);

  return (
    <div className={`w-full py-4 ${className}`}>
      <RadixSlider.Root
        value={local}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => {
          const val = [v[0], v[1]] as [number, number];
          setLocal(val);
          onChange?.(val);
        }}
        onValueCommit={(v) => {
          const val = [v[0], v[1]] as [number, number];
          onCommit?.(val);
        }}
        aria-label="Price range"
        className="relative flex w-full select-none items-center touch-none px-2" // add padding for thumb edges
      >
        {/* Track */}
        <RadixSlider.Track
          className="
            relative w-full h-2 rounded-full bg-gray-200
            before:absolute before:inset-0 before:rounded-full before:bg-gray-200
          "
        >
          <RadixSlider.Range
            className="
              absolute h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500
            "
          />
        </RadixSlider.Track>

        {/* Thumbs */}
        <RadixSlider.Thumb
          className="
            absolute top-1/2 -translate-y-1/2 
            block h-5 w-5 rounded-full border-2 border-blue-400 bg-white shadow-md
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            data-[state=active]:scale-110 data-[state=active]:border-blue-500
            transition-transform
          "
          aria-label="Minimum price"
        />
        <RadixSlider.Thumb
          className="
            absolute top-1/2 -translate-y-1/2 
            block h-5 w-5 rounded-full border-2 border-blue-400 bg-white shadow-md
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            data-[state=active]:scale-110 data-[state=active]:border-blue-500
            transition-transform
          "
          aria-label="Maximum price"
        />
      </RadixSlider.Root>

      {/* Value labels */}
      <div className="mt-4 flex items-center justify-between text-sm font-medium text-gray-700 select-none">
        <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1">
          MAD {Math.round(local[0]).toLocaleString()}
        </span>
        <span className="text-gray-400">→</span>
        <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1">
          MAD {Math.round(local[1]).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
