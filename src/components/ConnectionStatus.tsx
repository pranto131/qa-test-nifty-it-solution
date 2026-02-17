import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { settingsApi } from '@/services/api';
import { CheckCircle2, XCircle } from 'lucide-react';

export function ConnectionStatus() {
  // ZOOM CONNECTION STATUS COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
  // const [zoomConnected, setZoomConnected] = useState(false);
  const [clickUpConnected, setClickUpConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  // const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check on initial mount
    checkConnections();

    // Listen for focus events to refresh when user returns to tab
    const handleFocus = () => {
      checkConnections();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const checkConnections = async () => {
    try {
      // ZOOM STATUS CHECK COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
      // const [zoomStatus, clickUpConfig] = await Promise.all([
      //   zoomApi.getStatus().catch(() => ({ data: { connected: false } })),
      //   settingsApi.getClickUpConfig().catch(() => ({ data: null })),
      // ]);
      // setZoomConnected(zoomStatus.data.connected);
      const clickUpConfig = await settingsApi.getClickUpConfig().catch(() => ({ data: null }));
      setClickUpConnected(!!clickUpConfig.data);
    } catch (error) {
      console.error('Error checking connections:', error);
    } finally {
      setLoading(false);
    }
  };

  // ZOOM CONNECT HANDLER COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
  // const handleConnectZoom = () => {
  //   // Open Zoom OAuth in a new tab
  //   const authWindow = window.open(zoomApi.authorize(), '_blank', 'noopener,noreferrer');
  //   
  //   // Check connection status after a delay (to allow OAuth to complete)
  //   // Also check when window might close
  //   const checkInterval = setInterval(() => {
  //     if (authWindow?.closed) {
  //       clearInterval(checkInterval);
  //       // Wait a bit for the callback to process, then refresh
  //       setTimeout(() => {
  //         checkConnections(true);
  //       }, 2000);
  //     }
  //   }, 1000);
  //   
  //   // Also check periodically while window is open
  //   setTimeout(() => {
  //     clearInterval(checkInterval);
  //     checkConnections(true);
  //   }, 30000); // Stop checking after 30 seconds
  // };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connections</CardTitle>
          <CardDescription>Checking connection status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connections</CardTitle>
        <CardDescription>Manage your service connections</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ZOOM CONNECTION STATUS COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE */}
        {/* <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {zoomConnected ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">Zoom</span>
            <Badge variant={zoomConnected ? 'default' : 'secondary'}>
              {zoomConnected ? 'Connected' : 'Not Connected'}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => checkConnections(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          {!zoomConnected && (
            <Button size="sm" onClick={handleConnectZoom}>
              Connect
            </Button>
          )}
        </div> */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {clickUpConnected ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">ClickUp</span>
            <Badge variant={clickUpConnected ? 'completed' : 'cancelled'}>
              {clickUpConnected ? 'Connected' : 'Not Connected'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

