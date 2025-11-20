import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export function LoadingSpinner({ size = 'default', className = '' }) {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

export function LoadingCard({ message = 'Loading...', submessage = null }) {
  return (
    <Card className="border-slate-200">
      <CardContent className="py-12 text-center">
        <LoadingSpinner size="large" className="text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600">{message}</p>
        {submessage && (
          <p className="text-sm text-slate-500 mt-2">{submessage}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function LoadingPage({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
      <div className="text-center">
        <LoadingSpinner size="large" className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
        <p style={{ color: 'var(--color-text)' }}>{message}</p>
      </div>
    </div>
  );
}