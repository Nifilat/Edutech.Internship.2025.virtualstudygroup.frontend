// StatsCards.jsx
import React from 'react';
import { BookOpen, Users } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const StatsCards = () => {
  const statsData = [
    { title: 'Courses', value: '4', icon: BookOpen },
    { title: 'Courses Grouping', value: '2', icon: Users },
    { title: 'Courses Grouping', value: '3', icon: Users },
    { title: 'Study Group', value: '4', icon: Users },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((card, index) => (
        <Card key={index} className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {card.value}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <card.icon className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;