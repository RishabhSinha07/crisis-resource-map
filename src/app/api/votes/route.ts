import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { resource_id, vote_type, voter_fingerprint } = body;

  if (!resource_id || !vote_type || !voter_fingerprint) {
    return NextResponse.json(
      { error: 'Missing required fields: resource_id, vote_type, voter_fingerprint' },
      { status: 400 }
    );
  }

  if (!['up', 'down'].includes(vote_type)) {
    return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('cast_vote', {
    p_resource_id: resource_id,
    p_vote_type: vote_type,
    p_voter_fingerprint: voter_fingerprint,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
