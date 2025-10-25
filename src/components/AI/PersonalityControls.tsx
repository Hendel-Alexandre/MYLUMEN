import { useState, useEffect } from 'react';
import { Settings, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

export function PersonalityControls() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({
    tone: 'friendly',
    verbosity: 5,
    focus_areas: ['financial insights', 'productivity tips'],
    custom_instructions: ''
  });

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/ai/personality', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check if response is OK and is JSON
      if (!response.ok) {
        console.debug('Personality API not available:', response.status);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.debug('Personality API returned non-JSON response');
        return;
      }
      
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.debug('Failed to fetch AI settings (API not available):', error);
    }
  };

  const saveSettings = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/ai/personality', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        toast({
          title: 'Error',
          description: 'API not available',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'AI personality settings updated'
      });
      setOpen(false);
    } catch (error) {
      console.debug('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: 'API not available',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sliders className="h-4 w-4 mr-2" />
          AI Personality
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customize AI Assistant
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={settings.tone} onValueChange={(value) => setSettings({ ...settings, tone: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal & Professional</SelectItem>
                <SelectItem value="friendly">Friendly & Conversational</SelectItem>
                <SelectItem value="analytical">Analytical & Data-Focused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Response Length (Verbosity: {settings.verbosity})</Label>
            <Slider
              value={[settings.verbosity]}
              onValueChange={([value]) => setSettings({ ...settings, verbosity: value })}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Concise</span>
              <span>Detailed</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Custom Instructions (Optional)</Label>
            <Textarea
              placeholder="e.g., Focus on tax implications, use simple language, prioritize actionable advice..."
              value={settings.custom_instructions}
              onChange={(e) => setSettings({ ...settings, custom_instructions: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={saveSettings} className="flex-1">Save Settings</Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}