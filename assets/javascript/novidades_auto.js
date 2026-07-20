let novidadesData = [];

// Carregar do JSON
fetch('assets/data/novidades.json')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(data => {
    novidadesData = data.novidades || [];
    gerarNovidades();
  })
  .catch(error => {
    console.error('Erro ao carregar novidades:', error);
    const container = document.getElementById('novidades-container');
    if (container) {
      container.innerHTML = '<div class="novidade-card"><p style="text-align: center; color: #666;">Erro ao carregar novidades.</p></div>';
    }
  });

// Função para gerar as novidades
function gerarNovidades() {
  const container = document.getElementById('novidades-container');
  
  // Filtrar apenas novidades ativas
  const novidadesAtivas = novidadesData.filter(novidade => novidade.ativa);
  
  if (novidadesAtivas.length === 0) {
    container.innerHTML = `
      <div class="novidade-card">
        <p style="text-align: center; color: #666; padding: 50px 20px;">
          Nenhuma novidade disponível no momento.
        </p>
      </div>
    `;
    return;
  }
  
  // Gerar HTML com o padrão original
  container.innerHTML = novidadesAtivas.map(novidade => `
    <div class="novidade-card">
      <img src="${novidade.imagem}" loading="lazy" alt="${novidade.titulo}">
      <p>${novidade.descricao1}</p>
      ${novidade.descricao2 ? `<p>${novidade.descricao2}</p>` : ''}
    </div>
  `).join('');
  
  console.log(`✅ ${novidadesAtivas.length} novidade(s) carregada(s)`);
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', gerarNovidades);