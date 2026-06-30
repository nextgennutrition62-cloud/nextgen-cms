import { createServerSupabase } from '../../../lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const supabase = createServerSupabase();

  const { error } = await supabase.from('orders').insert({
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    phone: body.phone,
    address: body.address,
    items: body.items,
    subtotal: body.subtotal,
    shipping: body.shipping,
    total: body.total,
    status: 'new',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
