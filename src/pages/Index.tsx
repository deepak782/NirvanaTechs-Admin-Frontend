import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            IT Services CRM
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Manage your leads, track requirements, and create professional quotations with ease
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/login')}
            className="min-w-[200px]"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Lead Management</h3>
            <p className="text-muted-foreground">
              Track client requirements, follow-ups, and budgets in one place
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Smart Quotations</h3>
            <p className="text-muted-foreground">
              Create professional quotations linked to client requirements
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Unified Client View</h3>
            <p className="text-muted-foreground">
              Track multiple requirements per client using mobile as identifier
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
