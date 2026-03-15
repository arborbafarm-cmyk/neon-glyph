export default function GamePage() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
<div id="map" style="width: 100vw; height: 100vh; background: #000;"></div>

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>

<style>
  body, html { margin: 0; padding: 0; overflow: hidden; background: #000; }
  
  /* Estilo Neon para os Tooltips */
  .tooltip-neon {
    background: rgba(10, 10, 15, 0.95) !important;
    border: 1px solid #0ff !important;
    border-radius: 6px !important;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.6) !important;
    color: #fff !important;
    font-family: 'Arial', sans-serif;
    padding: 10px !important;
    text-align: center;
    pointer-events: auto !important;
  }
  .tooltip-neon strong { font-size: 1.2em; text-shadow: 0 0 5px #0ff; display: block; margin-bottom: 3px; }
  .btn-entrar {
    display: inline-block; padding: 4px 12px; border: 1px solid #0ff; border-radius: 12px;
    color: #0ff; font-weight: bold; text-transform: uppercase;
    margin-top: 5px; cursor: pointer; font-size: 0.9em;
  }
  .btn-entrar:hover { background: #0ff; color: #000; box-shadow: 0 0 10px #0ff; }
  
  /* Efeito Giroflex da Viatura */
  @keyframes giroflex {
    0% { filter: drop-shadow(0 0 5px red); }
    50% { filter: drop-shadow(0 0 10px blue); }
    100% { filter: drop-shadow(0 0 5px red); }
  }
  .animacao-policia { animation: giroflex 0.6s infinite; }
</style>

<script>
  // ==========================================
  // 1. CONFIGURAÇÃO DO JOGADOR
  // ==========================================
  let nivelJogador = 40; // Defina o nível aqui (0, 10, 20... 100)

  // ==========================================
  // 2. LINKS DOS ASSETS (STATIC WIX)
  // ==========================================
  const urlMapaFundo = 'https://static.wixstatic.com/media/50f4bf_9dbf16b020134b02adc81709d1e774b9~mv2.png';
  const urlViatura = 'https://static.wixstatic.com/media/50f4bf_73f5f22017304e5198d1a876f1537486~mv2.png';

  // Dicionário de Evolução do Barraco
  const evolucaoBarraco = {
    0: 'https://static.wixstatic.com/media/50f4bf_1776337cd2dc4ff1982d01b0079a48d2~mv2.png',
    10: 'https://static.wixstatic.com/media/50f4bf_6527240d26e94ca782357743f0ddddd7~mv2.png',
    20: 'https://static.wixstatic.com/media/50f4bf_b23aee963b00465fa534f7705505b5b9~mv2.png',
    30: 'https://static.wixstatic.com/media/50f4bf_b538b42955634d7190d28507d4b05023~mv2.png',
    40: 'https://static.wixstatic.com/media/50f4bf_86c3183c0550490fab41c5a8a8f6184b~mv2.png',
    50: 'https://static.wixstatic.com/media/50f4bf_f363ec9d5ca846c4990f7730c5bf479c~mv2.png',
    60: 'https://static.wixstatic.com/media/50f4bf_f36ccf79521242ab8518cf871e9f6a16~mv2.png',
    70: 'https://static.wixstatic.com/media/50f4bf_a8496fa280b84dbcac088278af9faded~mv2.png',
    80: 'https://static.wixstatic.com/media/50f4bf_8a605af9fc4646fd84c89e99c6acc4eb~mv2.png',
    90: 'https://static.wixstatic.com/media/50f4bf_dacc94520dfa449384a529f15de074f2~mv2.png',
    100: 'https://static.wixstatic.com/media/50f4bf_9683cd5787de47bf883c2453384fd2ae~mv2.png'
  };

  // ==========================================
  // 3. INICIALIZAÇÃO DO MAPA
  // ==========================================
  const bounds = [[0, 0], [1000, 1000]]; // Sistema de coordenadas simples
  const map = L.map('map', { crs: L.CRS.Simple, minZoom: -2, maxZoom: 2, zoomControl: false, attributionControl: false });

  L.imageOverlay(urlMapaFundo, bounds).addTo(map);
  map.fitBounds(bounds);

  // Função para adicionar locais interativos
  function adicionarLocal(nome, desc, img, x, y, size, css = '') {
    const icon = L.icon({ iconUrl: img, iconSize: [size, size], iconAnchor: [size/2, size], className: css });
    L.marker([y, x], { icon: icon }).addTo(map)
     .bindTooltip(\`<div><strong>\${nome}</strong><span>\${desc}</span><br><div class="btn-entrar">Entrar</div></div>\`, 
     { direction: 'top', className: 'tooltip-neon', interactive: true, sticky: false });
  }

  // ==========================================
  // 4. LÓGICA DE SELEÇÃO DO BARRACO
  // ==========================================
  function definirImagemQG(nivel) {
    let nivelBase = Math.floor(nivel / 10) * 10;
    if (nivelBase < 0) nivelBase = 0;
    if (nivelBase > 100) nivelBase = 100;
    return evolucaoBarraco[nivelBase];
  }

  // ==========================================
  // 5. ADICIONANDO OS ELEMENTOS NO MAPA
  // ==========================================

  // O QG Evolutivo (na área da favela)
  const imagemQGAtual = definirImagemQG(nivelJogador);
  adicionarLocal(\`Seu QG (Nív. \${nivelJogador})\`, 'Domínio da Favela', imagemQGAtual, 300, 250, 130);

  // A Viatura PM (na avenida principal)
  adicionarLocal('Viatura PM', 'NPC: Sgt. Rocha', urlViatura, 500, 500, 90, 'animacao-policia');

<\/script>
        `,
      }}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    />
  );
}
