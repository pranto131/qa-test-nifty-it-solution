// PIPELINE EVALUATION COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
import { useEffect, useState } from 'react';
// import { pipelineEvaluationApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Clock, CheckCircle2, ChevronRight, FileText, Code, MessageSquare, Database, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface PipelineEvaluation {
  _id: string;
  meeting_id: string;
  meeting_title: string;
  meeting_date: string;
  meeting_time: string;
  phase1_metadata_extraction: {
    input: {
      transcript_length: number;
      transcript_full: string;
      ai_prompt?: string;
    };
    output: {
      date: string;
      type: string;
      assignees: string[];
      projects: string[];
      primary_project: string;
      ai_response?: string;
    };
    processing_time_ms: number;
  };
  phase2_transcript_segmentation: {
    input: {
      projects_count: number;
      projects: string[];
      transcript_full: string;
      ai_prompt?: string;
    };
    output: {
      sections_by_project: Array<{
        project_name: string;
        sections_count: number;
        total_chars: number;
        sections: string[];
        ai_response?: string;
      }>;
    };
    processing_time_ms: number;
  };
  phase3_per_project_processing: Array<{
    project_name: string;
    transcript_storage: {
      chunks_stored: number;
      total_chars: number;
      chunks: Array<{
        chunk_index: number;
        content: string;
        char_count: number;
      }>;
      processing_time_ms: number;
    };
    context_retrieval: {
      context_items_retrieved: number;
      context_items: Array<{
        text: string;
        metadata?: Record<string, any>;
        score?: number;
      }>;
      processing_time_ms: number;
    };
    task_generation: {
      input: {
        transcript_sections: string[];
        transcript_sections_count: number;
        context_items: Array<{ text: string }>;
        context_items_count: number;
        ai_prompt?: string;
      };
      output: {
        tasks_generated: number;
        tasks: Array<{
          title: string;
          description: string;
          assignees: string[];
          deadline?: string;
          actionable_items: string[];
          transcript_snippets: string[];
          ai_response?: string;
        }>;
      };
      processing_time_ms: number;
    };
  }>;
  phase4_task_storage_clickup: {
    tasks_stored_mongodb: number;
    tasks_mongodb: Array<{
      task_id: string;
      title: string;
      description: string;
      assignees: string[];
      deadline?: string;
      actionable_items: string[];
      project_name: string;
    }>;
    tasks_created_clickup: number;
    tasks_clickup: Array<{
      task_id: string;
      task_url: string;
      title: string;
      description: string;
      assignees: string[];
      project_name: string;
    }>;
    tasks_failed_clickup: number;
    tasks_failed: Array<{
      title: string;
      error?: string;
      project_name: string;
    }>;
    tasks_stored_pinecone: number;
    processing_time_ms: number;
  };
  summary: {
    total_projects: number;
    total_tasks: number;
    total_processing_time_ms: number;
    status: 'completed' | 'failed' | 'partial';
  };
}

export default function PipelineEvaluations() {
  const [evaluations, setEvaluations] = useState<PipelineEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvaluation, setSelectedEvaluation] = useState<PipelineEvaluation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      // PIPELINE EVALUATION COMMENTED OUT - NOT REMOVED FOR FUTURE REFERENCE
      // const response = await pipelineEvaluationApi.getAll();
      // setEvaluations(response.data);
      setEvaluations([]); // Temporary: return empty array since API is commented out
    } catch (error) {
      console.error('Error fetching pipeline evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="completed">Completed</Badge>;
      case 'partial':
        return <Badge variant="partial">Partial</Badge>;
      case 'failed':
        return <Badge variant="failed">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCardClick = (evaluation: PipelineEvaluation) => {
    setSelectedEvaluation(evaluation);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading pipeline evaluations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pipeline Evaluations</h1>
          <p className="text-muted-foreground mt-1">
            Detailed analysis of AI pipeline processing from transcript to task creation
          </p>
        </div>
        <Button onClick={fetchEvaluations} variant="outline">
          Refresh
        </Button>
      </div>

      {evaluations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No pipeline evaluations found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {evaluations.map((evaluation) => (
            <Card
              key={evaluation._id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleCardClick(evaluation)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1 line-clamp-2">
                      {evaluation.meeting_title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-orange-500" />
                      {format(new Date(evaluation.meeting_date), 'MMM dd, yyyy')} at {evaluation.meeting_time}
                    </CardDescription>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0 ml-2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getStatusBadge(evaluation.summary.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Projects</span>
                    <span className="text-sm font-medium">{evaluation.summary.total_projects}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tasks Generated</span>
                    <span className="text-sm font-medium">{evaluation.summary.total_tasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Processing Time</span>
                    <span className="text-sm font-medium">
                      {formatTime(evaluation.summary.total_processing_time_ms)}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>ClickUp Tasks</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">
                          {evaluation.phase4_task_storage_clickup.tasks_created_clickup} created
                        </span>
                        {evaluation.phase4_task_storage_clickup.tasks_failed_clickup > 0 && (
                          <span className="text-red-600">
                            {evaluation.phase4_task_storage_clickup.tasks_failed_clickup} failed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedEvaluation?.meeting_title}</DialogTitle>
            <DialogDescription>
              {selectedEvaluation && (
                <>
                  {format(new Date(selectedEvaluation.meeting_date), 'MMMM dd, yyyy')} at{' '}
                  {selectedEvaluation.meeting_time}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto bg-white pr-2">
            {selectedEvaluation && (
              <div className="space-y-6 py-4">
                {/* Summary */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="font-medium">{getStatusBadge(selectedEvaluation.summary.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Projects</p>
                      <p className="font-medium">{selectedEvaluation.summary.total_projects}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Tasks</p>
                      <p className="font-medium">{selectedEvaluation.summary.total_tasks}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Processing Time</p>
                      <p className="font-medium">
                        {formatTime(selectedEvaluation.summary.total_processing_time_ms)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phase 1: Metadata Extraction */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Phase 1: Metadata Extraction
                  </h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="phase1-input">
                      <AccordionTrigger>Input: Full Transcript ({selectedEvaluation.phase1_metadata_extraction.input.transcript_length.toLocaleString()} characters)</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-50 rounded p-3 text-sm max-h-64 overflow-y-auto font-mono whitespace-pre-wrap">
                          {selectedEvaluation.phase1_metadata_extraction.input.transcript_full}
                        </div>
                        {selectedEvaluation.phase1_metadata_extraction.input.ai_prompt && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">AI Prompt:</p>
                            <div className="bg-blue-50 rounded p-3 text-xs max-h-48 overflow-y-auto font-mono whitespace-pre-wrap border border-blue-200">
                              {selectedEvaluation.phase1_metadata_extraction.input.ai_prompt}
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="phase1-output">
                      <AccordionTrigger>Output: Extracted Metadata</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-50 rounded p-3 text-sm space-y-2">
                          <div><strong>Date:</strong> {format(new Date(selectedEvaluation.phase1_metadata_extraction.output.date), 'MMM dd, yyyy')}</div>
                          <div><strong>Type:</strong> {selectedEvaluation.phase1_metadata_extraction.output.type}</div>
                          <div><strong>Primary Project:</strong> {selectedEvaluation.phase1_metadata_extraction.output.primary_project}</div>
                          <div><strong>All Projects:</strong> {selectedEvaluation.phase1_metadata_extraction.output.projects.join(', ')}</div>
                          <div><strong>Assignees:</strong> {selectedEvaluation.phase1_metadata_extraction.output.assignees.join(', ') || 'None'}</div>
                        </div>
                        {selectedEvaluation.phase1_metadata_extraction.output.ai_response && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">AI Response:</p>
                            <div className="bg-green-50 rounded p-3 text-xs max-h-48 overflow-y-auto font-mono whitespace-pre-wrap border border-green-200">
                              {selectedEvaluation.phase1_metadata_extraction.output.ai_response}
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          Processing Time: {formatTime(selectedEvaluation.phase1_metadata_extraction.processing_time_ms)}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Phase 2: Transcript Segmentation */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Code className="h-4 w-4 text-purple-500" />
                    Phase 2: Transcript Segmentation
                  </h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="phase2-input">
                      <AccordionTrigger>Input: Projects to Segment</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-50 rounded p-3 text-sm">
                          <p><strong>Projects Count:</strong> {selectedEvaluation.phase2_transcript_segmentation.input.projects_count}</p>
                          <p className="mt-2"><strong>Projects:</strong> {selectedEvaluation.phase2_transcript_segmentation.input.projects.join(', ')}</p>
                        </div>
                        {selectedEvaluation.phase2_transcript_segmentation.input.ai_prompt && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">AI Prompt:</p>
                            <div className="bg-blue-50 rounded p-3 text-xs max-h-48 overflow-y-auto font-mono whitespace-pre-wrap border border-blue-200">
                              {selectedEvaluation.phase2_transcript_segmentation.input.ai_prompt}
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="phase2-output">
                      <AccordionTrigger>Output: Segmented Sections by Project</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          {selectedEvaluation.phase2_transcript_segmentation.output.sections_by_project.map((section, idx) => (
                            <div key={idx} className="border rounded p-3 bg-gray-50">
                              <h4 className="font-medium mb-2">{section.project_name}</h4>
                              <p className="text-xs text-muted-foreground mb-2">
                                {section.sections_count} section(s), {section.total_chars.toLocaleString()} characters
                              </p>
                              <Accordion type="single" collapsible>
                                <AccordionItem value={`sections-${idx}`}>
                                  <AccordionTrigger className="text-xs">View {section.sections_count} Section(s)</AccordionTrigger>
                                  <AccordionContent>
                                    <div className="space-y-2">
                                      {section.sections.map((sec, secIdx) => (
                                        <div key={secIdx} className="bg-white rounded p-2 border border-l-4 border-l-blue-500 text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                                          {sec}
                                        </div>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                              {section.ai_response && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">AI Response:</p>
                                  <div className="bg-green-50 rounded p-2 text-xs max-h-32 overflow-y-auto font-mono whitespace-pre-wrap border border-green-200">
                                    {section.ai_response}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-3">
                          Processing Time: {formatTime(selectedEvaluation.phase2_transcript_segmentation.processing_time_ms)}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                {/* Phase 3: Per-Project Processing */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Database className="h-4 w-4 text-indigo-500" />
                    Phase 3: Per-Project Processing
                  </h3>
                  <div className="space-y-4">
                    {selectedEvaluation.phase3_per_project_processing.map((project, idx) => (
                      <div key={idx} className="border rounded p-4 bg-gray-50">
                        <h4 className="font-medium mb-3 text-lg">{project.project_name}</h4>
                        
                        {/* Transcript Storage */}
                        <Accordion type="single" collapsible className="mb-3">
                          <AccordionItem value={`transcript-${idx}`}>
                            <AccordionTrigger className="text-sm">
                              Transcript Storage: {project.transcript_storage.chunks_stored} chunks ({formatTime(project.transcript_storage.processing_time_ms)})
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2">
                                {project.transcript_storage.chunks.map((chunk, chunkIdx) => (
                                  <div key={chunkIdx} className="bg-white rounded p-2 border text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                                    <p className="text-xs text-muted-foreground mb-1">Chunk #{chunk.chunk_index} ({chunk.char_count} chars)</p>
                                    {chunk.content}
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        {/* Context Retrieval */}
                        <Accordion type="single" collapsible className="mb-3">
                          <AccordionItem value={`context-${idx}`}>
                            <AccordionTrigger className="text-sm">
                              Context Retrieval: {project.context_retrieval.context_items_retrieved} items ({formatTime(project.context_retrieval.processing_time_ms)})
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2">
                                {project.context_retrieval.context_items.map((item, itemIdx) => (
                                  <div key={itemIdx} className="bg-white rounded p-2 border border-l-4 border-l-purple-500 text-xs">
                                    <p className="text-xs text-muted-foreground mb-1">
                                      Score: {item.score?.toFixed(3) || 'N/A'} | Type: {item.metadata?.type || 'unknown'}
                                    </p>
                                    <p className="font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">{item.text}</p>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        {/* Task Generation */}
                        <Accordion type="single" collapsible>
                          <AccordionItem value={`tasks-${idx}`}>
                            <AccordionTrigger className="text-sm">
                              Task Generation: {project.task_generation.output.tasks_generated} tasks ({formatTime(project.task_generation.processing_time_ms)})
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3">
                                <div className="mb-3">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">Input:</p>
                                  <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
                                    <p>Transcript Sections: {project.task_generation.input.transcript_sections_count}</p>
                                    <p>Context Items: {project.task_generation.input.context_items_count}</p>
                                  </div>
                                  {project.task_generation.input.ai_prompt && (
                                    <div className="mt-2">
                                      <p className="text-xs font-medium text-muted-foreground mb-1">AI Prompt:</p>
                                      <div className="bg-blue-50 rounded p-2 text-xs max-h-48 overflow-y-auto font-mono whitespace-pre-wrap border border-blue-200">
                                        {project.task_generation.input.ai_prompt}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-2">Output: Generated Tasks</p>
                                  <div className="space-y-3">
                                    {project.task_generation.output.tasks.map((task, taskIdx) => (
                                      <div key={taskIdx} className="bg-white rounded p-3 border border-l-4 border-l-green-500">
                                        <h5 className="font-semibold text-sm mb-1">{task.title}</h5>
                                        <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                                        <div className="text-xs space-y-1">
                                          <p><strong>Assignees:</strong> {task.assignees.join(', ') || 'Unassigned'}</p>
                                          {task.deadline && <p><strong>Deadline:</strong> {format(new Date(task.deadline), 'MMM dd, yyyy')}</p>}
                                          {task.actionable_items.length > 0 && (
                                            <div>
                                              <p className="font-medium mb-1">Actionable Items:</p>
                                              <ul className="list-disc list-inside space-y-0.5 ml-2">
                                                {task.actionable_items.map((item, itemIdx) => (
                                                  <li key={itemIdx}>{item}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          {task.transcript_snippets.length > 0 && (
                                            <div className="mt-2">
                                              <p className="font-medium mb-1">Transcript Snippets:</p>
                                              <div className="space-y-1">
                                                {task.transcript_snippets.map((snippet, snippetIdx) => (
                                                  <div key={snippetIdx} className="bg-gray-50 rounded p-1.5 text-xs font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
                                                    {snippet}
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        {task.ai_response && (
                                          <div className="mt-2 pt-2 border-t">
                                            <p className="text-xs font-medium text-muted-foreground mb-1">AI Response:</p>
                                            <div className="bg-green-50 rounded p-2 text-xs max-h-32 overflow-y-auto font-mono whitespace-pre-wrap border border-green-200">
                                              {task.ai_response}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phase 4: Task Storage & ClickUp */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    Phase 4: Task Storage & ClickUp
                  </h3>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="phase4-mongodb">
                      <AccordionTrigger>MongoDB: {selectedEvaluation.phase4_task_storage_clickup.tasks_stored_mongodb} tasks stored</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {selectedEvaluation.phase4_task_storage_clickup.tasks_mongodb.map((task, idx) => (
                            <div key={idx} className="bg-gray-50 rounded p-3 border">
                              <h5 className="font-semibold text-sm mb-1">{task.title}</h5>
                              <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                              <div className="text-xs space-y-1">
                                <p><strong>Project:</strong> {task.project_name}</p>
                                <p><strong>Assignees:</strong> {task.assignees.join(', ') || 'Unassigned'}</p>
                                {task.deadline && <p><strong>Deadline:</strong> {format(new Date(task.deadline), 'MMM dd, yyyy')}</p>}
                                {task.actionable_items.length > 0 && (
                                  <div>
                                    <p className="font-medium">Actionable Items:</p>
                                    <ul className="list-disc list-inside ml-2">
                                      {task.actionable_items.map((item, itemIdx) => (
                                        <li key={itemIdx}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="phase4-clickup">
                      <AccordionTrigger className="text-green-600">
                        ClickUp: {selectedEvaluation.phase4_task_storage_clickup.tasks_created_clickup} tasks created
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {selectedEvaluation.phase4_task_storage_clickup.tasks_clickup.map((task, idx) => (
                            <div key={idx} className="bg-green-50 rounded p-3 border border-green-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-semibold text-sm mb-1">{task.title}</h5>
                                  <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                                  <div className="text-xs space-y-1">
                                    <p><strong>Project:</strong> {task.project_name}</p>
                                    <p><strong>Assignees:</strong> {task.assignees.join(', ') || 'Unassigned'}</p>
                                  </div>
                                </div>
                                {task.task_url && (
                                  <a
                                    href={task.task_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-green-600 hover:text-green-700"
                                  >
                                    <ExternalLink className="h-4 w-4 text-blue-500" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    {selectedEvaluation.phase4_task_storage_clickup.tasks_failed.length > 0 && (
                      <AccordionItem value="phase4-failed">
                        <AccordionTrigger className="text-red-600">
                          Failed: {selectedEvaluation.phase4_task_storage_clickup.tasks_failed_clickup} tasks
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {selectedEvaluation.phase4_task_storage_clickup.tasks_failed.map((task, idx) => (
                              <div key={idx} className="bg-red-50 rounded p-3 border border-red-200">
                                <h5 className="font-semibold text-sm mb-1">{task.title}</h5>
                                <p className="text-xs text-muted-foreground"><strong>Project:</strong> {task.project_name}</p>
                                {task.error && <p className="text-xs text-red-600 mt-1">{task.error}</p>}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                  <div className="text-xs text-muted-foreground mt-3">
                    Processing Time: {formatTime(selectedEvaluation.phase4_task_storage_clickup.processing_time_ms)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
