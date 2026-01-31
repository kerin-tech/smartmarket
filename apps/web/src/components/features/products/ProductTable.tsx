'use client';

import { Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getCategoryConfig } from '@/types/product.types';
import type { Product } from '@/types/product.types';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  searchQuery?: string;
}

export function ProductTable({ products, onEdit, onDelete, searchQuery }: ProductTableProps) {
  
  const highlightText = (text: string, query: string) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-warning-200 text-warning-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[40%]">Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const config = getCategoryConfig(product.category);
            const Icon = config.icon;

            return (
              <TableRow key={product.id} className="group transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                      <Icon className="h-5 w-5 text-primary-600" strokeWidth={2} />
                    </div>
                    <span className="font-medium text-foreground">
                      {highlightText(product.name, searchQuery || '')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                    {config.label}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.brand ? highlightText(product.brand, searchQuery || '') : (
                    <span className="text-muted-foreground/30">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(product)}
                      className="h-8 w-8 p-0 hover:bg-primary-50 hover:text-primary-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDelete(product)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}