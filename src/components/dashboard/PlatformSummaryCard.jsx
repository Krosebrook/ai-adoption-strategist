import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Trophy, Medal, Award, ChevronRight } from 'lucide-react';
import { AI_PLATFORMS } from '../assessment/AssessmentData';

export default function PlatformSummaryCard({ platform, rank, assessmentId }) {
  const platformData = AI_PLATFORMS.find(p => p.id === platform.platform);
  
  const rankIcons = {
    1: Trophy,
    2: Medal,
    3: Award
  };

  const RankIcon = rankIcons[rank] || Award;

  const rankColors = {
    1: {
      bg: 'from-amber-500 to-yellow-600',
      text: 'text-amber-600',
      icon: 'text-amber-600',
      badge: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    2: {
      bg: 'from-slate-400 to-slate-600',
      text: 'text-slate-600',
      icon: 'text-slate-600',
      badge: 'bg-slate-100 text-slate-800 border-slate-300'
    },
    3: {
      bg: 'from-orange-600 to-amber-700',
      text: 'text-orange-600',
      icon: 'text-orange-600',
      badge: 'bg-orange-100 text-orange-800 border-orange-300'
    }
  };

  const colors = rankColors[rank] || rankColors[3];

  return (
    <Card className="border-slate-200 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      {/* Rank Badge */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors.bg} opacity-10 rounded-bl-full`} />
      
      <CardContent className="pt-6 relative">
        {/* Rank & Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
              <RankIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Rank #{rank}</p>
              <Badge className={colors.badge}>Top Choice</Badge>
            </div>
          </div>
        </div>

        {/* Platform Name */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platformData?.color }} />
            <h3 className="text-xl font-bold text-slate-900">{platformData?.name}</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{platform.score.toFixed(1)}</span>
            <span className="text-sm text-slate-500">/ 100</span>
          </div>
        </div>

        {/* Justification */}
        <p className="text-sm text-slate-600 mb-4 line-clamp-3">
          {platform.justification}
        </p>

        {/* View Details Button */}
        <Link to={createPageUrl('Results') + `?id=${assessmentId}`}>
          <Button 
            variant="outline" 
            className="w-full border-slate-300 hover:bg-slate-50"
          >
            View Details
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}