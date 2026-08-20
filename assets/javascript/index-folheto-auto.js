const FOLHETO_JSON_PATH = 'assets/data/index-folheto.json';

function normalizarDataISO(dataISO) {
  if (typeof dataISO !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dataISO)) {
    return null;
  }

  const data = new Date(`${dataISO}T00:00:00`);
  if (Number.isNaN(data.getTime())) {
    return null;
  }

  return data;
}

function folhetoDentroDaVigencia(dataInicio, dataFim) {
  const inicio = normalizarDataISO(dataInicio);
  const fim = normalizarDataISO(dataFim);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (inicio && hoje < inicio) {
    return false;
  }

  if (fim) {
    const fimDoDia = new Date(fim);
    fimDoDia.setHours(23, 59, 59, 999);

    if (hoje > fimDoDia) {
      return false;
    }
  }

  return true;
}

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
  const ativoBase = typeof folheto.ativo === 'boolean' ? folheto.ativo : fallback.ativo;
  const ativoPorData = folhetoDentroDaVigencia(folheto.dataInicio, folheto.dataFim);

  return {
    ativo: ativoBase && ativoPorData,
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
