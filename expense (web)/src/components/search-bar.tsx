'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SearchBar({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set('search', query.trim());
      } else {
        params.delete('search');
      }
      params.set('page', '1'); // Reset to page 1 on new search
      router.push(`/entries?${params.toString()}`);
    }, 300);

    return () => clearTimeout(handler);
  }, [query, router, searchParams]);

  return (
    <div className="relative flex-1">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search transactions..."
        className="pl-9 pr-8"
      />
      {query ? (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
        >
          <X size={15} />
        </button>
      ) : null}
    </div>
  );
}
