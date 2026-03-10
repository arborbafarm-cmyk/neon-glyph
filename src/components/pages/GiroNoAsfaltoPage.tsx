import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Image } from '@/components/ui/image';

export default function GiroNoAsfaltoPage() {
  return (
    <div className="min-h-screen bg-[#0a0d14] flex flex-col">
      <Header />
      {/* Slot Machine Illustration Section */}
      <div className="flex-1 w-full relative overflow-hidden bg-gradient-to-b from-[#0a0d14] to-[#0f1419] flex items-center justify-center">

      </div>
      <Footer />
    </div>
  );
}
