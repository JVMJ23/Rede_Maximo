const OFERTAS_JSON_PATH = 'assets/data/ofertas.json';

let modalOfertas = null;

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

function dentroDaVigencia(dataInicio, dataFim) {
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

function ofertaEstaAtiva(oferta) {
  return Boolean(oferta && oferta.ativa) && dentroDaVigencia(oferta.dataInicio, oferta.dataFim);
}

function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function criarModalOfertas() {
  if (document.getElementById('modal-oferta-cidade')) {
    modalOfertas = document.getElementById('modal-oferta-cidade');
    return;
  }

  const modalHtml = `
    <div id="modal-oferta-cidade" class="modal-oferta" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="modal-oferta-titulo">
      <div class="modal-oferta-backdrop" data-close-modal="true"></div>
      <div class="modal-oferta-content">
        <button type="button" class="modal-oferta-fechar" aria-label="Fechar folheto" data-close-modal="true">X</button>
        <h2 id="modal-oferta-titulo" class="modal-oferta-titulo"></h2>
        <img id="modal-oferta-imagem" class="modal-oferta-imagem" src="" alt="Folheto da oferta">
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  modalOfertas = document.getElementById('modal-oferta-cidade');

  modalOfertas.addEventListener('click', function(event) {
    if (event.target && event.target.dataset.closeModal === 'true') {
      fecharModalOferta();
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modalOfertas && modalOfertas.classList.contains('is-open')) {
      fecharModalOferta();
    }
  });
}

function abrirModalOferta(cidade, imagem) {
  if (!modalOfertas) {
    criarModalOfertas();
  }

  const titulo = modalOfertas.querySelector('#modal-oferta-titulo');
  const imagemEl = modalOfertas.querySelector('#modal-oferta-imagem');
  const nomeCidade = cidade || 'Cidade selecionada';

  titulo.textContent = `Ofertas - ${nomeCidade}`;
  imagemEl.src = imagem;
  imagemEl.alt = `Folheto de ofertas para ${nomeCidade}`;

  modalOfertas.classList.add('is-open');
  modalOfertas.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-oferta-open');
}

function fecharModalOferta() {
  if (!modalOfertas) {
    return;
  }

  const imagemEl = modalOfertas.querySelector('#modal-oferta-imagem');
  imagemEl.src = '';

  modalOfertas.classList.remove('is-open');
  modalOfertas.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-oferta-open');
}

function criarBotaoTopo() {
  return `
    <div class="botao-voltar-container">
      <a href="#topo" class="botao-voltar">Topo^</a>
    </div>
  `;
}

function renderSemOferta(container, mensagem) {
  container.innerHTML = `
    <h1>Nenhuma oferta disponível no momento</h1>
    <p class="ofertas-vazio">${mensagem}</p>
    ${criarBotaoTopo()}
  `;
}

function renderBotoesPorCidade(container, payload) {
  const titulo = payload.titulo || 'Ofertas válidas por cidade';
  const lista = Array.isArray(payload.ofertasPorCidade) ? payload.ofertasPorCidade : [];
  const ofertasAtivas = lista.filter(oferta => ofertaEstaAtiva(oferta) && oferta.cidade);

  if (ofertasAtivas.length === 0) {
    renderSemOferta(container, 'No momento, não há ofertas válidas, mas fique atento! Em breve teremos novidades para você.');
    return;
  }

  const botoesHTML = ofertasAtivas.map(oferta => {
    const cidadeSegura = escaparHtml(oferta.cidade);
    const imagemSegura = oferta.imagem ? escaparHtml(oferta.imagem) : '';
    const urlSegura = oferta.url ? escaparHtml(oferta.url) : '';
    const mensagemSemFolheto = escaparHtml(oferta.mensagemSemFolheto || 'Sem folheto disponível no momento');

    if (imagemSegura) {
      return `
    <button class="oferta-cidade-btn" type="button" data-cidade="${cidadeSegura}" data-imagem="${imagemSegura}" aria-label="Ver oferta válida para ${cidadeSegura}">
      ${cidadeSegura}
    </button>
  `;
    }

    if (urlSegura) {
      return `
    <a class="oferta-cidade-btn" href="${urlSegura}" target="_blank" rel="noopener noreferrer" aria-label="Ver oferta válida para ${cidadeSegura}">
      ${cidadeSegura}
    </a>
  `;
    }

    return `
    <button class="oferta-cidade-btn oferta-cidade-btn--sem-folheto" type="button" disabled aria-disabled="true" aria-label="${mensagemSemFolheto} para ${cidadeSegura}">
      ${cidadeSegura}<span class="oferta-cidade-btn-msg">${mensagemSemFolheto}</span>
    </button>
  `;
  }).join('');

  container.innerHTML = `
    <h1>${titulo}</h1>
    <p class="ofertas-subtitulo">Clique na sua cidade para abrir as ofertas válidas.</p>
    <div class="ofertas-cidades-grid">
      ${botoesHTML}
    </div>
    ${criarBotaoTopo()}
  `;

  const botoesModal = container.querySelectorAll('.oferta-cidade-btn[data-imagem]');
  botoesModal.forEach(botao => {
    botao.addEventListener('click', function() {
      const cidade = this.getAttribute('data-cidade') || '';
      const imagem = this.getAttribute('data-imagem') || '';
      if (imagem) {
        abrirModalOferta(cidade, imagem);
      }
    });
  });
}

function renderFormatoLegado(container, payload) {
  const ofertas = Array.isArray(payload.ofertas) ? payload.ofertas : [];
  const ofertasAtivas = ofertas.filter(oferta => ofertaEstaAtiva(oferta));

  if (ofertasAtivas.length === 0) {
    renderSemOferta(container, 'Fique atento. Em breve teremos novas ofertas para voce.');
    return;
  }

  const ofertasHTML = ofertasAtivas.map(oferta => `
    <h1>${oferta.titulo}</h1>
    <img src="${oferta.imagem}" loading="lazy" alt="${oferta.alt || 'Oferta da semana'}">
  `).join('');

  container.innerHTML = `
    ${ofertasHTML}
    ${criarBotaoTopo()}
  `;
}

async function gerarOfertas() {
  const container = document.querySelector('.ofertas .container');
  if (!container) {
    return;
  }

  try {
    const response = await fetch(OFERTAS_JSON_PATH, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Falha ao carregar ofertas: ${response.status}`);
    }

    const payload = await response.json();

    if (Array.isArray(payload.ofertasPorCidade)) {
      renderBotoesPorCidade(container, payload);
    } else {
      renderFormatoLegado(container, payload);
    }
  } catch (error) {
    console.error('Erro ao carregar ofertas:', error);
    renderSemOferta(container, 'Nao foi possivel carregar as ofertas agora. Tente novamente em instantes.');
  }
}

document.addEventListener('DOMContentLoaded', gerarOfertas);
document.addEventListener('DOMContentLoaded', criarModalOfertas);