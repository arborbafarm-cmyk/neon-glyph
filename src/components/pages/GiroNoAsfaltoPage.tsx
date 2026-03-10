import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GiroNoAsfaltoPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      {/* Full-screen cinematic background */}
      <section className="flex-1 relative w-full overflow-hidden">
        <Image
          src="https://static.wixstatic.com/media/50f4bf_253301667c0f429c8b664cf3c859950b~mv2.png"
          alt="Luxurious Brazilian casino with crime elements - cinematic background"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
      </section>

      <Footer />
    </div>
  );
}
