import React, { useState, useEffect } from 'react';
import {
Plus,
Briefcase,
Moon,
Sun,
Search,
Grid3X3,
List
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ui/theme-provider";
import CompanyCard from '../components/CompanyCard';
import AddCompanyForm from '../components/AddCompanyForm';
import { supabase } from '../lib/supabaseClient.ts';
import { useUser, UserButton } from "@clerk/clerk-react";

export interface Company {
id: string;
name: string;
website: string;
role: string;
linkedin: string;
status: string;
}

const Index = () => {
const [companies, setCompanies] = useState<Company[]>([]);
const [showForm, setShowForm] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const { theme, setTheme } = useTheme();
const { user } = useUser();

const fetchCompanies = async () => {
if (!user) return;
const { data, error } = await supabase
.from('companies')
.select('*')
.eq('user_id', user.id)
.order('created_at', { ascending: false });
if (error) {
  console.error('Error fetching companies:', error.message);
} else {
  setCompanies(data as Company[]);
}
};

useEffect(() => {
fetchCompanies();
}, [user]);

const updateCompany = async (id: string, updatedCompany: Omit<Company, 'id'>) => {
const { error } = await supabase
.from('companies')
.update(updatedCompany)
.eq('id', id)
.eq('user_id', user?.id || '');
if (error) {
  console.error('Error updating company:', error.message);
} else {
  setCompanies(companies.map(c => (c.id === id ? { ...updatedCompany, id } : c)));
}
};

const deleteCompany = async (id: string) => {
const { error } = await supabase
.from('companies')
.delete()
.eq('id', id)
.eq('user_id', user?.id || '');
if (error) {
  console.error('Error deleting company:', error.message);
} else {
  setCompanies(companies.filter(c => c.id !== id));
}
};

const filteredCompanies = companies.filter(company =>
company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
company.role.toLowerCase().includes(searchTerm.toLowerCase())
);

const interviewCount = companies.filter(c => c.status === 'interview').length;
const offerCount = companies.filter(c => c.status === 'offer').length;

return (
<div className="min-h-screen bg-background">
{/* Header */}
<header className="border-b border-border/40">
<div className="max-w-7xl mx-auto px-6 py-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
<Briefcase className="w-4 h-4 text-background" />
</div>
<h1 className="text-lg font-semibold text-foreground">JobTracker</h1>
</div>
<div className="flex items-center gap-3">
<UserButton afterSignOutUrl="/sign-in" />
<Button
variant="ghost"
size="icon"
onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
className="w-9 h-9"
>
{theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
</Button>
</div>
</div>
</div>
</header>
  {/* Main Content */}
  <main className="max-w-7xl mx-auto px-6 py-12">
    {/* Page Title */}
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-foreground mb-2">Applications</h2>
      <p className="text-muted-foreground">Track and manage your job applications</p>
    </div>

    {/* Controls */}
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search companies or roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 border-border/60 focus:border-foreground/20"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center border border-border/60 rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-7 px-2"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-7 px-2"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={() => setShowForm(true)}
          className="h-10 px-4 bg-foreground text-background hover:bg-foreground/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>
    </div>

    {/* Form Modal */}
    {showForm && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <AddCompanyForm
            onCancel={() => setShowForm(false)}
            onSuccess={fetchCompanies}
          />
        </div>
      </div>
    )}

    {/* Companies Grid/List */}
    {filteredCompanies.length > 0 ? (
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
          : 'space-y-3'
      }>
        {filteredCompanies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            onUpdate={fetchCompanies}
            onDelete={fetchCompanies}
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
          <Briefcase className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          {searchTerm ? 'No matches found' : 'No applications yet'}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          {searchTerm
            ? `No companies match "${searchTerm}". Try a different search term.`
            : 'Add your first company to start tracking applications'}
        </p>
        {!searchTerm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        )}
      </div>
    )}

    {/* Stats */}
    {companies.length > 0 && (
      <div className="mt-12 grid grid-cols-3 gap-6">
        <div className="text-center p-6 border border-border/40 rounded-lg">
          <div className="text-2xl font-semibold text-foreground mb-1">{companies.length}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
        <div className="text-center p-6 border border-border/40 rounded-lg">
          <div className="text-2xl font-semibold text-foreground mb-1">{interviewCount}</div>
          <div className="text-sm text-muted-foreground">Interviews</div>
        </div>
        <div className="text-center p-6 border border-border/40 rounded-lg">
          <div className="text-2xl font-semibold text-foreground mb-1">{offerCount}</div>
          <div className="text-sm text-muted-foreground">Offers</div>
        </div>
      </div>
    )}
  </main>
</div>
);
};

export default Index;