'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LineItem {
  id: string;
  type: 'product' | 'service';
  itemId: number | null;
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  active: boolean;
}

interface Service {
  id: number;
  name: string;
  description: string | null;
  unitPrice: string;
  active: boolean;
}

interface LineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  currency?: string;
}

export default function LineItemsEditor({ items, onChange, currency = 'USD' }: LineItemsEditorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetchProductsAndServices();
  }, []);

  const fetchProductsAndServices = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      
      const [productsRes, servicesRes] = await Promise.all([
        fetch('/api/lumenr/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/lumenr/services', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (productsRes.ok) {
        const result = await productsRes.json();
        const data = result.data || result;
        setProducts(Array.isArray(data) ? data.filter(p => p.active) : []);
      }

      if (servicesRes.ok) {
        const result = await servicesRes.json();
        const data = result.data || result;
        setServices(Array.isArray(data) ? data.filter(s => s.active) : []);
      }
    } catch (error) {
      console.error('Failed to fetch products/services:', error);
    }
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      type: 'product',
      itemId: null,
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      total: 0
    };
    onChange([...items, newItem]);
  };

  const removeLineItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id !== id) return item;

      const updated = { ...item, [field]: value };

      if (field === 'type') {
        updated.itemId = null;
        updated.name = '';
        updated.description = '';
        updated.price = 0;
        updated.total = 0;
      }

      if (field === 'itemId') {
        if (updated.type === 'product') {
          const product = products.find(p => p.id === value);
          if (product) {
            updated.name = product.name;
            updated.description = product.description || '';
            updated.price = parseFloat(product.price) || 0;
          }
        } else if (updated.type === 'service') {
          const service = services.find(s => s.id === value);
          if (service) {
            updated.name = service.name;
            updated.description = service.description || '';
            updated.price = parseFloat(service.unitPrice) || 0;
          }
        }
      }

      if (field === 'quantity' || field === 'price' || field === 'itemId') {
        updated.total = updated.quantity * updated.price;
      }

      return updated;
    });

    onChange(updatedItems);
  };

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$'
    };
    return symbols[curr] || curr;
  };

  const symbol = getCurrencySymbol(currency);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Line Items</span>
          <Button type="button" onClick={addLineItem} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-4">
            No items added yet. Click "Add Item" to get started.
          </p>
        )}

        {items.map((item, index) => (
          <div key={item.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Item {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeLineItem(item.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select
                  value={item.type}
                  onValueChange={(value) => updateLineItem(item.id, 'type', value as 'product' | 'service')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{item.type === 'product' ? 'Product' : 'Service'}</Label>
                <Select
                  value={item.itemId?.toString() || ''}
                  onValueChange={(value) => updateLineItem(item.id, 'itemId', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${item.type}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {item.type === 'product' ? (
                      products.length > 0 ? (
                        products.map(product => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} ({symbol}{Number(product.price).toFixed(2)})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No active products</SelectItem>
                      )
                    ) : (
                      services.length > 0 ? (
                        services.map(service => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name} ({symbol}{Number(service.unitPrice).toFixed(2)})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No active services</SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {item.name && (
              <div>
                <Label>Name</Label>
                <Input
                  value={item.name}
                  onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                />
              </div>
            )}

            {item.description && (
              <div>
                <Label>Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                />
              </div>

              <div>
                <Label>Price ({symbol})</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => updateLineItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label>Total ({symbol})</Label>
                <Input
                  type="text"
                  value={item.total.toFixed(2)}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
