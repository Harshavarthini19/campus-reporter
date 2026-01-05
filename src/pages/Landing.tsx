import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, MapPin, Shield, Bell, MessageSquare, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Landing: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 gradient-primary rounded-xl animate-pulse" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: MapPin,
      title: 'Location-Based Reporting',
      description: 'Pinpoint issues on an interactive campus map with GPS coordinates.',
    },
    {
      icon: Shield,
      title: 'Anonymous Reporting',
      description: 'Report sensitive issues anonymously while maintaining privacy.',
    },
    {
      icon: Bell,
      title: 'Real-Time Updates',
      description: 'Get instant notifications when your issues are addressed.',
    },
    {
      icon: MessageSquare,
      title: 'Direct Communication',
      description: 'Communicate with administrators through built-in messaging.',
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'AI-powered priority sorting and trend analysis.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Collaborative platform for campus improvement.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">CR</span>
              </div>
              <span className="font-semibold text-lg text-foreground">Campus Reporter</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button className="btn-primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
            Report Campus Issues
            <br />
            <span className="text-gradient">Quickly & Effectively</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
            A real-time platform for students and staff to report infrastructure problems,
            safety concerns, and suggestions — with complete transparency and accountability.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="btn-primary text-lg px-8 py-6">
                Start Reporting
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive solution for campus issue management, from reporting to resolution.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-interactive p-8 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Improve Your Campus?
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Join thousands of students and staff making their campus a better place.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="btn-primary text-lg px-10 py-6">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CR</span>
              </div>
              <span className="font-medium text-foreground">Campus Reporter</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Campus Reporter. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
