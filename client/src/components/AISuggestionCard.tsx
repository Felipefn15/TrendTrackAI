import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Download, ExternalLink } from "lucide-react";
import type { AISuggestion } from "@shared/schema";

interface AISuggestionCardProps {
  suggestion: AISuggestion;
  onExport?: (suggestion: AISuggestion) => void;
}

export function AISuggestionCard({ suggestion, onExport }: AISuggestionCardProps) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strategic': return 'bg-purple-100 text-purple-800';
      case 'content': return 'bg-blue-100 text-blue-800';
      case 'partnership': return 'bg-green-100 text-green-800';
      case 'quick-win': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <h4 className="font-semibold text-gray-900 text-sm">{suggestion.title}</h4>
          </div>
          <Badge className={getImpactColor(suggestion.impact)} variant="secondary">
            {suggestion.impact} Impact
          </Badge>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {suggestion.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Badge className={getTypeColor(suggestion.type)} variant="outline">
              {suggestion.type}
            </Badge>
            <span className="text-xs text-gray-500">
              Effort: <span className={`font-medium ${getEffortColor(suggestion.effort)}`}>
                {suggestion.effort}
              </span>
            </span>
          </div>
        </div>

        {onExport && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(suggestion)}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
