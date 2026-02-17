import { ThreeStepWorkflow } from '@/components/ThreeStepWorkflow';
import { ManualMeetingSelector } from '@/components/ManualMeetingSelector';

export default function Dashboard() {
  return (
    <div className="space-y-3 max-w-7xl mx-auto px-4 py-3">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-0.5">Start processing your Meeting Transcripts now.</h1>
        <p className="text-sm text-muted-foreground">Upload, choose destination, and analyze in three simple steps</p>
      </div>

      {/* Three-Step Workflow - Centered */}
      <div className="flex justify-center w-full">
        <div className="w-full max-w-5xl">
          <ThreeStepWorkflow />
        </div>
      </div>

      {/* Uploaded Files Section - Compact and Scrollable */}
      <div className="mt-3">
        <ManualMeetingSelector />
      </div>
    </div>
  );
}
