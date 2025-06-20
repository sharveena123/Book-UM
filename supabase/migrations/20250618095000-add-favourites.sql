-- Create favourites table for user favorites
CREATE TABLE public.favourites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, resource_id)
);

-- Enable Row Level Security
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own favourites
CREATE POLICY "Users can view their own favourites" ON public.favourites
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can add their own favourites
CREATE POLICY "Users can add their own favourites" ON public.favourites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove their own favourites
CREATE POLICY "Users can delete their own favourites" ON public.favourites
  FOR DELETE USING (auth.uid() = user_id); 