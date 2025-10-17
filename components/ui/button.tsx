import { clsx } from 'clsx';
import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default'|'ghost'|'outline' };

export function Button({ className, variant='default', ...props }: Props){
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm transition",
        variant==='default' && "bg-white text-black hover:bg-white/90",
        variant==='ghost' && "bg-transparent hover:bg-white/10",
        variant==='outline' && "border border-white/20 hover:bg-white/5",
        className
      )}
      {...props}
    />
  );
}
