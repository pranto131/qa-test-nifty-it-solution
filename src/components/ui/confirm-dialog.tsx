import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { AlertTriangle, Trash2, LogOut } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  // Determine icon and colors based on variant and title
  const getIconAndColor = () => {
    if (variant === 'destructive') {
      return {
        icon: Trash2,
        iconColor: 'text-red-500',
        headerBg: 'bg-red-50 border-b border-red-200',
        titleColor: 'text-red-900',
      };
    }
    
    // Check title for specific actions
    const titleLower = title.toLowerCase();
    if (titleLower.includes('sign out') || titleLower.includes('logout')) {
      return {
        icon: LogOut,
        iconColor: 'text-blue-500',
        headerBg: 'bg-blue-50 border-b border-blue-200',
        titleColor: 'text-blue-900',
      };
    }
    
    if (titleLower.includes('delete')) {
      return {
        icon: Trash2,
        iconColor: 'text-red-500',
        headerBg: 'bg-red-50 border-b border-red-200',
        titleColor: 'text-red-900',
      };
    }
    
    // Default warning style
    return {
      icon: AlertTriangle,
      iconColor: 'text-orange-500',
      headerBg: 'bg-orange-50 border-b border-orange-200',
      titleColor: 'text-orange-900',
    };
  };

  const { icon: Icon, iconColor, headerBg, titleColor } = getIconAndColor();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <DialogHeader className={`${headerBg} p-6 pb-4`}>
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 ${iconColor}`}>
              <Icon className="h-6 w-6" />
            </div>
            <DialogTitle className={`${titleColor} text-left`}>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-left pt-2 text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-4">
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-gray-300 hover:bg-gray-50"
            >
              {cancelText}
            </Button>
            <Button 
              variant={variant} 
              onClick={handleConfirm}
              className={variant === 'destructive' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
