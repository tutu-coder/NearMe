'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSearch({
  serviceType,
  setServiceType,
  location,
  setLocation,
}: any) {
  return (
    <section className="relative bg-secondary/30 pt-20 pb-32">
      <div className="container mx-auto px-4 text-center space-y-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold"
        >
          Find trusted local services
        </motion.h1>

        <motion.div className="max-w-xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="What service do you need?"
                className="pl-10 h-12 rounded-xl"
              />
            </div>

            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="h-12 rounded-xl"
            />

            <Button className="h-12 rounded-xl">Search</Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
