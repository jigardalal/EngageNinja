import React from 'react';
import { cn } from '../../lib/utils';

export const Table = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    className="relative w-full overflow-hidden"
  >
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn('min-w-full text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  </div>
));

export const TableHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b border-white/20 bg-white/50', className)} {...props}>
    {children}
  </thead>
));

export const TableBody = React.forwardRef(({ className, children, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr]:border-b border-white/10 bg-white/10', className)} {...props}>
    {children}
  </tbody>
));

export const TableRow = React.forwardRef(({ className, children, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-white/10 transition hover:bg-white/60 dark:hover:bg-[color:var(--card)]/50',
      className
    )}
    {...props}
  >
    {children}
  </tr>
));

export const TableHead = React.forwardRef(({ className, children, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle text-xs font-semibold uppercase tracking-[0.3em]',
      className
    )}
    {...props}
  >
    {children}
  </th>
));

export const TableCell = React.forwardRef(({ className, children, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle text-sm text-[var(--text)]', className)}
    {...props}
  >
    {children}
  </td>
));

export const TableCaption = React.forwardRef(({ className, children, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('px-4 py-3 text-center text-sm text-[var(--text-muted)]', className)}
    {...props}
  >
    {children}
  </caption>
));

export default Table;
