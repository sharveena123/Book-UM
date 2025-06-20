import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Users, Search, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

interface Resource {
  id: string;
  name: string;
  type: string;
  location: string;
  description?: string;
  tags?: string[];
  capacity?: number;
}

const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [resourceTypes, setResourceTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const [favourites, setFavourites] = useState<string[]>([]);

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedType]);

  useEffect(() => {
    if (user) fetchFavourites();
  }, [user]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase.from('resources').select('*').order('name');
      
      if (error) {
        console.error('Supabase error fetching resources:', error);
        throw error;
        
      }
      
      console.log('Fetched resources:', data);
      setResources(data || []);
      setResourceTypes(Array.from(new Set((data || []).map((r: Resource) => r.type))));
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load resources',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }
    setFilteredResources(filtered);
  };

  const fetchFavourites = async () => {
    const { data, error } = await (supabase as any)
      .from('favourites')
      .select('resource_id')
      .eq('user_id', user.id);
    if (!error && data) {
      setFavourites(data.map((fav: { resource_id: string }) => fav.resource_id));
    }
  };

  const toggleFavourite = async (resourceId: string) => {
    if (!user) return;
    if (favourites.includes(resourceId)) {
      // Remove favourite
      await (supabase as any)
        .from('favourites')
        .delete()
        .eq('user_id', user.id)
        .eq('resource_id', resourceId);
      setFavourites(favourites.filter(id => id !== resourceId));
    } else {
      // Add favourite
      await (supabase as any)
        .from('favourites')
        .insert({ user_id: user.id, resource_id: resourceId });
      setFavourites([...favourites, resourceId]);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>Resources</span>
            </h2>
            <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
              <div>
                <label className="block font-medium mb-1">Category</label>
                <select
                  className="border rounded px-3 py-2 min-w-[180px]"
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                >
                  <option value="all">All</option>
                  {resourceTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block font-medium mb-1">Search</label>
                <Input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">No resources found.</div>
              ) : (
                filteredResources.map(resource => (
                  <Card key={resource.id} className="h-full hover:shadow-lg transition-shadow flex flex-col justify-between">
                    <CardHeader className="flex flex-row justify-between items-start">
                      <div>
                        <CardTitle>{resource.name}</CardTitle>
                        <CardDescription>{resource.description}</CardDescription>
                      </div>
                      <button
                        aria-label={favourites.includes(resource.id) ? 'Remove from favourites' : 'Add to favourites'}
                        onClick={() => toggleFavourite(resource.id)}
                        className="ml-2 mt-1"
                      >
                        <Heart className={`h-6 w-6 transition-colors ${favourites.includes(resource.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                      </button>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>{resource.type}</Badge>
                          <span className="text-gray-500 flex items-center"><MapPin className="h-4 w-4 mr-1" />{resource.location}</span>
                          {resource.capacity && (
                            <span className="text-gray-500 flex items-center"><Users className="h-4 w-4 mr-1" />{resource.capacity}</span>
                          )}
                        </div>
                        {resource.tags && resource.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {resource.tags.map(tag => (
                              <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button asChild className="mt-4 w-full" variant="secondary">
                        <Link to={`/calendar/${resource.id}`}>Book Now</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Resources; 