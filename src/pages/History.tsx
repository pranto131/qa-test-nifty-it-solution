import { useState } from 'react';
import { TranscriptCard } from '@/components/TranscriptCard';
import { TranscriptDialog } from '@/components/TranscriptDialog';
import { useGetMeetingsQuery } from '@/store/api/meetingsApi';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

interface Meeting {
  _id: string;
  meeting_id: string;
  meeting_uuid: string;
  date: Date | string;
  transcript_content?: string;
  project_name?: string;
  status: string;
}

export default function History() {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Use RTK Query hook (automatic caching and refetching)
  const { data: meetings = [], isLoading: loading, refetch, isFetching: refreshing } = useGetMeetingsQuery();

  const handleRefresh = () => {
    refetch();
  };

  const handleCardClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meeting History</h1>
          <p className="text-muted-foreground">View and explore meeting transcripts</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 text-blue-500 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No meetings with transcripts found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <TranscriptCard
              key={meeting._id}
              meeting={meeting}
              onClick={() => handleCardClick(meeting)}
            />
          ))}
        </div>
      )}

      <TranscriptDialog
        meeting={selectedMeeting}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

