'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ToolbarProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryClick: (category: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ categories, activeCategory, onCategoryClick }) => {
  return (
    <div className="flex justify-center space-x-4 p-4 bg-gray-100">
      {categories.map((category) => (
        <Button
          key={category}
          onClick={() => onCategoryClick(category)}
          variant={activeCategory === category ? 'default' : 'outline'}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default Toolbar;
