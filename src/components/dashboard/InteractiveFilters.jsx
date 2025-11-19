import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, Search } from 'lucide-react';

export default function InteractiveFilters({ filters, onFilterChange, assessments }) {
  const uniquePlatforms = [...new Set(
    assessments
      .filter(a => a.recommended_platforms?.[0])
      .map(a => a.recommended_platforms[0].platform_name)
  )];

  const uniqueDepartmentCounts = [...new Set(
    assessments.map(a => a.departments?.length || 0)
  )].sort((a, b) => a - b);

  return (
    <Card style={{ background: 'var(--color-surface)', borderColor: 'var(--color-card-border)' }}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
          <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
            <Input
              placeholder="Search organizations..."
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>

          <Select value={filters.platform} onValueChange={(value) => onFilterChange({ ...filters, platform: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {uniquePlatforms.map(platform => (
                <SelectItem key={platform} value={platform}>{platform}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => onFilterChange({ ...filters, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.timeRange} onValueChange={(value) => onFilterChange({ ...filters, timeRange: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}