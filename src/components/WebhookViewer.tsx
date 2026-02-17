// WEBHOOK FUNCTIONALITY COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
/*
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { webhookApi } from '@/services/api';
import { Loader2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface WebhookEvent {
  id: string;
  event: string;
  event_ts: number;
  payload: any;
  headers: any;
  raw_body: string;
  processed: boolean;
  createdAt: string;
}

export function WebhookViewer() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvents = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    }
    try {
      const response = await webhookApi.getEvents({ limit: 5 });
      setEvents(response.data.events || []);
    } catch (error: any) {
      // Silently handle network errors (backend might not be running)
      if (error?.code !== 'ERR_NETWORK' && error?.message !== 'Network Error') {
        console.error('Error fetching webhook events:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchEvents();
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatStartTime = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM dd, yyyy h:mm a');
    } catch {
      return new Date(dateString).toLocaleString();
    }
  };

  const getEventDisplay = (event: WebhookEvent): { badgeTitle: string; title: string; details?: string } => {
    if (event.event === 'endpoint.url_validation') {
      return {
        badgeTitle: 'Webhook validation',
        title: 'Webhook connected',
      };
    }

    if (event.event === 'recording.transcript_completed') {
      const payload = event.payload;
      const object = payload?.object;
      
      if (object) {
        const topic = object.topic || 'Untitled Meeting';
        const startTime = object.start_time ? formatStartTime(object.start_time) : 'Unknown time';
        const duration = object.duration ? formatDuration(object.duration) : 'Unknown duration';
        
        return {
          badgeTitle: 'Received new meeting transcript',
          title: topic,
          details: `${startTime} • ${duration}`,
        };
      }
    }

    // Fallback for other event types - show event name
    return {
      badgeTitle: event.event,
      title: event.event,
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Webhook Events</CardTitle>
          <CardDescription>Real-time webhook event viewer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Webhook Events</CardTitle>
            <CardDescription className="text-xs">Recent webhook events</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="h-8 px-2"
            >
              {autoRefresh ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fetchEvents(true)}
              disabled={refreshing}
              className="h-8 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {events.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <p>No webhook events received yet.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {events.map((event) => {
              const eventDisplay = getEventDisplay(event);

              return (
                <div
                  key={event.id}
                  className="border rounded p-3 bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={event.processed ? 'default' : 'secondary'} className="text-xs px-1.5 py-0">
                          {eventDisplay.badgeTitle}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {eventDisplay.title}
                      </div>
                      {eventDisplay.details && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {eventDisplay.details}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
*/

// Placeholder export to prevent TypeScript errors
export function WebhookViewer() {
  return null;
}
