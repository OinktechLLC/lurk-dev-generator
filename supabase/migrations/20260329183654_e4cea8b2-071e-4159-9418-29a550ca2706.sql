
-- Create credits table
CREATE TABLE public.credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  credits INTEGER NOT NULL DEFAULT 5,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits" ON public.credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own credits" ON public.credits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credits" ON public.credits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  stack TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Create generations table
CREATE TABLE public.generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  result TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations" ON public.generations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = generations.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create own generations" ON public.generations FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = generations.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update own generations" ON public.generations FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = generations.project_id AND projects.user_id = auth.uid()));

-- Trigger to create credits row on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.credits (user_id, credits, last_reset_date)
  VALUES (NEW.id, 5, CURRENT_DATE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Function to reset credits daily (called on access)
CREATE OR REPLACE FUNCTION public.check_and_reset_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_credits INTEGER;
  last_reset DATE;
  moscow_date DATE;
BEGIN
  moscow_date := (NOW() AT TIME ZONE 'Europe/Moscow')::DATE;
  
  SELECT credits, last_reset_date INTO current_credits, last_reset
  FROM public.credits WHERE user_id = p_user_id;
  
  IF last_reset IS NULL THEN
    INSERT INTO public.credits (user_id, credits, last_reset_date)
    VALUES (p_user_id, 5, moscow_date);
    RETURN 5;
  END IF;
  
  IF last_reset < moscow_date THEN
    UPDATE public.credits SET credits = 5, last_reset_date = moscow_date
    WHERE user_id = p_user_id;
    RETURN 5;
  END IF;
  
  RETURN current_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
