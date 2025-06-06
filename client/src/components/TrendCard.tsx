import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import type { Trend } from "@shared/schema";

interface TrendCardProps {
  trend: Trend;
  onViewDetails?: (trend: Trend) => void;
}

export function TrendCard({ trend, onViewDetails }: TrendCardProps) {
  const sources = Array.isArray(trend.sources) ? trend.sources : [];
  const isPositive = (trend.changePercentage || 0) >= 0;

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fashion': return 'bg-purple-100 text-purple-800';
      case 'lifestyle': return 'bg-green-100 text-green-800';
      case 'tech': return 'bg-blue-100 text-blue-800';
      case 'beauty': return 'bg-pink-100 text-pink-800';
      case 'sustainability': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Badge className={getCategoryColor(trend.category)} variant="secondary">
              {trend.category}
            </Badge>
            <h3 className="font-semibold text-gray-900 text-base">{trend.title}</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.changePercentage > 0 ? '+' : ''}{trend.changePercentage}%
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {trend.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {sources.slice(0, 3).map((source: any, index: number) => (
              <span key={index} className="flex items-center">
                <span className="font-medium">{source.platform}:</span>
                <span className="ml-1">{source.mentions}</span>
              </span>
            ))}
          </div>
          <Badge className={getImpactColor(trend.impact)} variant="outline">
            {trend.impact} Impact
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Confidence: <span className="font-medium text-green-600">{trend.confidence}%</span></span>
            <span>Score: <span className="font-medium text-primary">{trend.trendScore}/100</span></span>
          </div>
          {onViewDetails && (
            <button 
              onClick={() => onViewDetails(trend)}
              className="text-primary hover:text-primary/80 text-sm font-medium flex items-center space-x-1 transition-colors"
            >
              <span>View Details</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
