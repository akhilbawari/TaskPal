import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Calendar, Clock, ArrowRight, List, Bell, Target, Layers, CalendarCheck } from 'lucide-react';

function FeatureCard({ icon: Icon, title, description, className = '' }) {
  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg p-2 bg-blue-100 text-blue-700">
            <Icon size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({ name, role, content, className = '' }) {
  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}>
      <CardContent className="p-6">
        <div className="mb-4">
          <p className="italic text-muted-foreground">"{content}"</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Layers,
      title: 'Nested Task Hierarchy',
      description: 'Create unlimited levels of subtasks to break down complex projects into manageable pieces.'
    },
    {
      icon: Target,
      title: 'Priority Scoring',
      description: 'Automatically calculate priority based on weight and due date to focus on what matters most.'
    },
    {
      icon: Calendar,
      title: 'Calendar View',
      description: 'Visualize your tasks on a calendar to better plan your schedule and meet deadlines.'
    },
    {
      icon: List,
      title: 'List View',
      description: 'See all your tasks in a prioritized list with nested subtasks clearly indented.'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Get reminded of upcoming deadlines with in-app notifications and Google Calendar integration.'
    },
    {
      icon: CalendarCheck,
      title: 'Google Calendar Integration',
      description: 'Sync your tasks with Google Calendar to stay on top of your schedule across all devices.'
    }
  ];

  const testimonials = [
    {
      name: 'Alex Johnson',
      role: 'Project Manager',
      content: 'TaskPal has transformed how I manage my team projects. The nested subtasks and priority scoring are game-changers.'
    },
    {
      name: 'Sarah Williams',
      role: 'Freelance Designer',
      content: 'The calendar view helps me visualize my workload and the Google Calendar integration keeps me on track with deadlines.'
    },
    {
      name: 'Michael Chen',
      role: 'Software Developer',
      content: 'Breaking down complex coding projects into subtasks makes everything more manageable. I love the clean interface!'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Manage Tasks <span className="text-blue-600">Smarter</span>, Not Harder
              </h1>
              <p className="text-xl text-slate-600">
                Break down complex projects, visualize dependencies, and never miss a deadline again with TaskPal.
              </p>
              <div className="flex gap-4 pt-4">
                <Button size="lg" onClick={() => navigate('/auth/register')}>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/auth/login')}>
                  Sign In
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-100 rounded-full z-0"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-100 rounded-full z-0"></div>
                <img 
                  src="https://ecomm-dev-public.s3.ap-south-1.amazonaws.com/uploads/new.png" 
                  alt="TaskPal Dashboard" 
                  className="rounded-xl shadow-2xl relative z-10 border border-slate-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/600x400/e2e8f0/475569?text=TaskPal+Dashboard';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features for Complex Projects</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage tasks effectively and boost your productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-slate-50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How TaskPal Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A simple yet powerful workflow to keep you organized
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Tasks & Subtasks</h3>
              <p className="text-slate-600">Break down your projects into manageable tasks and subtasks with due dates and weights.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Prioritize Automatically</h3>
              <p className="text-slate-600">Our smart algorithm calculates priority scores to help you focus on what's most important.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Stay On Track</h3>
              <p className="text-slate-600">View your tasks in calendar or list view and get notifications for upcoming deadlines.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Join thousands of professionals who've transformed their productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Task Management?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who use TaskPal to stay organized and productive.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => navigate('/auth/register')}
            className="bg-white text-blue-600 hover:bg-slate-100"
          >
            Get Started For Free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <CheckCircle size={20} className="text-blue-500" />
              <span className="text-white font-bold">TaskPal</span>
            </div>
            <div className="text-sm">
              © {new Date().getFullYear()} TaskPal. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;