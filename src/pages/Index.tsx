import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  useSeoMeta({
    title: 'key.card — Your Nostr Identity Card',
    description: 'Your identity. Your keys. Your card. A free, open-source digital business card powered by Nostr.',
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-4">🔑</div>
        <h1 className="text-4xl font-bold mb-3">key.card</h1>
        <p className="text-xl text-gray-400 mb-2">Your identity. Your keys. Your card.</p>
        <p className="text-gray-500 mb-8">
          A free, open-source Nostr-native digital business card. No subscriptions. No vendor lock-in. Your data lives on Nostr relays — forever.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center mb-8">
          <Link to="/edit">
            <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
              Create Your Card
            </Button>
          </Link>
          <Link to="/npub18ams6ewn5aj2n3wt2qawzglx9mr4nzksxhvrdc4gzrecw7n5tvjqctp424">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-purple-500 text-purple-300 hover:bg-purple-950">
              See Demo Card
            </Button>
          </Link>
        </div>

        <p className="text-sm text-gray-600">
          Visit <code className="text-purple-400">key.card/your-npub</code> or <code className="text-purple-400">key.card/you@domain.com</code>
        </p>
      </div>
    </div>
  );
};

export default Index;
