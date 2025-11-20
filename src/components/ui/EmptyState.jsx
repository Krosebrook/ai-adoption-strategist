import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel = null, 
  onAction = null,
  className = ''
}) {
  return (
    <Card className={`border-slate-200 ${className}`}>
      <CardContent className="py-12 text-center">
        {Icon && <Icon className="h-12 w-12 text-slate-300 mx-auto mb-4" />}
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        {description && <p className="text-slate-600 mb-4">{description}</p>}
        {actionLabel && onAction && (
          <Button onClick={onAction} className="bg-slate-900 hover:bg-slate-800 text-white">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}