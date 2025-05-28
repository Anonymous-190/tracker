import React, { useState } from 'react';
import {
  Edit,
  Trash2,
  ExternalLink,
  Linkedin,
  Save,
  X,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Company } from '../pages/Index';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@clerk/clerk-react';

interface CompanyCardProps {
  company: Company;
  onUpdate?: () => void;
  onDelete?: (id: string) => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onUpdate, onDelete }) => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: company.name,
    website: company.website,
    role: company.role,
    linkedin: company.linkedin,
    status: company.status || 'applied'
  });

  const handleSave = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('companies')
      .update(editData)
      .eq('id', company.id)
      .eq('user_id', user.id); // Extra protection

    if (error) {
      console.error('Update failed:', error);
    } else {
      onUpdate?.();
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', company.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete failed:', error);
    } else {
      onDelete?.(company.id);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: company.name,
      website: company.website,
      role: company.role,
      linkedin: company.linkedin,
      status: company.status || 'applied'
    });
    setIsEditing(false);
  };

  return (
    <div className="group glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300 border border-border/50 hover:border-primary/20 backdrop-blur-xl">
      {isEditing ? (
        <div className="space-y-4 animate-fade-in">
          <Input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="text-xl font-bold bg-background/50 border-0 ring-1 ring-border focus:ring-2 focus:ring-primary/20 rounded-xl"
            placeholder="Company Name"
          />
          <Input
            type="text"
            value={editData.role}
            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
            className="bg-background/50 border-0 ring-1 ring-border focus:ring-2 focus:ring-primary/20 rounded-xl"
            placeholder="Role/Position"
          />
          <Input
            type="url"
            value={editData.website}
            onChange={(e) => setEditData({ ...editData, website: e.target.value })}
            className="bg-background/50 border-0 ring-1 ring-border focus:ring-2 focus:ring-primary/20 rounded-xl"
            placeholder="Website URL"
          />
          <Input
            type="text"
            value={editData.linkedin}
            onChange={(e) => setEditData({ ...editData, linkedin: e.target.value })}
            className="bg-background/50 border-0 ring-1 ring-border focus:ring-2 focus:ring-primary/20 rounded-xl"
            placeholder="LinkedIn URL or Profile"
          />
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Status</Label>
            <RadioGroup
              value={editData.status}
              onValueChange={(value) => setEditData({ ...editData, status: value })}
              className="flex gap-4"
            >
              {["applied", "interview", "coding round", "offer"].map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <RadioGroupItem value={status} id={`status-${status}`} />
                  <Label htmlFor={`status-${status}`} className="capitalize">{status}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="btn-modern gradient-primary text-white shadow-glow hover:shadow-glow-lg" size="sm">
              <Save className="w-4 h-4 mr-1" /> Save
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm" className="border-border/50 hover:border-border">
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-foreground truncate mb-1">{company.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{company.role || 'Position not specified'}</p>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
              <Button onClick={() => setIsEditing(true)} variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg">
                <Edit className="w-4 h-4" />
              </Button>
              <Button onClick={handleDelete} variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-lg">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {(company.website || company.linkedin) && (
              <div className="flex gap-3">
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" />
                    Website
                  </a>
                )}
                {company.linkedin && (
                  <a href={company.linkedin.startsWith('http') ? company.linkedin : `https://linkedin.com/in/${company.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:underline flex items-center gap-1">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <span className="text-xs text-muted-foreground">Status</span>
              <span className="text-xs text-primary font-medium capitalize">{company.status || 'applied'}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CompanyCard;
