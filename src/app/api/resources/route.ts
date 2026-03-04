import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { type, title, description, lat, lng, contact_info } = body;

  if (!type || !title || lat == null || lng == null) {
    return NextResponse.json(
      { error: 'Missing required fields: type, title, lat, lng' },
      { status: 400 }
    );
  }

  // Validate type
  const validTypes = ['shelter', 'water', 'food', 'medical', 'wifi', 'transport'];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: 'Invalid resource type' }, { status: 400 });
  }

  // Validate title length
  if (title.length > 200) {
    return NextResponse.json({ error: 'Title too long (max 200 chars)' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('resources')
    .insert({
      type,
      title: title.trim(),
      description: description?.trim() || null,
      lat,
      lng,
      contact_info: contact_info?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
