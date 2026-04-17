import PusherClient from 'pusher-js';

let pusherClient: PusherClient | null = null;

export const getPusherClient = () => {
  if (typeof window === 'undefined') return null;
  
  if (!pusherClient) {
    pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth',
    });
  }
  return pusherClient;
};

export const disconnectPusher = (): void => {
  if (pusherClient) {
    pusherClient.disconnect();
    pusherClient = null;
  }
};
