// Dados das ofertas (ID + conteúdo básico)
const ofertasData = [
    {
      id: 1,
      titulo: "Confira as ofertas desta Semana válidas para toda a Rede Máximo de Supermercados",
      imagem: "assets/images/pages/pages/ofertas/folheto.png",
      alt: "Folheto promocional com as ofertas válidas no momento",
      ativa: true
    },
    {
      id: 2,
      titulo: "Ofertas Especiais de Verão - Rede Máximo",
      imagem: "assets/images/pages/pages/ofertas/folheto-verao.png",
      alt: "Folheto promocional de verão com ofertas especiais",
      ativa: false
    },
    {
      id: 3,
      titulo: "Promoções de Natal - Descontos Imperdíveis",
      imagem: "assets/images/pages/pages/ofertas/folheto-natal.png",
      alt: "Folheto promocional de Natal com descontos especiais",
      ativa: false
    }
    // Adicione mais ofertas aqui conforme necessário
  ];
  
  // Função para gerar as ofertas
  function gerarOfertas() {
    const container = document.querySelector('.ofertas .container');
    
    // Filtrar apenas ofertas ativas
    const ofertasAtivas = ofertasData.filter(oferta => oferta.ativa);
    
    if (ofertasAtivas.length === 0) {
      container.innerHTML = `
        <h1>Nenhuma oferta disponível no momento</h1>
        <p style="text-align: center; color: #666; padding: 50px 20px; font-family: 'MyriadProRegular', sans-serif;">
          Fique atento! Em breve teremos novas ofertas para você.
        </p>
        <div class="botao-voltar-container">
          <a href="#topo" class="botao-voltar">Topo^</a>
        </div>
      `;
      return;
    }
    
    // Gerar HTML para cada oferta ativa
    const ofertasHTML = ofertasAtivas.map(oferta => `
      <h1>${oferta.titulo}</h1>
      <img src="${oferta.imagem}" loading="lazy" alt="${oferta.alt}">
    `).join('');
    
    // Inserir as ofertas no container mantendo o botão "Topo"
    container.innerHTML = `
      ${ofertasHTML}
      <div class="botao-voltar-container">
        <a href="#topo" class="botao-voltar">Topo^</a>
      </div>
    `;
    
    console.log(`✅ ${ofertasAtivas.length} oferta(s) carregada(s) com CSS original mantido`);
  }
  
  // Função para ativar/desativar ofertas (útil para administração)
  function alterarStatusOferta(id, ativa) {
    const oferta = ofertasData.find(o => o.id === id);
    if (oferta) {
      oferta.ativa = ativa;
      gerarOfertas(); // Recarregar as ofertas
      console.log(`Oferta ID ${id} ${ativa ? 'ativada' : 'desativada'}`);
    } else {
      console.warn(`Oferta com ID ${id} não encontrada`);
    }
  }
  
  // Função para adicionar nova oferta dinamicamente
  function adicionarOferta(dadosOferta) {
    const novoId = Math.max(...ofertasData.map(o => o.id)) + 1;
    const novaOferta = {
      id: novoId,
      titulo: dadosOferta.titulo || "Nova Oferta",
      imagem: dadosOferta.imagem || "assets/images/pages/pages/ofertas/folheto-default.png",
      alt: dadosOferta.alt || "Folheto promocional",
      ativa: dadosOferta.ativa !== undefined ? dadosOferta.ativa : true
    };
    
    ofertasData.push(novaOferta);
    gerarOfertas(); // Recarregar as ofertas
    console.log(`Nova oferta adicionada com ID ${novoId}`);
    return novoId;
  }
  
  // Inicializar quando a página carregar
  document.addEventListener('DOMContentLoaded', gerarOfertas);
  
  // Exportar funções para uso global (opcional, para administração via console)
  window.ofertasManager = {
    dados: ofertasData,
    alterarStatus: alterarStatusOferta,
    adicionar: adicionarOferta,
    recarregar: gerarOfertas
  };