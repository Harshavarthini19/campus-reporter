import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Shield, Eye, Mail, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    statusUpdates: true,
    weeklyDigest: false,
    anonymousByDefault: false,
    showProfilePublicly: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="page-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your notification and privacy preferences</p>
        </div>

        {/* Notification Settings */}
        <div className="card-elevated mb-6">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Notifications</h2>
                <p className="text-sm text-muted-foreground">Control how you receive updates</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Browser push notifications</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={() => handleToggle('pushNotifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Status Updates</p>
                <p className="text-sm text-muted-foreground">Get notified when issue status changes</p>
              </div>
              <Switch
                checked={settings.statusUpdates}
                onCheckedChange={() => handleToggle('statusUpdates')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Weekly Digest</p>
                <p className="text-sm text-muted-foreground">Summary of campus issues weekly</p>
              </div>
              <Switch
                checked={settings.weeklyDigest}
                onCheckedChange={() => handleToggle('weeklyDigest')}
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="card-elevated mb-6">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Privacy</h2>
                <p className="text-sm text-muted-foreground">Manage your privacy settings</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Anonymous by Default</p>
                <p className="text-sm text-muted-foreground">Submit all issues anonymously</p>
              </div>
              <Switch
                checked={settings.anonymousByDefault}
                onCheckedChange={() => handleToggle('anonymousByDefault')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Show Profile Publicly</p>
                <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
              </div>
              <Switch
                checked={settings.showProfilePublicly}
                onCheckedChange={() => handleToggle('showProfilePublicly')}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="btn-primary" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
