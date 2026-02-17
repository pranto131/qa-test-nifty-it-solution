import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { TaskCard } from '@/components/TaskCard';
import { useGetTasksQuery } from '@/store/api/tasksApi';
import { format } from 'date-fns';
import { Loader2, Calendar, Users } from 'lucide-react';
import {
  highlightTranscriptSnippets,
  scrollToFirstHighlight,
} from '@/utils/transcriptHighlighter';

interface Task {
  _id: string;
  title: string;
  description: string;
  assignees: string[];
  deadline?: string | Date;
  actionable_items: string[];
  context_used: {
    transcript_snippets: string[];
    pinecone_context: string[];
  };
  clickup_task_id?: string;
  clickup_task_url?: string;
  clickup_destination?: {
    workspace_id: string;
    space_id: string;
    folder_id?: string | null;
    list_id: string;
    original_list_id?: string;
    suggested_by_ai?: boolean;
    selected_by_user?: boolean;
  };
  project_name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface MeetingWithTasks {
  meeting_id: string;
  meeting_info: {
    meeting_id: string;
    meeting_uuid?: string;
    date: string | Date | null;
    project_name: string | null;
    status: string | null;
    transcript_content: string | null;
  };
  tasks: Task[];
}

export default function Tasks() {
  const [expandedMeeting, setExpandedMeeting] = useState<string>('');
  const [highlightedTranscript, setHighlightedTranscript] = useState<string>('');
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Use RTK Query hook (automatic caching and refetching)
  const { data: tasksResponse, isLoading: loading } = useGetTasksQuery();
  
  // Extract meetings from response
  const meetings: MeetingWithTasks[] = tasksResponse?.meetings || [];

  const handleHighlightSnippets = (snippets: string[]) => {
    if (!expandedMeeting) return;

    const meeting = meetings.find((m) => m.meeting_id === expandedMeeting);
    if (!meeting || !meeting.meeting_info.transcript_content) return;

    const transcript = meeting.meeting_info.transcript_content;
    const { highlightedText, positions } = highlightTranscriptSnippets(
      transcript,
      snippets,
      0.7
    );

    setHighlightedTranscript(highlightedText);

    // Scroll to first highlight after a brief delay to allow DOM update
    setTimeout(() => {
      if (transcriptRef.current) {
        scrollToFirstHighlight('transcript-content', positions);
      }
    }, 100);
  };

  const handleMeetingExpand = (meetingId: string) => {
    setExpandedMeeting(meetingId);
    const meeting = meetings.find((m) => m.meeting_id === meetingId);
    if (meeting && meeting.meeting_info.transcript_content) {
      // Reset highlighted transcript when expanding
      setHighlightedTranscript(meeting.meeting_info.transcript_content);
    }
  };

  const groupTasksByAssignee = (tasks: Task[]) => {
    const grouped: Record<string, Task[]> = {};
    const unassigned: Task[] = [];
    const taskIdsSeen = new Set<string>(); // Track tasks already added to unassigned

    tasks.forEach((task) => {
      if (task.assignees.length === 0) {
        if (!taskIdsSeen.has(task._id)) {
          unassigned.push(task);
          taskIdsSeen.add(task._id);
        }
      } else {
        task.assignees.forEach((assignee) => {
          if (!grouped[assignee]) {
            grouped[assignee] = [];
          }
          // Only add task once per assignee group (task can appear in multiple groups)
          if (!grouped[assignee].find((t) => t._id === task._id)) {
            grouped[assignee].push(task);
          }
        });
      }
    });

    return { grouped, unassigned };
  };

  const formatMeetingDate = (date: string | Date | null): string => {
    if (!date) return 'Unknown date';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">View tasks created from meetings</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">View tasks created from meetings</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No tasks found</p>
            <p className="text-sm mt-2">Tasks will appear here after meetings are processed</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tasks</h1>
        <p className="text-muted-foreground">View tasks created from meetings</p>
      </div>

      <Accordion
        type="single"
        collapsible
        className="space-y-4"
        value={expandedMeeting || ''}
        onValueChange={(value) => {
          if (value) {
            handleMeetingExpand(value);
          } else {
            setExpandedMeeting('');
            setHighlightedTranscript('');
          }
        }}
      >
        {meetings.map((meeting) => {
          const { grouped, unassigned } = groupTasksByAssignee(meeting.tasks);
          const transcript = meeting.meeting_info.transcript_content || '';
          const displayTranscript =
            highlightedTranscript || transcript || 'No transcript available';

          return (
            <AccordionItem
              key={meeting.meeting_id}
              value={meeting.meeting_id}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4 text-left">
                    <div>
                      <h3 className="font-semibold">
                        Meeting {meeting.meeting_id.substring(0, 8)}...
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-orange-500" />
                          {formatMeetingDate(meeting.meeting_info.date)}
                        </span>
                        {meeting.meeting_info.project_name && (
                          <span>{meeting.meeting_info.project_name}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-indigo-500" />
                          {meeting.tasks.length} task{meeting.tasks.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                  {/* Left Panel: Transcript */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Transcript</h4>
                    <Card className="h-[600px] overflow-hidden">
                      <CardContent className="h-full overflow-y-auto p-4">
                        <div
                          id="transcript-content"
                          ref={transcriptRef}
                          className="text-sm whitespace-pre-wrap font-mono"
                          dangerouslySetInnerHTML={{ __html: displayTranscript }}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Panel: Tasks Grouped by Assignee */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Tasks</h4>
                    <div className="h-[600px] overflow-y-auto space-y-6">
                      {/* Grouped by Assignee */}
                      {Object.entries(grouped).map(([assignee, tasks]) => (
                        <div key={assignee} className="space-y-2">
                          <h5 className="text-sm font-semibold text-primary border-b pb-1">
                            {assignee}
                          </h5>
                          {tasks.map((task) => (
                            <TaskCard
                              key={task._id}
                              task={task}
                              onHighlightSnippets={handleHighlightSnippets}
                            />
                          ))}
                        </div>
                      ))}

                      {/* Unassigned Group */}
                      {unassigned.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold text-muted-foreground border-b pb-1">
                            Unassigned
                          </h5>
                          {unassigned.map((task) => (
                            <TaskCard
                              key={task._id}
                              task={task}
                              onHighlightSnippets={handleHighlightSnippets}
                            />
                          ))}
                        </div>
                      )}

                      {meeting.tasks.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No tasks for this meeting
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
