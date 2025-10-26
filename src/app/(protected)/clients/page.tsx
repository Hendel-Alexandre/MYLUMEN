'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Users, MoreHorizontal, Edit, Trash2, Mail, Phone, 
  Building2, FileText, Receipt, FileSignature, Globe, Upload, 
  Download, FileSpreadsheet, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ClientTimeline } from '@/components/Dashboard/ClientTimeline';
import { Switch } from '@/components/ui/switch';
import { calculateTaxRate, getTaxDescription } from '@/lib/utils/tax-calculator';
import { generateClientTemplate, parseClientExcel } from '@/lib/utils/excel-import';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  taxId: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  taxRate: string | null;
  autoCalculateTax: boolean | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland',
  'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland',
  'Portugal', 'Greece', 'Poland', 'Czech Republic', 'Japan', 'China',
  'India', 'Brazil', 'Mexico', 'Argentina', 'South Africa', 'Other'
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    taxId: '',
    address: '',
    city: '',
    province: '',
    country: '',
    taxRate: '',
    autoCalculateTax: false
  });

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/lumenr/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch clients');
      
      const result = await response.json();
      const data = result.success ? result.data : result;
      setClients(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/lumenr/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newClient)
      });

      if (!response.ok) throw new Error('Failed to create client');

      toast.success('Client created successfully');
      setNewClient({
        name: '', email: '', phone: '', company: '', taxId: '',
        address: '', city: '', province: '', country: '', taxRate: '',
        autoCalculateTax: false
      });
      setIsDialogOpen(false);
      fetchClients();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/lumenr/clients?id=${editingClient.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingClient)
      });

      if (!response.ok) throw new Error('Failed to update client');

      toast.success('Client updated successfully');
      setIsEditDialogOpen(false);
      setEditingClient(null);
      fetchClients();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteClient = async (clientId: number) => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/lumenr/clients?id=${clientId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete client');

      toast.success('Client deleted successfully');
      fetchClients();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const result = await parseClientExcel(importFile);

      if (!result.success) {
        const errorList = result.errors?.map(err => {
          const match = err.match(/^Row (\d+): (.+)$/);
          if (match) {
            return { row: parseInt(match[1]), error: match[2] };
          }
          return { row: 0, error: err };
        }) || [];
        
        setImportResult({
          success: false,
          successful: 0,
          failed: result.errors?.length || 0,
          errors: errorList,
          total: result.rowCount || 0
        });
        toast.error(`Found ${result.errors?.length || 0} validation errors in the Excel file`);
        return;
      }

      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/lumenr/clients/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clients: result.data })
      });

      const apiResult = await response.json();

      if (apiResult.success) {
        setImportResult(apiResult.data);
        toast.success(apiResult.data.message);
        fetchClients();
        if (apiResult.data.failed === 0) {
          setTimeout(() => {
            setIsImportDialogOpen(false);
            setImportFile(null);
            setImportResult(null);
          }, 2000);
        }
      } else {
        toast.error(apiResult.error || 'Import failed');
        setImportResult({ success: false, errors: [apiResult.error] });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import clients');
      setImportResult({ success: false, errors: [(error as Error).message] });
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (newClient.autoCalculateTax) {
      const calculatedRate = calculateTaxRate(newClient.country, newClient.province);
      setNewClient(prev => ({ 
        ...prev, 
        taxRate: calculatedRate !== null ? calculatedRate.toString() : ''
      }));
    }
  }, [newClient.country, newClient.province, newClient.autoCalculateTax]);

  useEffect(() => {
    if (editingClient && editingClient.autoCalculateTax) {
      const calculatedRate = calculateTaxRate(editingClient.country, editingClient.province);
      setEditingClient(prev => prev ? { 
        ...prev, 
        taxRate: calculatedRate !== null ? calculatedRate.toString() : ''
      } : null);
    }
  }, [editingClient?.country, editingClient?.province, editingClient?.autoCalculateTax]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your client relationships</p>
        </div>
        
        <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Clients from Excel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Step 1: Download Template</p>
                  <Button 
                    onClick={() => { generateClientTemplate(); toast.success('Template downloaded'); }} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Step 2: Upload File</p>
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  />
                  {importFile && <p className="text-xs text-muted-foreground">{importFile.name}</p>}
                </div>

                {importResult && (
                  <Alert variant={importResult.success ? "default" : "destructive"}>
                    <AlertDescription>
                      {importResult.success ? (
                        `Successfully imported ${importResult.successful} clients`
                      ) : (
                        `Failed: ${importResult.errors?.length || 0} errors`
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <Button onClick={handleImport} disabled={!importFile || importing} className="w-full">
                  {importing ? 'Importing...' : 'Import Clients'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <form onSubmit={createClient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={newClient.company}
                      onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newClient.address}
                      onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={newClient.city}
                      onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province/State</Label>
                    <Input
                      id="province"
                      value={newClient.province}
                      onChange={(e) => setNewClient({ ...newClient, province: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={newClient.country}
                      onValueChange={(value) => setNewClient({ ...newClient, country: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      value={newClient.taxId}
                      onChange={(e) => setNewClient({ ...newClient, taxId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newClient.autoCalculateTax}
                    onCheckedChange={(checked) => setNewClient({ ...newClient, autoCalculateTax: checked })}
                  />
                  <Label>Auto-calculate tax rate</Label>
                </div>

                {!newClient.autoCalculateTax && (
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      value={newClient.taxRate}
                      onChange={(e) => setNewClient({ ...newClient, taxRate: e.target.value })}
                    />
                  </div>
                )}

                {newClient.autoCalculateTax && newClient.taxRate && (
                  <div className="text-sm text-muted-foreground">
                    Calculated tax rate: {newClient.taxRate}%
                    {newClient.country && ` (${getTaxDescription(newClient.country, newClient.province)})`}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Client</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1 flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold truncate">
                    {client.name}
                  </CardTitle>
                  {client.company && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <Building2 className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{client.company}</span>
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setEditingClient(client);
                      setIsEditDialogOpen(true);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Client?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {client.name}. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteClient(client.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <Mail className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{client.phone}</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground pt-1">
                  Added {new Date(client.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No clients found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No clients match your search.' : 'Create your first client to get started.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Client
            </Button>
          )}
        </div>
      )}

      {editingClient && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
            </DialogHeader>
            <form onSubmit={updateClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingClient.phone || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    value={editingClient.company || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Client</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
