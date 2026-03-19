import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LuxuryShowroomPage() {
  return (
    <>
      <Header />
      <div className="w-full min-h-screen pt-[100px] pb-20 overflow-hidden">
        {/* Full-screen background image */}
        <Image
          src="https://static.wixstatic.com/media/50f4bf_38c9f88d54654e38906e049af6a8b5a4~mv2.png"
          alt="Luxury Showroom Background"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        
        {/* Overlay for content */}
        <div className="absolute inset-0 bg-black/20" />
      </div>
      <Footer />
    </>
  );
}
