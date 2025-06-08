import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { ApiClient } from '@/lib/ApiClient';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface CustomerSearchInputProps {
  onCustomerSelect: (customer: Customer) => void;
  selectedCustomerName?: string;
  onClear: () => void;
  disabled?: boolean;
}

export function CustomerSearchInput({
  onCustomerSelect,
  selectedCustomerName,
  onClear,
  disabled = false,
}: CustomerSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await ApiClient.get<Customer[]>(`/customers/search?q=${encodeURIComponent(term)}`);
      setResults(data || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Error searching customers:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = (() => {
    let timeout: NodeJS.Timeout;
    return (term: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => handleSearch(term), 300);
    };
  })();

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      setResults([]);
    }
  }, [searchTerm]);

  if (selectedCustomerName) {
    return (
      <div className="flex items-center gap-2">
        <Input value={selectedCustomerName} disabled className="flex-1" />
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
          disabled={disabled}
          className="pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((customer) => (
            <div
              key={customer.id}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-50"
              onClick={() => {
                onCustomerSelect(customer);
                setSearchTerm('');
                setIsOpen(false);
              }}
            >
              <div className="font-medium">{customer.name}</div>
              {customer.email && <div className="text-xs text-gray-500">{customer.email}</div>}
              {customer.phone && <div className="text-xs text-gray-500">{customer.phone}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
