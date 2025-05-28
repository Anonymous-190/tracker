import React, { useState, useEffect } from 'react';
import { Plus, X, Building2, Globe, User, Briefcase } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";

interface AddCompanyFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

const AddCompanyForm: React.FC<AddCompanyFormProps> = ({ onCancel, onSuccess }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    role: '',
    linkedin: '',
    status: 'applied',
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
      else console.error("User not logged in:", error);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !formData.name.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("companies").insert({
      user_id: userId,
      name: formData.name,
      website: formData.website,
      role: formData.role,
      linkedin: formData.linkedin,
      status: formData.status,
    });

    setLoading(false);

    if (error) {
      console.error("Failed to add company:", error);
    } else {
      setFormData({ name: '', website: '', role: '', linkedin: '', status: 'applied' });
      onSuccess?.();
      onCancel();
    }
  };

  return (
    <div className="glass rounded-3xl p-8 border border-border/50 backdrop-blur-xl shadow-glow animate-scale-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Add New Company</h3>
            <p className="text-muted-foreground">Track your next opportunity</p>
          </div>
        </div>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Building2 className="w-4 h-4 text-primary" />
            Company Name <span className="text-destructive">*</span>
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-background/50 border-0 ring-1 ring-border focus:ring-2 focus:ring-primary/20 rounded-xl h-12 text-lg"
            placeholder="Enter company name"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Briefcase className="w-4 h-4 text-primary" />
            Role/Position
          </label>
          <Input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="Software Engineer, Product Manager, etc."
            className="bg-background/50 border-0 ring-1 ring-border focus:ring-2 focus:ring-primary/20 rounded-xl h-12"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Globe className="w-4 h-4 text-primary" />
            Website
          </label>
          <Input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://company.com"
            className="bg-background/50 border-0 ring-1 ring-border focus:ring-2 focus:ring-primary/20 rounded-xl h-12"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <User className="w-4 h-4 text-primary" />
            LinkedIn
          </label>
          <Input
            type="text"
            value={formData.linkedin}
            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            placeholder="LinkedIn URL or username"
            className="bg-background/50 border-0 ring-1 ring-border focus:ring-2 focus:ring-primary/20 rounded-xl h-12"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Application Status</Label>
          <RadioGroup
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
            className="flex gap-4 flex-wrap"
          >
            {['applied', 'coding round', 'interview', 'offer'].map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <RadioGroupItem value={status} id={status} />
                <Label htmlFor={status} className="capitalize">{status}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex gap-4 pt-6">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 btn-modern gradient-primary text-white shadow-glow hover:shadow-glow-lg h-12 text-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            {loading ? "Adding..." : "Add Company"}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="px-8 h-12 border-border/50 hover:border-border"
          >
            Cancel
          </Button>
        </div>
      </form>

      <div className="absolute bottom-0 left-0 right-0 h-1 gradient-primary rounded-b-3xl opacity-50" />
    </div>
  );
};

export default AddCompanyForm;
