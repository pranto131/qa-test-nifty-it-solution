import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Search, ChevronDown, ChevronUp, ExternalLink, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: {
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
    clickup_task_url?: string; // Optional - only present if created in ClickUp
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
  };
  onHighlightSnippets: (snippets: string[]) => void;
}

export function TaskCard({ task, onHighlightSnippets }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchClick = (snippets: string[]) => {
    onHighlightSnippets(snippets);
  };

  const formatDeadline = (deadline?: string | Date): string => {
    if (!deadline) return 'No deadline';
    try {
      const date = typeof deadline === 'string' ? new Date(deadline) : deadline;
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold mb-2">{task.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {task.assignees.length > 0 ? (
                task.assignees.map((assignee, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs border-border">
                    <User className="h-3 w-3 mr-1 text-indigo-500" />
                    {assignee}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="text-xs border-border">
                  Unassigned
                </Badge>
              )}
              {task.deadline && (
                <Badge variant="outline" className="text-xs border-border">
                  <Calendar className="h-3 w-3 mr-1 text-orange-500" />
                  {formatDeadline(task.deadline)}
                </Badge>
              )}
              <Badge variant="project" className="text-xs">
                {task.project_name}
              </Badge>
              {task.clickup_destination && (
                <Badge variant="outline" className="text-xs border-border" title={`Destination: ${task.clickup_destination.workspace_id} > ${task.clickup_destination.space_id} > ${task.clickup_destination.list_id}`}>
                  {task.clickup_destination.suggested_by_ai ? 'AI Selected' : task.clickup_destination.selected_by_user ? 'User Selected' : 'Destination Set'}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {task.clickup_task_url && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={task.clickup_task_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                </a>
              </Button>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Description</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Actionable Items */}
          {task.actionable_items && task.actionable_items.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Actionable Items</h4>
              <ul className="space-y-2">
                {task.actionable_items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span className="flex-1">{item}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSearchClick(task.context_used.transcript_snippets);
                      }}
                      title="Highlight all transcript snippets for this task"
                    >
                      <Search className="h-3 w-3 text-blue-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Deadline */}
          {task.deadline && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Deadline</h4>
              <p className="text-sm text-muted-foreground">{formatDeadline(task.deadline)}</p>
            </div>
          )}

          {/* Past Contexts (Pinecone) */}
          {task.context_used.pinecone_context && task.context_used.pinecone_context.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Past Contexts</h4>
              <div className="space-y-2">
                {task.context_used.pinecone_context.map((context, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-muted-foreground bg-muted p-2 rounded border-l-2 border-primary/20"
                  >
                    {context}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ClickUp Destination */}
          {task.clickup_destination && (
            <div>
              <h4 className="text-sm font-semibold mb-2">ClickUp Destination</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Workspace: {task.clickup_destination.workspace_id}</p>
                <p>Space: {task.clickup_destination.space_id}</p>
                {task.clickup_destination.folder_id && <p>Folder: {task.clickup_destination.folder_id}</p>}
                <p>List: {task.clickup_destination.list_id}</p>
                {task.clickup_destination.original_list_id && (
                  <p className="text-xs">Original Sprint: {task.clickup_destination.original_list_id}</p>
                )}
                <div className="flex gap-2 mt-2">
                  {task.clickup_destination.suggested_by_ai && (
                    <Badge variant="outline" className="text-xs border-border">AI Suggested</Badge>
                  )}
                  {task.clickup_destination.selected_by_user && (
                    <Badge variant="outline" className="text-xs border-border">User Selected</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

