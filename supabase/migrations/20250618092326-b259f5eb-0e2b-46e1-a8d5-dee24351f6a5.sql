
-- Add more fitness and sports facilities
INSERT INTO public.resources (name, type, description, location, tags, capacity) VALUES
  ('Badminton Court 1', 'sports', 'Professional badminton court with equipment provided', 'Sports Complex, Court 1', '{"Sports", "Badminton", "Equipment"}', 4),
  ('Badminton Court 2', 'sports', 'Professional badminton court with equipment provided', 'Sports Complex, Court 2', '{"Sports", "Badminton", "Equipment"}', 4),
  ('Tennis Court A', 'sports', 'Outdoor tennis court with lighting', 'Sports Complex, Outdoor A', '{"Sports", "Tennis", "Outdoor"}', 4),
  ('Basketball Court', 'sports', 'Indoor basketball court with scoreboard', 'Sports Complex, Indoor', '{"Sports", "Basketball", "Indoor"}', 10),
  ('Gym Room 1', 'fitness', 'Fully equipped gym with cardio and weight machines', 'Fitness Center, Room 1', '{"Fitness", "Gym", "Equipment"}', 15),
  ('Yoga Studio', 'fitness', 'Peaceful yoga studio with mats and props', 'Fitness Center, Studio', '{"Fitness", "Yoga", "Meditation"}', 20),
  ('Swimming Pool Lane 1', 'sports', 'Olympic size swimming pool lane', 'Aquatic Center, Lane 1', '{"Sports", "Swimming", "Pool"}', 1),
  ('Swimming Pool Lane 2', 'sports', 'Olympic size swimming pool lane', 'Aquatic Center, Lane 2', '{"Sports", "Swimming", "Pool"}', 1);

-- Add a profile update trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to profiles
ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
