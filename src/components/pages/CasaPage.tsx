import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

export default function CasaPage() {
  const handleButtonClick = () => {
    alert('Botão clicado!');
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundImage: 'url(https://static.wixstatic.com/media/50f4bf_c6c96e5e7b0c4b8b963f4138fdc7a35c~mv2.png)',
        backgroundSize: '120%',
        backgroundPosition: 'center 40%',
        backgroundAttachment: 'fixed',
      }}
    >
      <Header />
      <div className="w-full flex justify-center pt-32">
        <Button onClick={handleButtonClick} className="px-8 py-3 text-lg">
          Clique aqui
        </Button>
      </div>
      <main className="flex-1 flex items-center justify-center">
        {/* Content area - you can add content here */}
      </main>
      <Footer />
    </div>
  );
}
