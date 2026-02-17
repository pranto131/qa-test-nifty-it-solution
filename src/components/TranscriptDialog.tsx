import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { parseTranscript } from '@/utils/transcriptParser';
import { format } from 'date-fns';
import { Clock, Users, MessageSquare, FileText } from 'lucide-react';

// Define types locally to avoid ESM export issues
type Dialogue = {
  speaker: string;
  text: string;
  timestamp?: string;
};

type TranscriptStats = {
  totalDialogues: number;
  uniqueParticipants: number;
  participants: string[];
  estimatedDuration: number;
  wordCount: number;
};

interface Meeting {
  _id: string;
  meeting_id: string;
  meeting_uuid: string;
  date: Date | string;
  transcript_content?: string;
  project_name?: string;
  status: string;
}

interface TranscriptDialogProps {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TranscriptDialog({ meeting, open, onOpenChange }: TranscriptDialogProps) {
  if (!meeting || !meeting.transcript_content) {
    return null;
  }

  const { dialogues, stats } = parseTranscript(meeting.transcript_content) as {
    dialogues: Dialogue[];
    stats: TranscriptStats;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {meeting.project_name || 'Meeting Transcript'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {format(new Date(meeting.date), 'PPp')}
          </p>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          {/* Left Side - Transcript */}
          <div className="lg:col-span-2 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Transcript</h3>
              <Badge variant="outline" className="border-border">{stats.totalDialogues} dialogues</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {dialogues.map((dialogue, index) => (
                <div
                  key={index}
                  className="border-l-4 border-l-primary pl-4 py-2 hover:bg-accent/50 rounded-r transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-primary">
                      {dialogue.speaker}
                    </span>
                    {dialogue.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {dialogue.timestamp}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{dialogue.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Stats (placeholder for future content) */}
          <div className="lg:col-span-1 flex flex-col space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Meeting Statistics</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Total Dialogues</p>
                    <p className="text-2xl font-bold">{stats.totalDialogues}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Users className="h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium">Participants</p>
                    <p className="text-2xl font-bold">{stats.uniqueParticipants}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Estimated Duration</p>
                    <p className="text-2xl font-bold">{stats.estimatedDuration} min</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Word Count</p>
                    <p className="text-2xl font-bold">{stats.wordCount.toLocaleString()}</p>
                  </div>
                </div>

                {stats.participants.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Participants List</p>
                    <div className="flex flex-wrap gap-2">
                      {stats.participants.map((participant) => (
                        <Badge key={participant} variant="secondary" className="border-border">
                          {participant}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Placeholder for future right-side content */}
            <div className="flex-1 border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground text-center p-4">
                Additional content will appear here
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

