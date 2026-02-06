-- Create ratings table for user reviews
CREATE TABLE public.ratings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (reviewer_id, seller_id, listing_id)
);

-- Enable Row Level Security
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Ratings are viewable by everyone" 
ON public.ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create ratings for others" 
ON public.ratings 
FOR INSERT 
WITH CHECK (
    auth.uid() = reviewer_id 
    AND auth.uid() != seller_id
);

CREATE POLICY "Users can update their own ratings" 
ON public.ratings 
FOR UPDATE 
USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own ratings" 
ON public.ratings 
FOR DELETE 
USING (auth.uid() = reviewer_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ratings_updated_at
BEFORE UPDATE ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_ratings_seller_id ON public.ratings(seller_id);
CREATE INDEX idx_ratings_reviewer_id ON public.ratings(reviewer_id);