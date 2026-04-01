import { cn } from '@/lib/utils';

export function Button({
  children, className, variant = 'default', size = 'default', ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
        {
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 rounded-lg': variant === 'default',
          'border border-border bg-transparent hover:bg-accent rounded-lg': variant === 'outline',
          'hover:bg-accent rounded-lg': variant === 'ghost',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg': variant === 'destructive',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg': variant === 'secondary',
        },
        {
          'h-10 px-5 text-sm': size === 'default',
          'h-8 px-3 text-xs': size === 'sm',
          'h-12 px-8 text-base': size === 'lg',
          'h-10 w-10': size === 'icon',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
