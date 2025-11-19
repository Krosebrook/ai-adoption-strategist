import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function BrandCard({ children, className = '', ...props }) {
  return (
    <Card 
      className={className}
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}
      {...props}
    >
      {children}
    </Card>
  );
}

export function BrandCardHeader({ children, ...props }) {
  return <CardHeader {...props}>{children}</CardHeader>;
}

export function BrandCardTitle({ children, className = '', ...props }) {
  return (
    <CardTitle 
      className={className}
      style={{ color: 'var(--color-text)' }}
      {...props}
    >
      {children}
    </CardTitle>
  );
}

export function BrandCardDescription({ children, className = '', ...props }) {
  return (
    <CardDescription 
      className={className}
      style={{ color: 'var(--color-text-secondary)' }}
      {...props}
    >
      {children}
    </CardDescription>
  );
}

export function BrandCardContent({ children, ...props }) {
  return <CardContent {...props}>{children}</CardContent>;
}

// Gradient Card for hero sections
export function GradientCard({ children, className = '', ...props }) {
  return (
    <Card
      className={className}
      style={{
        background: 'linear-gradient(135deg, rgba(33, 128, 141, 0.05), rgba(50, 184, 198, 0.08))',
        border: '1px solid var(--color-border)'
      }}
      {...props}
    >
      {children}
    </Card>
  );
}