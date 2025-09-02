// Dados das novidades (ID + conteúdo básico)
const novidadesData = [
  {
    id: 1,
    titulo: "Festival Vegano 2025",
    descricao1: "Bem-vindo ao nosso Festival Vegano, o evento perfeito para quem busca produtos naturais e veganos com preços incríveis. Preparamos uma seleção de ofertas e promoções para você encher o carrinho e experimentar novos sabores.",
    descricao2: "",
    imagem: "assets/images/pages/pages/index/festival vegano-02.png",
    ativa: true
  },
  {
    id: 2,
    titulo: "FoliaMax 2025",
    descricao1: "O calor do carnaval já está no ar, e com ele, a nossa seleção de ofertas do FoliaMax para você aproveitar a folia sem preocupações.",
    descricao2: "",
    imagem: "assets/images/pages/pages/index/foliamax-02.png", 
    ativa: true 
  },
  // Adicione mais novidades aqui conforme necessário
];

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
  
  // Gerar HTML 
  container.innerHTML = novidadesAtivas.map(novidade => `
    <div class="novidade-card">
      <img src="${novidade.imagem}" loading="lazy" alt="${novidade.titulo}">
      <p>${novidade.descricao1}</p>
      <p>${novidade.descricao2}</p>
    </div>
  `).join('');
  
  console.log(`✅ ${novidadesAtivas.length} novidade(s) carregada(s) com CSS original`);
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', gerarNovidades);
