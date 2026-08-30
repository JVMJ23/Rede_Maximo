const OFERTAS_JSON_PATH_LOCAL = 'assets/data/ofertas.json';
const OFERTAS_CONFIG = window.OFERTAS_CONFIG || {};
const OFERTAS_REMOTE_JSON_URL = typeof OFERTAS_CONFIG.remoteJsonUrl === 'string'
  ? OFERTAS_CONFIG.remoteJsonUrl.trim()
  : '';

let modalOfertas = null;
let ofertasJaCarregadas = false;
let recaptchaVerificado = false;

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
  if (!oferta) {
    return false;
  }

  const ativa = typeof oferta.ativa === 'boolean' ? oferta.ativa : true;
  return ativa && dentroDaVigencia(oferta.dataInicio, oferta.dataFim);
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

function extrairListaLojas(oferta) {
  if (!oferta) {
    return [];
  }

  const lojas = Array.isArray(oferta.lojasParticipantes)
    ? oferta.lojasParticipantes
    : Array.isArray(oferta.nomesLojasParticipantes)
      ? oferta.nomesLojasParticipantes
      : [];

  return lojas
    .filter(loja => typeof loja === 'string')
    .map(loja => loja.trim())
    .filter(Boolean);
}

function normalizarOfertaBackend(oferta) {
  const lojas = extrairListaLojas(oferta);
  if (lojas.length === 0) {
    return [];
  }

  const dataInicio = typeof oferta.dataInicio === 'string'
    ? oferta.dataInicio
    : typeof oferta.vigenciaInicio === 'string'
      ? oferta.vigenciaInicio
      : typeof oferta.vigencia?.inicio === 'string'
        ? oferta.vigencia.inicio
        : '';

  const dataFim = typeof oferta.dataFim === 'string'
    ? oferta.dataFim
    : typeof oferta.vigenciaFim === 'string'
      ? oferta.vigenciaFim
      : typeof oferta.vigencia?.fim === 'string'
        ? oferta.vigencia.fim
        : '';

  const urlArquivo = typeof oferta.arquivoUrl === 'string'
    ? oferta.arquivoUrl.trim()
    : typeof oferta.urlArquivo === 'string'
      ? oferta.urlArquivo.trim()
      : '';
  const imagemArquivo = typeof oferta.imagemUrl === 'string' ? oferta.imagemUrl.trim() : '';

  return lojas.map(loja => ({
    id: oferta.id || `${loja}-${dataInicio || 'sem-data'}`,
    cidade: loja,
    url: urlArquivo,
    imagem: imagemArquivo,
    mensagemSemFolheto: oferta.mensagemSemFolheto || 'Sem folheto disponível no momento',
    ativa: Boolean(oferta.ativa),
    dataInicio,
    dataFim
  }));
}

function normalizarPayloadOfertas(payload) {
  if (Array.isArray(payload?.ofertasPorCidade)) {
    return payload;
  }

  if (!Array.isArray(payload?.ofertas)) {
    return payload;
  }

  const ofertasPorCidade = payload.ofertas.flatMap(normalizarOfertaBackend);

  return {
    titulo: payload.titulo || 'Ofertas válidas por loja',
    ofertasPorCidade
  };
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
    <h1>${escaparHtml(titulo)}</h1>
    <p class="ofertas-subtitulo">Clique na sua loja para abrir as ofertas válidas.</p>
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
    <h1>${escaparHtml(oferta.titulo || 'Oferta')}</h1>
    <img src="${escaparHtml(oferta.imagem || '')}" loading="lazy" alt="${escaparHtml(oferta.alt || 'Oferta da semana')}">
  `).join('');

  container.innerHTML = `
    ${ofertasHTML}
    ${criarBotaoTopo()}
  `;
}

async function carregarPayloadDeOfertas() {
  const urls = [];

  if (OFERTAS_REMOTE_JSON_URL) {
    urls.push(OFERTAS_REMOTE_JSON_URL);
  }

  urls.push(OFERTAS_JSON_PATH_LOCAL);

  let ultimoErro = null;

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Falha ao carregar ofertas em ${url}: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      ultimoErro = error;
      console.error(`Erro ao carregar ${url}:`, error);
    }
  }

  throw ultimoErro || new Error('Falha ao carregar ofertas');
}

async function gerarOfertas() {
  if (ofertasJaCarregadas) {
    return;
  }

  const container = document.getElementById('ofertas-dinamicas') || document.querySelector('.ofertas .container');
  if (!container) {
    return;
  }

  try {
    const payloadBruto = await carregarPayloadDeOfertas();
    const payload = normalizarPayloadOfertas(payloadBruto);

    if (Array.isArray(payload.ofertasPorCidade)) {
      renderBotoesPorCidade(container, payload);
    } else {
      renderFormatoLegado(container, payload);
    }

    ofertasJaCarregadas = true;
  } catch (error) {
    console.error('Erro ao carregar ofertas:', error);
    renderSemOferta(container, 'Nao foi possivel carregar as ofertas agora. Tente novamente em instantes.');
  }
}

function atualizarStatusCaptcha(mensagem, tipo) {
  const status = document.getElementById('ofertas-captcha-status');
  if (!status) {
    return;
  }

  status.textContent = mensagem;
  status.classList.remove('erro', 'sucesso');

  if (tipo === 'erro') {
    status.classList.add('erro');
  }

  if (tipo === 'sucesso') {
    status.classList.add('sucesso');
  }
}

function liberarOfertasComCaptcha() {
  const gate = document.getElementById('ofertas-captcha-gate');
  if (!gate) {
    gerarOfertas();
    return;
  }

  gate.classList.add('ofertas-captcha-gate--liberado');
  atualizarStatusCaptcha('Verificação concluída. Carregando ofertas...', 'sucesso');
  gerarOfertas();
}

function bloquearOfertasComCaptcha(mensagem) {
  const gate = document.getElementById('ofertas-captcha-gate');
  if (!gate) {
    return;
  }

  gate.classList.remove('ofertas-captcha-gate--liberado');
  atualizarStatusCaptcha(mensagem, 'erro');
}

function inicializarCaptchaOfertas() {
  const gate = document.getElementById('ofertas-captcha-gate');
  if (!gate) {
    gerarOfertas();
    return;
  }

  window.ofertasRecaptchaCallback = function() {
    recaptchaVerificado = true;
    liberarOfertasComCaptcha();
  };

  window.ofertasRecaptchaExpiredCallback = function() {
    recaptchaVerificado = false;
    bloquearOfertasComCaptcha('A verificação expirou. Confirme novamente para acessar as ofertas.');
  };

  window.ofertasRecaptchaErrorCallback = function() {
    recaptchaVerificado = false;
    bloquearOfertasComCaptcha('Não foi possível validar o reCAPTCHA. Tente novamente.');
  };

  if (window.grecaptcha) {
    atualizarStatusCaptcha('Confirme o reCAPTCHA para visualizar os folhetos.', 'info');
  } else {
    bloquearOfertasComCaptcha('Carregando reCAPTCHA... se não aparecer, atualize a página.');
  }
}

function inicializarPaginaOfertas() {
  criarModalOfertas();
  inicializarCaptchaOfertas();
}

document.addEventListener('DOMContentLoaded', inicializarPaginaOfertas);
