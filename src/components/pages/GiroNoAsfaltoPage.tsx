import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GiroNoAsfaltoPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const crimeScenes = [
    {
      id: 1,
      title: 'Roubo de Carga',
      description: 'Operações de roubo de carga em rodovias da cidade. Planejamento estratégico e execução sincronizada.',
      image: 'https://static.wixstatic.com/media/50f4bf_5523179f99724bc288d9251c774ae8ca~mv2.png?originWidth=576&originHeight=384',
      risk: 'ALTO',
    },
    {
      id: 2,
      title: 'Tráfico de Influência',
      description: 'Corrupção de autoridades e funcionários públicos. Redes de suborno e manipulação política.',
      image: 'https://static.wixstatic.com/media/50f4bf_3d442e29bf69414e9f6c6478046bbb6b~mv2.png?originWidth=576&originHeight=384',
      risk: 'CRÍTICO',
    },
    {
      id: 3,
      title: 'Contrabando Noturno',
      description: 'Movimentação de mercadorias ilegais pelas ruas da cidade durante a noite. Rotas secretas e pontos de distribuição.',
      image: 'https://static.wixstatic.com/media/50f4bf_d436f4d4d88845e88b268b0d040548fb~mv2.png?originWidth=576&originHeight=384',
      risk: 'ALTO',
    },
    {
      id: 4,
      title: 'Operações Encobiertas',
      description: 'Atividades ilícitas disfarçadas em negócios legítimos. Lavagem de dinheiro através de estabelecimentos comerciais.',
      image: 'https://static.wixstatic.com/media/50f4bf_c82eb209907544879aec8db34551a7ce~mv2.png?originWidth=576&originHeight=384',
      risk: 'MÉDIO',
    },
  ];

  const territories = [
    { name: 'Porto Industrial', activity: 'Contrabando', status: 'ATIVO' },
    { name: 'Centro Financeiro', activity: 'Lavagem de Dinheiro', status: 'ATIVO' },
    { name: 'Zona Vermelha', activity: 'Tráfico', status: 'ATIVO' },
    { name: 'Periferia Leste', activity: 'Roubo Organizado', status: 'MONITORADO' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-logo-gradient-start rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <motion.div
          className="relative max-w-[100rem] mx-auto px-6 md:px-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-block px-4 py-2 bg-logo-gradient-start/20 border border-logo-gradient-start rounded-lg mb-6">
              <span className="text-logo-gradient-start font-heading text-sm font-bold tracking-widest">
                OPERAÇÕES URBANAS
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-heading text-6xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Giro no Asfalto
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="font-paragraph text-lg md:text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed"
          >
            Mergulhe nas ruas escuras da cidade. Onde cada esquina guarda segredos, cada transação é um risco, e o poder flui pelas veias do asfalto.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
            <button className="px-8 py-3 bg-logo-gradient-start hover:bg-logo-gradient-end text-white font-heading font-bold rounded-lg transition-all duration-300 transform hover:scale-105">
              Explorar Operações
            </button>
            <button className="px-8 py-3 border-2 border-secondary text-secondary hover:bg-secondary/10 font-heading font-bold rounded-lg transition-all duration-300">
              Ver Territórios
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Crime Scenes Grid */}
      <section className="relative max-w-[100rem] mx-auto px-6 md:px-12 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="font-heading text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Operações em Andamento
          </motion.h2>
          <motion.div variants={itemVariants} className="w-20 h-1 bg-gradient-to-r from-logo-gradient-start to-secondary"></motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {crimeScenes.map((scene) => (
            <motion.div
              key={scene.id}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-lg border border-slate-700 hover:border-secondary/50 transition-all duration-300 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/80"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={scene.image}
                  alt={scene.title}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
              </div>

              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-heading text-2xl font-bold text-white">{scene.title}</h3>
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold tracking-widest ${
                      scene.risk === 'CRÍTICO'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                        : scene.risk === 'ALTO'
                          ? 'bg-logo-gradient-start/20 text-logo-gradient-start border border-logo-gradient-start/50'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                    }`}
                  >
                    {scene.risk}
                  </span>
                </div>

                <p className="font-paragraph text-slate-300 mb-4 leading-relaxed">{scene.description}</p>

                <button className="text-secondary hover:text-logo-gradient-start font-heading font-bold text-sm tracking-widest transition-colors duration-300">
                  DETALHES →
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Territories Map */}
      <section className="relative max-w-[100rem] mx-auto px-6 md:px-12 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="font-heading text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Territórios Urbanos
          </motion.h2>
          <motion.div variants={itemVariants} className="w-20 h-1 bg-gradient-to-r from-secondary to-logo-gradient-start"></motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {territories.map((territory, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative p-6 rounded-lg border border-slate-700 hover:border-secondary/50 bg-gradient-to-br from-slate-900/50 to-slate-950/50 backdrop-blur-sm hover:from-slate-900/80 hover:to-slate-950/80 transition-all duration-300 cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all duration-300"></div>

              <div className="relative">
                <h3 className="font-heading text-lg font-bold text-white mb-2">{territory.name}</h3>
                <p className="font-paragraph text-sm text-slate-400 mb-4">{territory.activity}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-heading tracking-widest text-slate-500">STATUS</span>
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold tracking-widest ${
                      territory.status === 'ATIVO'
                        ? 'bg-logo-gradient-start/20 text-logo-gradient-start'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {territory.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative max-w-[100rem] mx-auto px-6 md:px-12 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
        >
          {[
            { label: 'Operações Ativas', value: '47' },
            { label: 'Territórios Controlados', value: '12' },
            { label: 'Risco Médio', value: 'ALTO' },
            { label: 'Efetivo em Campo', value: '200+' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative p-8 rounded-lg border border-slate-700 bg-gradient-to-br from-slate-900/50 to-slate-950/50 backdrop-blur-sm text-center group hover:border-secondary/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-logo-gradient-start/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <p className="font-paragraph text-slate-400 text-sm mb-2">{stat.label}</p>
                <p className="font-heading text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative max-w-[100rem] mx-auto px-6 md:px-12 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative p-12 rounded-lg border border-secondary/30 bg-gradient-to-r from-secondary/10 to-logo-gradient-start/10 backdrop-blur-sm overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
          </div>

          <motion.div variants={itemVariants} className="relative text-center">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Pronto para Entrar no Jogo?
            </h2>
            <p className="font-paragraph text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Cada decisão conta. Cada movimento é observado. Bem-vindo ao mundo onde as regras são escritas pelo mais forte.
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end hover:from-logo-gradient-end hover:to-logo-gradient-start text-white font-heading font-bold rounded-lg transition-all duration-300 transform hover:scale-105">
              Iniciar Operação
            </button>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
