import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Share2, Clock } from 'lucide-react';

export default function SharedContextPanel({ context, onClear }) {
  if (!context) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 z-50">
      <Card className="bg-blue-50 border-2 border-blue-200 shadow-lg">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-900">Shared Context</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClear}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Badge className="bg-blue-100 text-blue-800 mb-2">
            {context.type}
          </Badge>
          
          <p className="text-sm text-blue-800 font-medium">{context.name}</p>
          
          {context.content && (
            <p className="text-xs text-blue-700 mt-1 line-clamp-2">{context.content}</p>
          )}
          
          {context.from && (
            <p className="text-xs text-blue-600 mt-2">
              From: {context.from}
            </p>
          )}
          
          <div className="flex items-center gap-1 mt-2 text-xs text-blue-500">
            <Clock className="h-3 w-3" />
            {new Date(context.timestamp).toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}