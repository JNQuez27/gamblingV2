'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, LifeBuoy, Globe } from 'lucide-react';

const resources = [
  {
    title: 'National Problem Gambling Helpline',
    description: '24/7 confidential support.',
    contact: '1-800-522-4700',
    icon: <Phone />,
    link: 'tel:1-800-522-4700',
  },
  {
    title: 'Gamblers Anonymous',
    description: 'Find a meeting near you.',
    contact: 'Find a Meeting',
    icon: <LifeBuoy />,
    link: 'http://www.gamblersanonymous.org/ga/',
  },
  {
    title: 'Gam-Anon',
    description: 'Support for family and friends.',
    contact: 'Find a Meeting',
    icon: <LifeBuoy />,
    link: 'https://www.gam-anon.org/',
  },
  {
    title: 'Self-Exclusion Programs',
    description: 'Voluntarily ban yourself from gambling venues.',
    contact: 'Learn More',
    icon: <Globe />,
    link: 'https://www.americangaming.org/responsible-gaming/self-exclusion/',
  },
];

export function ResourceHub() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Resource Hub</h1>
      <div className="space-y-4">
        {resources.map((resource, index) => (
          <a href={resource.link} key={index} target="_blank" rel="noopener noreferrer">
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-3">
                  {resource.icon}
                  {resource.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{resource.description}</p>
                <p className="text-sm font-semibold text-primary mt-2">{resource.contact}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
