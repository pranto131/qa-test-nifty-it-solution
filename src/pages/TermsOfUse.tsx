import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { legalApi } from '../services/api';
import { FileText, Scale, Shield, CheckCircle2, AlertTriangle, Users, Lock, FileCheck, Gavel, Mail } from 'lucide-react';

export default function TermsOfUse() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTermsOfUse = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await legalApi.getTermsOfUse();
        setContent(response.data.content);
      } catch (err) {
        console.error('Error fetching terms of use:', err);
        setError('Failed to load terms of use. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTermsOfUse();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-6xl mx-auto py-20 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="relative">
                <Scale className="h-16 w-16 text-primary mx-auto mb-6 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary/20 border-t-primary"></div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground mt-4">Loading terms of use...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-6xl mx-auto py-20 px-4">
          <div className="bg-destructive/10 border-2 border-destructive/20 rounded-xl p-8 text-center shadow-lg">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-semibold text-lg mb-2">Error</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-10 pb-20">
        <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-8 md:p-12 shadow-xl">
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-primary/20">
                    <Scale className="h-8 w-8 text-primary flex-shrink-0" />
                    <h1 className="text-4xl font-bold tracking-tight m-0" {...props} />
                  </div>
                ),
                h2: ({ node, ...props }) => {
                  const icons: { [key: string]: typeof Scale } = {
                    'Acceptance': CheckCircle2,
                    'Description': FileText,
                    'Eligibility': Users,
                    'Authorization': Shield,
                    'Acceptable Use': Lock,
                    'Data Protection': Shield,
                    'Service Availability': FileCheck,
                    'Fees': FileText,
                    'Intellectual Property': FileText,
                    'Third-Party': Users,
                    'Disclaimers': AlertTriangle,
                    'Limitation': AlertTriangle,
                    'Indemnification': Shield,
                    'Term': FileCheck,
                    'Governing Law': Gavel,
                    'Changes': FileText,
                    'Contact': Mail,
                    'Zoom': CheckCircle2,
                  };
                  const childrenArray = Array.isArray(props.children) ? props.children : [props.children];
                  const text = (childrenArray[0]?.toString() || '').trim();
                  const Icon = icons[text] || FileText;
                  
                  return (
                    <div className="flex items-center gap-3 mt-12 mb-6 pb-3 border-b border-muted">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-semibold m-0" {...props} />
                    </div>
                  );
                },
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl font-semibold mt-8 mb-4 text-primary/90" {...props} />
                ),
                h4: ({ node, ...props }) => (
                  <h4 className="text-lg font-semibold mt-6 mb-3" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-6 leading-7 text-foreground/90" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-none mb-6 space-y-3 ml-0" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside mb-6 space-y-3 ml-4 marker:text-primary" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="flex items-start gap-3 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{props.children}</span>
                  </li>
                ),
                a: ({ node, ...props }) => (
                  <a className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-foreground" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono border" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-primary pl-6 italic my-6 text-muted-foreground bg-muted/50 py-4 rounded-r-lg" {...props} />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="my-12 border-t-2 border-gradient-to-r from-transparent via-primary/20 to-transparent" {...props} />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
