import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Globe, Settings, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Source {
  id: number;
  name: string;
  platform: string;
  enabled: boolean;
  status: 'active' | 'error' | 'rate_limited' | 'pending';
  lastCheck: string | null;
  errorMessage: string | null;
  config: any;
}

export default function Sources() {
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    platform: '',
    enabled: true,
    config: {}
  });
  const { toast } = useToast();

  const { data: sources, isLoading } = useQuery<Source[]>({
    queryKey: ['/api/sources'],
  });

  const { data: scrapingResult, mutate: runScraping, isPending: isScrapingPending } = useMutation({
    mutationFn: async (platform?: string) => {
      return await apiRequest('POST', '/api/scrape', platform ? { platform } : {});
    },
    onSuccess: (data) => {
      toast({
        title: "Scraping completed",
        description: `Successfully collected ${data.data?.length || 0} data points`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sources'] });
    },
    onError: (error) => {
      toast({
        title: "Scraping failed",
        description: error instanceof Error ? error.message : "An error occurred during scraping",
        variant: "destructive",
      });
    }
  });

  const updateSourceMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      const source = sources?.find(s => s.id === id);
      if (!source) throw new Error('Source not found');
      
      // In a real implementation, this would update the source's enabled status
      await apiRequest('PUT', `/api/sources/${id}/status`, { 
        status: enabled ? 'active' : 'pending',
        enabled 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sources'] });
      toast({
        title: "Source updated",
        description: "Source configuration has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update source",
        variant: "destructive",
      });
    }
  });

  const addSourceMutation = useMutation({
    mutationFn: async (sourceData: typeof newSource) => {
      return await apiRequest('POST', '/api/sources', sourceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sources'] });
      setIsAddSourceOpen(false);
      setNewSource({ name: '', platform: '', enabled: true, config: {} });
      toast({
        title: "Source added",
        description: "New data source has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add source",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  const handleToggleSource = (source: Source) => {
    updateSourceMutation.mutate({ id: source.id, enabled: !source.enabled });
  };

  const handleTestSource = (platform: string) => {
    runScraping(platform);
  };

  const handleRunAllScraping = () => {
    runScraping();
  };

  const handleAddSource = () => {
    if (!newSource.name || !newSource.platform) {
      toast({
        title: "Invalid input",
        description: "Please provide both name and platform for the new source.",
        variant: "destructive",
      });
      return;
    }
    addSourceMutation.mutate(newSource);
  };

  const getLastCheckTime = (lastCheck: string | null) => {
    if (!lastCheck) return 'Never';
    const time = new Date(lastCheck);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return time.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Sources</h1>
              <p className="text-gray-600 mt-1">Manage and monitor your cultural trend data sources</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleRunAllScraping} 
                disabled={isScrapingPending}
                variant="default"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isScrapingPending ? 'animate-spin' : ''}`} />
                {isScrapingPending ? 'Scraping...' : 'Run All Sources'}
              </Button>
              <Dialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Source
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Data Source</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="source-name">Source Name</Label>
                      <Input
                        id="source-name"
                        value={newSource.name}
                        onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                        placeholder="e.g., Instagram Trends"
                      />
                    </div>
                    <div>
                      <Label htmlFor="source-platform">Platform</Label>
                      <Input
                        id="source-platform"
                        value={newSource.platform}
                        onChange={(e) => setNewSource({...newSource, platform: e.target.value})}
                        placeholder="e.g., instagram"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newSource.enabled}
                        onCheckedChange={(enabled) => setNewSource({...newSource, enabled})}
                      />
                      <Label>Enable source</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddSourceOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddSource} disabled={addSourceMutation.isPending}>
                        Add Source
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sources && sources.length > 0 ? (
            sources.map((source) => (
              <Card key={source.id} className="border border-gray-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                    </div>
                    <StatusIndicator status={source.status} />
                  </div>
                  <p className="text-sm text-gray-500">{source.platform}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Status Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last Check:</span>
                        <span className="font-medium">{getLastCheckTime(source.lastCheck)}</span>
                      </div>
                      {source.errorMessage && (
                        <div className="flex items-start space-x-2 p-2 bg-red-50 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-red-700">{source.errorMessage}</span>
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`source-${source.id}`} className="text-sm font-medium">
                          Enable Source
                        </Label>
                        <Switch
                          id={`source-${source.id}`}
                          checked={source.enabled}
                          onCheckedChange={() => handleToggleSource(source)}
                          disabled={updateSourceMutation.isPending}
                        />
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleTestSource(source.platform)}
                          disabled={isScrapingPending || !source.enabled}
                        >
                          <RefreshCw className={`w-3 h-3 mr-1 ${isScrapingPending ? 'animate-spin' : ''}`} />
                          Test
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sources configured</h3>
                  <p className="text-gray-500 mb-4">Add your first data source to start monitoring cultural trends</p>
                  <Button onClick={() => setIsAddSourceOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Source
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Scraping Results */}
        {scrapingResult && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Latest Scraping Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{scrapingResult.data?.length || 0}</p>
                    <p className="text-sm text-gray-500">Data Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {scrapingResult.success ? 'Success' : 'Failed'}
                    </p>
                    <p className="text-sm text-gray-500">Status</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{scrapingResult.errors?.length || 0}</p>
                    <p className="text-sm text-gray-500">Errors</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {new Date(scrapingResult.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-gray-500">Time</p>
                  </div>
                </div>
                
                {scrapingResult.errors && scrapingResult.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Errors:</h4>
                    <div className="space-y-1">
                      {scrapingResult.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
