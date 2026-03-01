import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Upload, X, AlertTriangle, Lightbulb, Wrench, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { saveReportToFirestore } from '@/lib/firebaseService';
import { createNotification } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';

type IssueType = 'infrastructure' | 'harassment' | 'technical' | 'suggestion';
type Priority = 'low' | 'medium' | 'high';

interface FormData {
  type: IssueType | null;
  title: string;
  description: string;
  location: string;
  priority: Priority;
  isAnonymous: boolean;
  attachments: File[];
}

const ReportIssue: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    type: null,
    title: '',
    description: '',
    location: '',
    priority: 'medium',
    isAnonymous: false,
    attachments: [],
  });

  const issueTypes = [
    {
      id: 'infrastructure' as IssueType,
      icon: Wrench,
      title: 'Infrastructure',
      description: 'Broken facilities, damaged equipment, maintenance issues',
      color: 'bg-warning/10 text-warning border-warning/20',
    },
    {
      id: 'harassment' as IssueType,
      icon: Shield,
      title: 'Harassment',
      description: 'Safety concerns, inappropriate behavior, bullying',
      color: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    {
      id: 'technical' as IssueType,
      icon: AlertTriangle,
      title: 'Technical',
      description: 'WiFi issues, software problems, equipment malfunctions',
      color: 'bg-primary/10 text-primary border-primary/20',
    },
    {
      id: 'suggestion' as IssueType,
      icon: Lightbulb,
      title: 'Suggestion',
      description: 'Ideas for improvement, feature requests, feedback',
      color: 'bg-success/10 text-success border-success/20',
    },
  ];

  const locations = [
    'Main Library',
    'Science Building',
    'Engineering Building',
    'Student Center',
    'Cafeteria',
    'Sports Complex',
    'Parking Lot A',
    'Parking Lot B',
    'Administration Building',
    'Computer Lab',
    'Dormitory A',
    'Dormitory B',
    'Outdoor Campus',
    'Other',
  ];

  const handleTypeSelect = (type: IssueType) => {
    setFormData(prev => ({ ...prev, type }));
    // Auto-suggest priority based on type
    if (type === 'harassment') {
      setFormData(prev => ({ ...prev, priority: 'high' }));
    } else if (type === 'infrastructure') {
      setFormData(prev => ({ ...prev, priority: 'medium' }));
    } else {
      setFormData(prev => ({ ...prev, priority: 'low' }));
    }
    setStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files].slice(0, 5),
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!user || !formData.type) return;

    setLoading(true);

    try {
      const result = await saveReportToFirestore({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        priority: formData.priority,
        isAnonymous: formData.isAnonymous,
        attachments: formData.attachments.map(f => f.name),
      });

      if (result.success) {
        // Create notification (keeping local notification for now)
        createNotification({
          userId: user.id,
          title: 'Issue Submitted (Firebase)',
          message: `Your ${formData.type} issue "${formData.title}" has been saved to Firebase Firestore.`,
          type: 'success',
          isRead: false,
          issueId: result.id as string,
        });

        toast({
          title: 'Issue Saved to Firebase!',
          description: 'Your report is now stored in Firestore and will sync with your Excel sheet.',
        });

        navigate('/my-reports');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Firebase Error',
        description: error.message || 'Failed to submit issue to Firebase.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.type !== null;
      case 2:
        return formData.title.trim().length > 0 && formData.description.trim().length > 0;
      case 3:
        return formData.location.length > 0;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              What type of issue are you reporting?
            </h2>
            <p className="text-muted-foreground mb-6">
              Select the category that best describes your issue.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {issueTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-md ${formData.type === type.id
                    ? `${type.color} border-current`
                    : 'border-border hover:border-primary/30'
                    }`}
                >
                  <type.icon className="h-8 w-8 mb-4" />
                  <h3 className="font-semibold text-foreground mb-1">{type.title}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Describe the issue
              </h2>
              <p className="text-muted-foreground">
                Provide a clear title and detailed description.
              </p>
            </div>

            <div>
              <Label htmlFor="title" className="form-label">
                Issue Title
              </Label>
              <Input
                id="title"
                placeholder="Brief summary of the issue"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="form-input"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            <div>
              <Label htmlFor="description" className="form-label">
                Detailed Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail. Include relevant information such as when it started, who is affected, etc."
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="form-textarea min-h-[160px]"
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/2000 characters
              </p>
            </div>

            <div>
              <Label className="form-label">Priority Level</Label>
              <div className="flex gap-3 mt-2">
                {(['low', 'medium', 'high'] as Priority[]).map(priority => (
                  <button
                    key={priority}
                    onClick={() => setFormData(prev => ({ ...prev, priority }))}
                    className={`px-4 py-2 rounded-lg border capitalize transition-all ${formData.priority === priority
                      ? priority === 'high'
                        ? 'priority-high border-2'
                        : priority === 'medium'
                          ? 'priority-medium border-2'
                          : 'priority-low border-2'
                      : 'border-border hover:border-primary/30'
                      }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                AI suggested priority based on issue type. You can adjust if needed.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Where is this issue located?
              </h2>
              <p className="text-muted-foreground">
                Select or specify the campus location.
              </p>
            </div>

            <div>
              <Label className="form-label">Campus Location</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {locations.map(location => (
                  <button
                    key={location}
                    onClick={() => setFormData(prev => ({ ...prev, location }))}
                    className={`p-3 rounded-lg border text-sm text-left transition-all ${formData.location === location
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-border hover:border-primary/30'
                      }`}
                  >
                    <MapPin className="h-4 w-4 inline-block mr-1" />
                    {location}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Submit Anonymously</p>
                  <p className="text-sm text-muted-foreground">
                    Your identity will be hidden from public view
                  </p>
                </div>
                <Switch
                  checked={formData.isAnonymous}
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, isAnonymous: checked }))}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Add Evidence (Optional)
              </h2>
              <p className="text-muted-foreground">
                Upload photos or documents to support your report.
              </p>
            </div>

            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition-colors">
              <input
                type="file"
                id="file-upload"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium text-foreground">Click to upload files</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Images, PDFs, or documents (max 5 files)
                </p>
              </label>
            </div>

            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                {formData.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <span className="text-sm text-foreground truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Review Summary */}
            <div className="mt-8 p-6 rounded-xl bg-muted/30 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Review Your Report</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium text-foreground capitalize">{formData.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title:</span>
                  <span className="font-medium text-foreground">{formData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-medium text-foreground">{formData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <span className={`font-medium capitalize ${formData.priority === 'high' ? 'text-destructive' :
                    formData.priority === 'medium' ? 'text-warning' : 'text-success'
                    }`}>
                    {formData.priority}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Anonymous:</span>
                  <span className="font-medium text-foreground">{formData.isAnonymous ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Attachments:</span>
                  <span className="font-medium text-foreground">{formData.attachments.length} files</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {step > 1 ? 'Previous Step' : 'Back to Dashboard'}
        </button>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Step {step} of 4</span>
            <span className="text-sm text-muted-foreground">
              {step === 1 && 'Issue Type'}
              {step === 2 && 'Description'}
              {step === 3 && 'Location'}
              {step === 4 && 'Evidence & Review'}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="card-elevated p-8">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            {step === 1 && <div />}

            {step < 4 ? (
              <Button
                className="btn-primary"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
                <Check className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportIssue;
