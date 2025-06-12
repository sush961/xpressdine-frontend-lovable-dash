import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userEmail = 'david.r@xpressdine.com'; // Demo user
    const { language, timezone, date_format } = req.body;

    // Validate preferences
    const validLanguages = ['en'];
    const validTimezones = ['utc', 'est', 'pst', 'cet'];
    const validDateFormats = ['mdy', 'dmy', 'ymd'];

    if (language && !validLanguages.includes(language)) {
      return res.status(400).json({ error: 'Invalid language selection' });
    }

    if (timezone && !validTimezones.includes(timezone)) {
      return res.status(400).json({ error: 'Invalid timezone selection' });
    }

    if (date_format && !validDateFormats.includes(date_format)) {
      return res.status(400).json({ error: 'Invalid date format selection' });
    }

    const { data, error } = await supabase
      .from('team')
      .update({
        language,
        timezone,
        date_format,
        updated_at: new Date().toISOString()
      })
      .eq('email', userEmail)
      .select()
      .single();

    if (error) {
      console.error('Preferences update error:', error);
      return res.status(400).json({ error: 'Failed to update preferences' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Preferences API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
