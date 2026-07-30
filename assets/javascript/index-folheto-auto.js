const FOLHETO_JSON_PATH = 'assets/data/index-folheto.json';

function obterFolhetoFallback() {
  const anchor = document.querySelector('.folheto-container .folheto-unico a');
  const imagem = document.querySelector('.folheto-container .folheto-unico img');

  return {
    ativo: true,
    imagem: imagem ? imagem.getAttribute('src') : '',
    alt: imagem ? imagem.getAttribute('alt') : 'Folheto promocional da semana',
    link: anchor ? anchor.getAttribute('href') : 'ofertas.html',
    title: anchor ? anchor.getAttribute('title') : 'Clique no folheto e seja redirecionado as ofertas da semana'
  };
}

function aplicarFolhetoNaHome(folheto) {
  const anchor = document.querySelector('.folheto-container .folheto-unico a');
  const imagem = document.querySelector('.folheto-container .folheto-unico img');

  if (!anchor || !imagem) {
    return;
  }

  if (folheto.ativo === false) {
    const container = document.querySelector('.folheto-container .folheto-unico');
    if (container) {
      container.style.display = 'none';
    }
    return;
  }

  anchor.href = folheto.link;
  anchor.title = folheto.title;
  imagem.src = folheto.imagem;
  imagem.alt = folheto.alt;
}

function normalizarFolheto(payload, fallback) {
  const folheto = payload && payload.folheto ? payload.folheto : {};

  return {
    ativo: typeof folheto.ativo === 'boolean' ? folheto.ativo : fallback.ativo,
    imagem: folheto.imagem || fallback.imagem,
    alt: folheto.alt || fallback.alt,
    link: folheto.link || fallback.link,
    title: folheto.title || fallback.title
  };
}

async function atualizarFolhetoHome() {
  const fallback = obterFolhetoFallback();

  try {
    const response = await fetch(FOLHETO_JSON_PATH, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Falha ao carregar JSON do folheto: ${response.status}`);
    }

    const payload = await response.json();
    const folheto = normalizarFolheto(payload, fallback);
    aplicarFolhetoNaHome(folheto);
  } catch (error) {
    console.warn('Nao foi possivel atualizar o folheto por JSON. Mantendo conteudo padrao.', error);
    aplicarFolhetoNaHome(fallback);
  }
}

document.addEventListener('DOMContentLoaded', atualizarFolhetoHome);
