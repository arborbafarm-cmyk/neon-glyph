import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Image } from '@/components/ui/image';

export default function LuxuryShowroomPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Background Section */}
      <div className="flex-1 w-full">
        <Image
          src="https://static.wixstatic.com/media/50f4bf_8787d9f97cfa4afe99b4bdd843fde7da~mv2.png"
          alt="Luxury Showroom Background"
          className="w-full h-full object-cover"
          width={1600}
        />
      </div>

      <Footer />
    </div>
  );
}
