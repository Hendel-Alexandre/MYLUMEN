'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Service {
  id: number;
  name: string;
  description: string | null;
  unitPrice: string;
  currency: string;
  category: string | null;
  duration: number | null;
  active: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const SERVICE_CATEGORIES = [
  'Consulting',
  'Design',
  'Development',
  'Marketing',
  'Writing',
  'Photography',
  'Video Production',
  'Training',
  'Support',
  'Other',
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [newService, setNewService] = useState({
    name: '',
    description: '',
    unitPrice: '',
    currency: 'USD',
    category: '',
    duration: '',
    active: true,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    let filtered = services;

    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((service) => service.category === categoryFilter);
    }

    setFilteredServices(filtered);
  }, [services, searchQuery, categoryFilter]);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/lumenr/services', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      setServices(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const createService = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/lumenr/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newService,
          unitPrice: parseFloat(newService.unitPrice),
          duration: newService.duration ? parseInt(newService.duration) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create service');
      }

      toast.success('Service created successfully');
      setIsCreateDialogOpen(false);
      setNewService({
        name: '',
        description: '',
        unitPrice: '',
        currency: 'USD',
        category: '',
        duration: '',
        active: true,
      });
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create service');
    }
  };

  const updateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/lumenr/services?id=${editingService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingService),
      });

      if (!response.ok) {
        throw new Error('Failed to update service');
      }

      toast.success('Service updated successfully');
      setIsEditDialogOpen(false);
      setEditingService(null);
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update service');
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/lumenr/services?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      toast.success('Service deleted successfully');
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete service');
    }
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const activeServices = services.filter((s) => s.active).length;
  const avgPrice =
    services.length > 0
      ? services.reduce((sum, s) => sum + parseFloat(s.unitPrice), 0) / services.length
      : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Services</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your service catalog
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">{activeServices} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgPrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per hour/unit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(services.map((s) => s.category).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {SERVICE_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No services found</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      {service.category && (
                        <Badge variant="outline" className="mt-2">
                          {service.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold">
                        ${parseFloat(service.unitPrice).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">{service.currency}</p>
                    </div>
                    {service.duration && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{service.duration} min</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={service.active ? 'default' : 'secondary'}>
                      {service.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Service</DialogTitle>
          </DialogHeader>
          <form onSubmit={createService} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newService.description}
                  onChange={(e) =>
                    setNewService({ ...newService, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Hourly Rate *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newService.unitPrice}
                  onChange={(e) =>
                    setNewService({ ...newService, unitPrice: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newService.category}
                  onValueChange={(value) => setNewService({ ...newService, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={newService.duration}
                  onChange={(e) =>
                    setNewService({ ...newService, duration: e.target.value })
                  }
                  placeholder="e.g., 60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={newService.currency}
                  onValueChange={(value) => setNewService({ ...newService, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 col-span-2">
                <Switch
                  checked={newService.active}
                  onCheckedChange={(checked) =>
                    setNewService({ ...newService, active: checked })
                  }
                />
                <Label>Active (visible to customers)</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Service</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {editingService && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={updateService} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-name">Service Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingService.name}
                    onChange={(e) =>
                      setEditingService({ ...editingService, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingService.description || ''}
                    onChange={(e) =>
                      setEditingService({ ...editingService, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unitPrice">Hourly Rate *</Label>
                  <Input
                    id="edit-unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingService.unitPrice}
                    onChange={(e) =>
                      setEditingService({ ...editingService, unitPrice: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingService.category || ''}
                    onValueChange={(value) =>
                      setEditingService({ ...editingService, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="0"
                    value={editingService.duration || ''}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        duration: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="e.g., 60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-currency">Currency</Label>
                  <Select
                    value={editingService.currency}
                    onValueChange={(value) =>
                      setEditingService({ ...editingService, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                  <Switch
                    checked={editingService.active}
                    onCheckedChange={(checked) =>
                      setEditingService({ ...editingService, active: checked })
                    }
                  />
                  <Label>Active (visible to customers)</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Service</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
