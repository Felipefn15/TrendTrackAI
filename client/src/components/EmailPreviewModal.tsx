import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Send } from "lucide-react";
import type { Trend, AISuggestion } from "@shared/schema";

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  trends: Trend[];
  suggestions: AISuggestion[];
  onSendTest?: (email: string) => void;
}

export function EmailPreviewModal({ isOpen, onClose, trends, suggestions, onSendTest }: EmailPreviewModalProps) {
  const topTrends = trends.slice(0, 3);
  const topSuggestions = suggestions.slice(0, 3);
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendTest = () => {
    const email = prompt('Enter email address for test:');
    if (email && onSendTest) {
      onSendTest(email);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Email Report Preview
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Header */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <div>
                <strong>To:</strong> <span>recipients@company.com</span>
              </div>
              <div>{currentDate}, 6:00 AM</div>
            </div>
            <div>
              <strong className="text-gray-900">Subject:</strong> 
              <span className="ml-2">🔥 Daily Cultural Trends Report - {currentDate}</span>
            </div>
          </div>

          {/* Email Content Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Email Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">TrendScope Daily Report</h1>
              <p className="text-primary-100">Your AI-powered cultural intelligence briefing</p>
            </div>

            {/* Email Body */}
            <div className="p-6 space-y-8">
              {/* Top Trends Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🔥</span>
                  Top 3 Trending Now
                </h2>
                
                <div className="space-y-4">
                  {topTrends.map((trend, index) => (
                    <div key={trend.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{trend.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{trend.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(trend.sources) && trend.sources.slice(0, 3).map((source: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {source.platform}: {source.mentions}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Suggestions Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">💡</span>
                  AI-Generated Brand Opportunities
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{suggestion.title}</h4>
                        <Badge className={getImpactColor(suggestion.impact)} variant="secondary">
                          {suggestion.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                      <div className="text-xs text-gray-500">
                        Type: {suggestion.type} • Effort: {suggestion.effort}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
                <p>Powered by TrendScope AI • <a href="#" className="text-primary hover:text-primary/80">View Full Dashboard</a></p>
                <p className="mt-1">Want to change your settings? <a href="#" className="text-primary hover:text-primary/80">Update preferences</a></p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onSendTest && (
            <Button onClick={handleSendTest}>
              <Send className="w-4 h-4 mr-2" />
              Send Test Email
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
