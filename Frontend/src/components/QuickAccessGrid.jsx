import React from 'react';
import QuickAccessCard from './QuickAccessCard';

const QUICK_ACCESS_ITEMS = ['Overview', 'Analytics', 'Settings'];

const QuickAccessGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
      {QUICK_ACCESS_ITEMS.map((item) => (
        <QuickAccessCard key={item} title={item} />
      ))}
    </div>
  );
};

export default QuickAccessGrid;