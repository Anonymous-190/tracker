import React, { useState, useEffect } from 'react';
import {
  Plus, Briefcase, Moon, Sun, Search, Grid3X3, List
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ui/theme-provider";
import CompanyCard from '../components/CompanyCard';
import AddCompanyForm from '../components/AddCompanyForm';
import { supabase } from '../lib/supabaseClient';

export interface Company {
  id: string;
  name: string;
  website: string;
  role: string;
  linkedin: string;
  status: string;
}

const Index = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession();
      if (error) {
        console.error("Error processing login redirect:", error.message);
      }
    };

    const getSessionAndStoreUser = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;

      if (user) {
        setUserId(user.id);

        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email;

        const { error } = await supabase
          .from("users")
          .upsert(
            {
              id: user.id,
              full_name: fullName,
              email: user.email
            },
            { onConflict: "id" }
          );

        if (error) {
          console.error("Error storing user:", error.message);
        }
      }

      setAuthLoaded(true);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setUserId(user?.id ?? null);
    });

    handleAuthRedirect().then(getSessionAndStoreUser);

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const fetchCompanies = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error.message);
    } else {
      setCompanies(data as Company[]);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCompanies();
    }
  }, [userId]);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const interviewCount = companies.filter(c => c.status === 'interview').length;
  const offerCount = companies.filter(c => c.status === 'offer').length;

  if (!authLoaded) return null;

  if (!userId) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Please sign in to access your job tracker</h2>
          <Button
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="btn-modern gradient-primary text-white shadow-glow h-12 px-6 rounded-xl"
          >
            Sign In with Google
          </Button>
        </div>
      </div>
    );
  }

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => supabase.auth.signOut()}
              >
                Sign Out
              </Button>
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
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Applications</h2>
          <p className="text-muted-foreground">Track and manage your job applications</p>
        </div>

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

        {/* Company List */}
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
