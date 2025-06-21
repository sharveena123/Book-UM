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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
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
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
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
                  <Card key={resource.id} className="h-full hover:shadow-lg transition-shadow flex flex-col">
                    {/* Image Section */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-4xl mb-2">
                            {resource.type === 'room' && '🏢'}
                            {resource.type === 'equipment' && '🔧'}
                            {resource.type === 'vehicle' && '🚗'}
                            {resource.type === 'facility' && '🏟️'}
                            {resource.type === 'lab' && '🧪'}
                            {resource.type === 'studio' && '🎨'}
                            {resource.type === 'auditorium' && '🎭'}
                            {resource.type === 'gym' && '💪'}
                            {resource.type === 'library' && '📚'}
                            {resource.type === 'cafeteria' && '🍽️'}
                            {!['room', 'equipment', 'vehicle', 'facility', 'lab', 'studio', 'auditorium', 'gym', 'library', 'cafeteria'].includes(resource.type) && '🏛️'}
                          </div>
                          <div className="text-lg font-semibold">{resource.name}</div>
                        </div>
                      </div>
                      <button
                        aria-label={favourites.includes(resource.id) ? 'Remove from favourites' : 'Add to favourites'}
                        onClick={() => toggleFavourite(resource.id)}
                        className="absolute top-3 right-3 z-10"
                      >
                        <Heart className={`h-6 w-6 transition-colors ${favourites.includes(resource.id) ? 'fill-red-500 text-red-500' : 'text-white hover:text-red-500'}`} />
                      </button>
                    </div>
                    
                    {/* Information Section */}
                    <div className="flex-1 p-6 flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{resource.name}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{resource.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{resource.type}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span>{resource.location}</span>
                          </div>
                          {resource.capacity && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Users className="h-4 w-4" />
                              <span>Capacity: {resource.capacity}</span>
                            </div>
                          )}
                        </div>
                        
                        {resource.tags && resource.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {resource.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                            {resource.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">+{resource.tags.length - 3} more</Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button asChild className="w-full mt-auto">
                        <Link to={`/calendar/${resource.id}`}>Book Now</Link>
                      </Button>
                    </div>
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