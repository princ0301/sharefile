import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { channel, event, data, socket_id } = body;

    // Trigger the event on the specified channel, optionally excluding the sender (socket_id)
    // Pusher requires the data parameter, so we default to an empty object if undefined
    await pusher.trigger(channel, event, data || {}, socket_id ? { socket_id } : undefined);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pusher trigger error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
