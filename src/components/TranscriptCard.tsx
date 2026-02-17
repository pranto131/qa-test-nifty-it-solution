import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { MessageSquare, Calendar, FileText } from 'lucide-react';

interface Meeting {
  _id: string;
  meeting_id: string;
  date: Date | string;
  transcript_content?: string;
  project_name?: string;
  status: string;
}

interface TranscriptCardProps {
  meeting: Meeting;
  onClick: () => void;
}

export function TranscriptCard({ meeting, onClick }: TranscriptCardProps) {
  const transcriptLength = meeting.transcript_content?.length || 0;
  const wordCount = meeting.transcript_content?.split(/\s+/).length || 0;
  const preview = meeting.transcript_content?.substring(0, 150) || 'No transcript available';

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow hover:border-primary"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">
              {meeting.project_name || 'Untitled Meeting'}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span>{format(new Date(meeting.date), 'PPp')}</span>
            </div>
          </div>
          <Badge 
            variant={
              meeting.status === 'completed' ? 'completed' :
              meeting.status === 'processing' ? 'processing' :
              meeting.status === 'failed' ? 'failed' :
              meeting.status === 'cancelled' ? 'cancelled' : 'outline'
            }
          >
            {meeting.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {preview}...
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3 text-blue-500" />
            <span>{wordCount.toLocaleString()} words</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-green-500" />
            <span>{transcriptLength.toLocaleString()} chars</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

