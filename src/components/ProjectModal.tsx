import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2 } from 'lucide-react';
import { useGetProjectsQuery } from '@/store/api/projectsApi';

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectSelected: (project: { name: string | null; mode: 'ai' | 'manual' }) => void;
  currentSelection?: { name: string | null; mode: 'ai' | 'manual' } | null;
}

export function ProjectModal({ 
  open, 
  onOpenChange, 
  onProjectSelected,
  currentSelection 
}: ProjectModalProps) {
  const [projectMode, setProjectMode] = useState<'ai' | 'manual'>(
    currentSelection?.mode || 'ai'
  );
  const [selectedProjectName, setSelectedProjectName] = useState<string | null>(
    currentSelection?.mode === 'manual' ? currentSelection.name : null
  );
  
  const { data: projects = [], isLoading: loadingProjects } = useGetProjectsQuery();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setProjectMode(currentSelection?.mode || 'ai');
      setSelectedProjectName(
        currentSelection?.mode === 'manual' ? currentSelection.name : null
      );
    }
  }, [open, currentSelection]);

  const handleConfirm = () => {
    if (projectMode === 'manual' && !selectedProjectName) {
      return; // Don't allow confirmation without project selection
    }
    
    onProjectSelected({
      name: projectMode === 'manual' ? selectedProjectName : null,
      mode: projectMode,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Choose Project</DialogTitle>
          <DialogDescription>
            Select a project manually or let AI identify projects from the transcript
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <RadioGroup
            value={projectMode}
            onValueChange={(value) => {
              setProjectMode(value as 'ai' | 'manual');
              if (value === 'ai') {
                setSelectedProjectName(null);
              }
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ai" id="ai-mode" />
              <Label htmlFor="ai-mode" className="cursor-pointer flex-1">
                <div>
                  <div className="font-medium">Let AI find out</div>
                  <div className="text-sm text-muted-foreground">
                    AI will automatically identify projects from the transcript
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="manual-mode" />
              <Label htmlFor="manual-mode" className="cursor-pointer flex-1">
                <div>
                  <div className="font-medium">I'll choose manually</div>
                  <div className="text-sm text-muted-foreground">
                    Select a specific project from the list
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {projectMode === 'manual' && (
            <div className="mt-4 p-4 border rounded-lg bg-background">
              {loadingProjects ? (
                <div className="text-sm text-muted-foreground p-4 text-center">
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                  Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 text-center border rounded-lg">
                  <p className="font-medium mb-1">No projects found</p>
                  <p className="text-xs">Please create a project first in Settings or Knowledge Base.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="project-select">Select Project</Label>
                  <Select
                    value={selectedProjectName || ''}
                    onValueChange={setSelectedProjectName}
                  >
                    <SelectTrigger id="project-select">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project._id} value={project.name}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={projectMode === 'manual' && !selectedProjectName}
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
