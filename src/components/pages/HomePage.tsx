// HPI 1.7-V
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Bell, Settings, Edit2, Check, ShieldAlert } from 'lucide-react';
import { Image } from '@/components/ui/image';

// --- Types & Interfaces ---
interface PlayerData {
  name: string;
  avatarUrl: string;
}

// --- Constants ---
const DEFAULT_AVATAR = "https://static.wixstatic.com/media/50f4bf_4961bf11271c41cbba4e316b5143e24e~mv2.png?originWidth=128&originHeight=128";
const DEFAULT_NAME = "COMANDANTE_LEO";
const STORAGE_KEY_AVATAR = "@dominio_comando/avatar";
const STORAGE_KEY_NAME = "@dominio_comando/player_name";

// --- Components ---

const GameHeader: React.FC = () => {
  // State
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR);
  const [playerName, setPlayerName] = useState<string>(DEFAULT_NAME);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Hydration & LocalStorage Load
  useEffect(() => {
    setIsMounted(true);
    const savedAvatar = localStorage.getItem(STORAGE_KEY_AVATAR);
    const savedName = localStorage.getItem(STORAGE_KEY_NAME);
    
    if (savedAvatar) setAvatarUrl(savedAvatar);
    if (savedName) setPlayerName(savedName);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  // Handlers
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarUrl(base64String);
        localStorage.setItem(STORAGE_KEY_AVATAR, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditingName = () => {
    setTempName(playerName);
    setIsEditingName(true);
  };

  const saveName = () => {
    const finalName = tempName.trim() || DEFAULT_NAME;
    setPlayerName(finalName);
    localStorage.setItem(STORAGE_KEY_NAME, finalName);
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveName();
    if (e.key === 'Escape') setIsEditingName(false);
  };

  // Prevent hydration mismatch rendering
  if (!isMounted) return null;

  return (
    <header className="fixed top-0 left-0 w-full h-[110px] z-50 select-none">
      {/* Background Panel with Blur and HUD styling */}
      <div className="absolute inset-0 bg-[rgba(15,20,30,0.85)] backdrop-blur-md border-b-2 border-[#00eaff] shadow-[0_4px_20px_rgba(0,234,255,0.15)] overflow-hidden">
        {/* Subtle HUD Scanlines */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00eaff 2px, #00eaff 3px)',
            backgroundSize: '100% 4px'
          }}
        />
        {/* Decorative Tech Accents */}
        <div className="absolute top-0 left-0 w-32 h-[2px] bg-gradient-to-r from-[#FF4500] to-transparent" />
        <div className="absolute bottom-0 right-0 w-48 h-[2px] bg-gradient-to-l from-[#00eaff] to-transparent" />
      </div>

      {/* Main Content Container */}
      <div className="relative h-full w-full max-w-[120rem] mx-auto px-4 md:px-8 flex items-center justify-between">
        
        {/* LEFT AREA: Logo & Title */}
        <div className="flex items-center gap-4 z-10 w-1/3 min-w-[250px]">
          {/* Icon/Crest */}
          <div className="relative hidden sm:flex items-center justify-center w-14 h-14 rounded-lg bg-black/40 border border-[#FF4500]/30 shadow-[0_0_15px_rgba(255,69,0,0.2)]">
            <Crown className="w-8 h-8 text-[#FF4500] drop-shadow-[0_0_8px_rgba(255,69,0,0.8)]" />
            {/* Abstract Wings using CSS shapes */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-6 border-l-2 border-t-2 border-[#FF4500]/50 rounded-tl-md" />
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-6 border-r-2 border-t-2 border-[#FF4500]/50 rounded-tr-md" />
          </div>

          {/* Typography */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-[-4px]">
              <ShieldAlert className="w-4 h-4 text-[#FF4500] sm:hidden" />
              <h1 
                className="font-heading font-black text-xl sm:text-2xl md:text-3xl tracking-[2px] uppercase m-0 leading-none"
                style={{
                  background: 'linear-gradient(90deg, #FF4500 0%, #FF0000 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0px 0px 8px rgba(255,69,0,0.6))'
                }}
              >
                DOMÍNIO DO COMANDO
              </h1>
            </div>
            <span className="font-heading font-bold text-xs sm:text-sm tracking-[3px] uppercase text-[#00eaff] drop-shadow-[0_0_5px_rgba(0,234,255,0.8)]">
              GIRO NO ASFALTO
            </span>
          </div>
        </div>

        {/* CENTER AREA: Interactive Avatar */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
          {/* Decorative HUD Ring behind avatar */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-[86px] h-[86px] rounded-full border border-[#00eaff]/30 border-dashed pointer-events-none"
          />
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAvatarClick}
            className="relative w-[70px] h-[70px] rounded-full cursor-pointer group"
          >
            {/* Neon Border & Glow */}
            <div className="absolute inset-0 rounded-full border-[3px] border-[#00eaff] shadow-[0_0_15px_rgba(0,234,255,0.6),inset_0_0_10px_rgba(0,234,255,0.4)] z-10 transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(0,234,255,0.8),inset_0_0_15px_rgba(0,234,255,0.6)]" />
            
            {/* Image */}
            <Image src={avatarUrl} alt="Avatar do Jogador" className="w-full h-full object-cover rounded-full relative z-0" />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
            </div>
          </motion.div>

          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          {/* Small decorative bracket below avatar */}
          <div className="mt-2 w-12 h-[2px] bg-[#00eaff]/50 relative">
            <div className="absolute -left-1 -top-1 w-[2px] h-2 bg-[#00eaff]/50" />
            <div className="absolute -right-1 -top-1 w-[2px] h-2 bg-[#00eaff]/50" />
          </div>
        </div>

        {/* RIGHT AREA: Player Info & Controls */}
        <div className="flex items-center justify-end gap-4 sm:gap-6 z-10 w-1/3 min-w-[200px]">
          
          {/* Player Name Display/Edit */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-[#00eaff]/70 font-paragraph tracking-widest uppercase mb-1">
              Status: Online
            </span>
            
            <AnimatePresence mode="wait">
              {isEditingName ? (
                <motion.div 
                  key="editing"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex items-center gap-2 bg-black/40 border border-[#00eaff]/50 rounded px-2 py-1"
                >
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    onBlur={saveName}
                    maxLength={20}
                    className="bg-transparent text-white font-heading font-bold tracking-wider outline-none w-32 text-right text-sm"
                  />
                  <button onClick={saveName} className="text-[#00eaff] hover:text-white transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="display"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={startEditingName}
                >
                  <span className="font-heading font-bold text-sm lg:text-base text-white tracking-wider drop-shadow-[0_0_5px_rgba(0,234,255,0.5)] group-hover:text-[#00eaff] transition-colors truncate max-w-[150px] lg:max-w-[200px]">
                    {playerName}
                  </span>
                  <Edit2 className="w-3 h-3 text-white/30 group-hover:text-[#00eaff] transition-colors opacity-0 group-hover:opacity-100" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Utility Icons */}
          <div className="flex items-center gap-3 border-l border-white/10 pl-4 sm:pl-6">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 text-white/80 hover:text-white transition-colors group"
            >
              <Bell className="w-5 h-5 group-hover:drop-shadow-[0_0_8px_rgba(0,234,255,0.8)]" />
              {/* Notification Dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF4500] rounded-full shadow-[0_0_5px_rgba(255,69,0,0.8)]" />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-white/80 hover:text-white transition-all duration-300 group"
            >
              <Settings className="w-5 h-5 group-hover:drop-shadow-[0_0_8px_rgba(0,234,255,0.8)]" />
            </motion.button>
          </div>
        </div>

      </div>
    </header>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0d14] text-white overflow-x-hidden font-paragraph selection:bg-[#00eaff] selection:text-black">
      
      <GameHeader />
      
      {/* Main content area - Kept minimal as requested, acting as a canvas to showcase the header */}
      <main className="pt-[110px] relative min-h-screen flex flex-col items-center justify-center">
        
        {/* Atmospheric Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF4500]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#00eaff]/5 rounded-full blur-[150px]" />
          
          {/* Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 
              className="text-5xl md:text-7xl font-heading font-black mb-6 tracking-tighter uppercase"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #a0a5b0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              A CIDADE AGUARDA
            </h2>
            <p className="text-xl md:text-2xl font-paragraph text-[#00eaff] max-w-2xl mx-auto font-light tracking-wide drop-shadow-[0_0_10px_rgba(0,234,255,0.3)]">
              O painel de comando está ativo. Suas ordens definem o futuro das ruas.
            </p>
            
            <div className="mt-12 flex items-center justify-center gap-4">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#FF4500]" />
              <span className="text-xs font-heading tracking-[0.3em] text-white/50 uppercase">Sistema Online</span>
              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#FF4500]" />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}