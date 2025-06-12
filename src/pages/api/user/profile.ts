import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // For demo, we'll use David Rodriguez as the current user
    const userEmail = 'david.r@xpressdine.com';

    switch (req.method) {
      case 'GET':
        return await getUserProfile(userEmail, res);
      case 'PUT':
        return await updateUserProfile(userEmail, req.body, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUserProfile(userEmail: string, res: NextApiResponse) {
  const { data, error } = await supabase
    .from('team')
    .select('*')
    .eq('email', userEmail)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return res.status(404).json({ error: 'Profile not found' });
  }

  // Map team table structure to expected frontend format
  const profile = {
    id: data.id,
    full_name: data.name,
    email: data.email,
    phone: data.phone || '',
    role: data.role,
    avatar_url: data.avatar_url,
    language: data.language || 'en',
    timezone: data.timezone || 'utc',
    date_format: data.date_format || 'mdy'
  };

  return res.status(200).json(profile);
}

async function updateUserProfile(userEmail: string, updates: any, res: NextApiResponse) {
  const { data, error } = await supabase
    .from('team')
    .update({
      name: updates.full_name,
      email: updates.email,
      phone: updates.phone,
      updated_at: new Date().toISOString()
    })
    .eq('email', userEmail)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return res.status(400).json({ error: 'Failed to update profile' });
  }

  // Map response back to frontend format
  const profile = {
    id: data.id,
    full_name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    avatar_url: data.avatar_url,
    language: data.language,
    timezone: data.timezone,
    date_format: data.date_format
  };

  return res.status(200).json(profile);
}
