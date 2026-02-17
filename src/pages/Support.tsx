import { Link } from 'react-router-dom';
import { HelpCircle, Mail, Phone, Clock, MapPin, BookOpen, CheckCircle2 } from 'lucide-react';

export default function Support() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-10 pb-20">
        <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-8 md:p-12 shadow-xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-primary/20">
            <HelpCircle className="h-8 w-8 text-primary flex-shrink-0" />
            <h1 className="text-4xl font-bold tracking-tight m-0">Support</h1>
          </div>

          {/* Support Information Cards */}
          <div className="space-y-6">
            {/* Email Card */}
            <div className="bg-muted/50 border rounded-xl p-6 hover:bg-muted/70 transition-colors">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">Support Email</h2>
                  <a
                    href="mailto:developers@niftyitsolution.com"
                    className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors text-lg"
                  >
                    developers@niftyitsolution.com
                  </a>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Send us an email and we'll get back to you as soon as possible.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Hours Card */}
            <div className="bg-muted/50 border rounded-xl p-6 hover:bg-muted/70 transition-colors">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">Support Hours</h2>
                  <p className="text-foreground/90 mb-2">
                    <strong>Monday to Friday:</strong> 11AM to 9PM
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Our support team is available during these hours to assist you.
                  </p>
                </div>
              </div>
            </div>

            {/* Response Time Card */}
            <div className="bg-muted/50 border rounded-xl p-6 hover:bg-muted/70 transition-colors">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">Response Time</h2>
                  <p className="text-foreground/90 mb-2">
                    We typically reply within <strong>40 minutes</strong> during support hours.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    For urgent matters, please call our support phone number.
                  </p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-muted/50 border rounded-xl p-6 hover:bg-muted/70 transition-colors">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">Support Phone</h2>
                  <a
                    href="tel:+18188581499"
                    className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors text-lg"
                  >
                    +1 (818) 858-1499
                  </a>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Call us during support hours for immediate assistance.
                  </p>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-muted/50 border rounded-xl p-6 hover:bg-muted/70 transition-colors">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">Office Address</h2>
                  <p className="text-foreground/90 leading-7">
                    Unit 11A, Tropical Noor Tower<br />
                    40 Kazi Nazrul Islam Ave<br />
                    Dhaka 1215, Bangladesh
                  </p>
                </div>
              </div>
            </div>

            {/* User Guide Link Card */}
            <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-6 hover:bg-primary/15 transition-colors">
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 p-3 rounded-lg flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">Need Help Getting Started?</h2>
                  <p className="text-foreground/90 mb-4">
                    Check out our comprehensive user guide for step-by-step instructions and helpful tips.
                  </p>
                  <Link
                    to="/user-guide"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 underline underline-offset-4 transition-colors font-semibold"
                  >
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    View User Guide
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

