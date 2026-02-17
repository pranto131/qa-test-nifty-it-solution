import { useEffect, useState } from 'react';
import { Button } from './ui/button';
// WEBHOOK FUNCTIONALITY COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
// import { Switch } from './ui/switch';
// ZOOM API COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
// import { zoomApi, settingsApi, webhookApi } from '@/services/api';
// WEBHOOK FUNCTIONALITY COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
// import { settingsApi, webhookApi } from '@/services/api';
import { settingsApi } from '@/services/api';
import { RefreshCw, CheckSquare, Loader2 } from 'lucide-react';
// WEBHOOK ICON COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
// import { Webhook } from 'lucide-react';
// ZOOM ICON COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
// import { Video } from 'lucide-react';

const CONNECTED_COLOR = '#0b8a2d';
const DISCONNECTED_COLOR = '#bf200b';

export function StatusBar() {
  // ZOOM CONNECTION STATE COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
  // const [zoomConnected, setZoomConnected] = useState(false);
  const [clickUpConnected, setClickUpConnected] = useState(false);
  // WEBHOOK FUNCTIONALITY COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
  // const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  // ZOOM REFRESH STATE COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
  // const [refreshing, setRefreshing] = useState({ zoom: false, clickup: false, webhook: false });
  const [refreshing, setRefreshing] = useState({ clickup: false });
  // WEBHOOK FUNCTIONALITY COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
  // const [updatingWebhook, setUpdatingWebhook] = useState(false);

  useEffect(() => {
    fetchAllStatus();
    
    const handleFocus = () => {
      fetchAllStatus();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchAllStatus = async () => {
    try {
      // ZOOM STATUS CHECK COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
      // const [zoomStatus, clickUpConfig, webhookStatus] = await Promise.all([
      //   zoomApi.getStatus().catch(() => ({ data: { connected: false } })),
      //   settingsApi.getClickUpConfig().catch(() => ({ data: null })),
      //   webhookApi.getToggle().catch(() => ({ data: { enabled: false } })),
      // ]);
      // setZoomConnected(zoomStatus.data.connected);
      // WEBHOOK FUNCTIONALITY COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
      // const [clickUpConfig, webhookStatus] = await Promise.all([
      //   settingsApi.getClickUpConfig().catch(() => ({ data: null })),
      //   webhookApi.getToggle().catch(() => ({ data: { enabled: false } })),
      // ]);
      const clickUpConfig = await settingsApi.getClickUpConfig().catch(() => ({ data: null }));
      setClickUpConnected(!!clickUpConfig.data);
      // WEBHOOK FUNCTIONALITY COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
      // setWebhookEnabled(webhookStatus.data.enabled);
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  // ZOOM REFRESH HANDLER COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
  // const handleRefreshZoom = async () => {
  //   setRefreshing({ ...refreshing, zoom: true });
  //   try {
  //     const response = await zoomApi.getStatus();
  //     setZoomConnected(response.data.connected);
  //   } catch (error) {
  //     console.error('Error refreshing Zoom status:', error);
  //   } finally {
  //     setRefreshing({ ...refreshing, zoom: false });
  //   }
  // };

  const handleRefreshClickUp = async () => {
    setRefreshing({ ...refreshing, clickup: true });
    try {
      const response = await settingsApi.getClickUpConfig();
      setClickUpConnected(!!response.data);
    } catch (error) {
      console.error('Error refreshing ClickUp status:', error);
    } finally {
      setRefreshing({ ...refreshing, clickup: false });
    }
  };

  // ZOOM CONNECT HANDLER COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
  // const handleConnectZoom = () => {
  //   const authWindow = window.open(zoomApi.authorize(), '_blank', 'noopener,noreferrer');
  //   const checkInterval = setInterval(() => {
  //     if (authWindow?.closed) {
  //       clearInterval(checkInterval);
  //       setTimeout(() => {
  //         handleRefreshZoom();
  //       }, 2000);
  //     }
  //   }, 1000);
  //   setTimeout(() => {
  //     clearInterval(checkInterval);
  //     handleRefreshZoom();
  //   }, 30000);
  // };

  // WEBHOOK FUNCTIONALITY COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
  // const handleToggleWebhook = async (checked: boolean) => {
  //   setUpdatingWebhook(true);
  //   try {
  //     await webhookApi.setToggle(checked);
  //     setWebhookEnabled(checked);
  //   } catch (error) {
  //     console.error('Error updating webhook toggle:', error);
  //     setWebhookEnabled(!checked);
  //   } finally {
  //     setUpdatingWebhook(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* ZOOM STATUS COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE */}
      {/* <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <Video 
          className="h-4 w-4 flex-shrink-0" 
          style={{ color: zoomConnected ? CONNECTED_COLOR : DISCONNECTED_COLOR }}
        />
        <span className="text-sm font-medium">Zoom</span>
        <span
          className="text-sm font-medium"
          style={{ color: zoomConnected ? CONNECTED_COLOR : DISCONNECTED_COLOR }}
        >
          {zoomConnected ? 'Connected' : 'Not Connected'}
        </span>
        {!zoomConnected && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleConnectZoom}
            className="h-6 px-2 text-xs"
          >
            Connect
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefreshZoom}
          disabled={refreshing.zoom}
          className="h-6 w-6 p-0"
          title="Refresh Zoom status"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing.zoom ? 'animate-spin' : ''}`} />
        </Button>
      </div> */}

      {/* ClickUp Status */}
      <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <CheckSquare
          className="h-4 w-4 flex-shrink-0"
          style={{ color: clickUpConnected ? CONNECTED_COLOR : DISCONNECTED_COLOR }}
        />
        <span className="text-sm font-medium">ClickUp</span>
        <span
          className="text-sm font-medium"
          style={{ color: clickUpConnected ? CONNECTED_COLOR : DISCONNECTED_COLOR }}
        >
          {clickUpConnected ? 'Connected' : 'Not Connected'}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefreshClickUp}
          disabled={refreshing.clickup}
          className="h-6 w-6 p-0"
          title="Refresh ClickUp status"
        >
          <RefreshCw className={`h-3 w-3 text-blue-500 ${refreshing.clickup ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* WEBHOOK FUNCTIONALITY COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE */}
      {/* <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <Webhook
          className="h-4 w-4 flex-shrink-0"
          style={{ color: webhookEnabled ? CONNECTED_COLOR : DISCONNECTED_COLOR }}
        />
        <span className="text-sm font-medium">Webhook</span>
        <span
          className="text-sm font-medium"
          style={{ color: webhookEnabled ? CONNECTED_COLOR : DISCONNECTED_COLOR }}
        >
          {webhookEnabled ? 'Enabled' : 'Disabled'}
        </span>
        <Switch
          checked={webhookEnabled}
          onCheckedChange={handleToggleWebhook}
          disabled={updatingWebhook}
          style={{
            backgroundColor: webhookEnabled ? CONNECTED_COLOR : DISCONNECTED_COLOR,
          }}
          className="[&[data-state=checked]]:!bg-[#0b8a2d] [&[data-state=unchecked]]:!bg-[#bf200b]"
        />
      </div> */}
    </div>
  );
}

