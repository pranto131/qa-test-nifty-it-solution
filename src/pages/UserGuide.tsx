import { useEffect, useState, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { legalApi } from '../services/api';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  FileText, 
  AlertCircle,
  Home,
  Video,
  LayoutDashboard,
  CheckSquare,
  Database,
  Settings,
  History,
  HelpCircle
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  level: number;
}

export default function UserGuide() {
  const [content, setContent] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['getting-started']));
  const [activeSection, setActiveSection] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserGuide = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await legalApi.getUserGuide();
        setContent(response.data.content);
        setLastUpdated(response.data.lastUpdated || '');
      } catch (err) {
        console.error('Error fetching user guide:', err);
        setError('Failed to load user guide. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserGuide();
  }, []);

  // Extract sections from markdown content
  const sections = useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    const sections: Section[] = [];
    
    lines.forEach((line) => {
      if (line.startsWith('## ')) {
        const title = line.replace('## ', '').trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        sections.push({ id, title, level: 2 });
      } else if (line.startsWith('### ')) {
        const title = line.replace('### ', '').trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        sections.push({ id, title, level: 3 });
      }
    });
    
    return sections;
  }, [content]);

  // Group sections by main sections (level 2)
  const groupedSections = useMemo(() => {
    const groups: { main: Section; subs: Section[] }[] = [];
    let currentMain: Section | null = null;
    let currentSubs: Section[] = [];

    sections.forEach((section) => {
      if (section.level === 2) {
        if (currentMain) {
          groups.push({ main: currentMain, subs: currentSubs });
        }
        currentMain = section;
        currentSubs = [];
      } else if (section.level === 3 && currentMain) {
        currentSubs.push(section);
      }
    });

    if (currentMain) {
      groups.push({ main: currentMain, subs: currentSubs });
    }

    return groups;
  }, [sections]);

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery) return groupedSections;
    const query = searchQuery.toLowerCase();
    return groupedSections.filter(
      (group) =>
        group.main.title.toLowerCase().includes(query) ||
        group.subs.some((sub) => sub.title.toLowerCase().includes(query))
    );
  }, [groupedSections, searchQuery]);

  // Intersection Observer to track active section
  useEffect(() => {
    if (!content || sections.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all section headings
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [content, sections]);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    
    // Small delay to ensure content is rendered
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 100; // Offset for sticky header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 100);
  };

  const toggleSection = (sectionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto py-20 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="relative">
                <BookOpen className="h-16 w-16 text-primary mx-auto mb-6 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary/20 border-t-primary"></div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground mt-4">Loading user guide...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto py-20 px-4">
          <div className="bg-destructive/10 border-2 border-destructive/20 rounded-xl p-8 text-center shadow-lg">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive font-semibold text-lg mb-2">Error</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-8">
              <div className="bg-card border rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-lg">User Guide</h2>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Navigation Menu */}
                <nav className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {filteredSections.map((group) => {
                    const isExpanded = expandedSections.has(group.main.id);
                    const hasSubs = group.subs.length > 0;
                    const isActive = activeSection === group.main.id;

                    return (
                      <div key={group.main.id}>
                        <div className="flex items-center">
                          <button
                            onClick={() => handleSectionClick(group.main.id)}
                            className={`flex-1 text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted text-foreground'
                            }`}
                          >
                            {group.main.title}
                          </button>
                          {hasSubs && (
                            <button
                              onClick={(e) => toggleSection(group.main.id, e)}
                              className="p-1 hover:bg-muted rounded transition-colors"
                            >
                              <ChevronRight
                                className={`h-4 w-4 transition-transform ${
                                  isExpanded ? 'transform rotate-90' : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>
                        {hasSubs && isExpanded && (
                          <div className="ml-4 mt-1 space-y-1">
                            {group.subs.map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => handleSectionClick(sub.id)}
                                className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                  activeSection === sub.id
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'hover:bg-muted text-muted-foreground'
                                }`}
                              >
                                {sub.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0" ref={contentRef}>
            <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-8 md:p-12 shadow-xl">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {lastUpdated && (
                  <p className="text-sm text-muted-foreground mb-6">
                    Last Updated: {lastUpdated}
                  </p>
                )}
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => {
                      const childrenArray = Array.isArray(props.children) ? props.children : [props.children];
                      const title = (childrenArray[0]?.toString() || '').trim();
                      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return (
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-primary/20 scroll-mt-24">
                          <BookOpen className="h-8 w-8 text-primary flex-shrink-0" />
                          <h1 id={id} className="text-4xl font-bold tracking-tight m-0" {...props} />
                        </div>
                      );
                    },
                    h2: ({ node, ...props }) => {
                      const childrenArray = Array.isArray(props.children) ? props.children : [props.children];
                      const title = (childrenArray[0]?.toString() || '').trim();
                      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      const icons: { [key: string]: typeof Home } = {
                        'Getting Started': Home,
                        'Connecting Your Zoom Account': Video,
                        'Understanding the Dashboard': LayoutDashboard,
                        'Analyzing Meetings': CheckSquare,
                        'Managing Tasks': CheckSquare,
                        'Working with Knowledge Base': Database,
                        'Configuring Settings': Settings,
                        'Viewing History and Analytics': History,
                        'Troubleshooting Common Issues': AlertCircle,
                        'Best Practices and Tips': CheckCircle2,
                        'Removing the App': AlertCircle,
                        'Getting Help and Support': HelpCircle,
                      };
                      const Icon = icons[title] || FileText;
                      
                      return (
                        <div
                          id={id}
                          className="flex items-center gap-3 mt-12 mb-6 pb-3 border-b border-muted scroll-mt-24"
                        >
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <h2 className="text-2xl font-semibold m-0" {...props} />
                        </div>
                      );
                    },
                    h3: ({ node, ...props }) => {
                      const childrenArray = Array.isArray(props.children) ? props.children : [props.children];
                      const title = (childrenArray[0]?.toString() || '').trim();
                      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return (
                        <h3
                          id={id}
                          className="text-xl font-semibold mt-8 mb-4 text-primary/90 scroll-mt-24"
                          {...props}
                        />
                      );
                    },
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
                    img: ({ node, ...props }) => {
                      const src = props.src || '';
                      const alt = props.alt || '';
                      return (
                        <div className="my-8">
                          <img
                            src={`/${src}`}
                            alt={alt}
                            className="w-full rounded-lg border shadow-lg"
                            {...props}
                          />
                          {alt && (
                            <p className="text-sm text-muted-foreground mt-2 text-center italic">
                              {alt}
                            </p>
                          )}
                        </div>
                      );
                    },
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
          </main>
        </div>
      </div>
    </div>
  );
}
