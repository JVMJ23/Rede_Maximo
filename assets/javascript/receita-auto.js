let receitasData = [];

// Carregar dados do JSON
fetch('../../assets/data/receitas.json')
  .then(response => response.json())
  .then(data => {
    receitasData = data.receitas;
    carregarReceita();
  })
  .catch(error => {
    console.error('Erro ao carregar receitas:', error);
  });

function pegarId() {
  const url = new URLSearchParams(window.location.search);
  return parseInt(url.get('id'));
}

function carregarReceita() {
  const id = pegarId();
  const receita = receitasData.find(r => r.id === id);
  
  if (!receita) {
    document.getElementById('recipe-content').innerHTML = '<p>Receita não encontrada</p>';
    return;
  }
  
  const nomeImagem = receita.imagem.split('/').pop();
  
  const ingredientesHTML = receita.ingredientes.map(grupo => {
    return `
      <h5>${grupo.secao}</h5>
      <ul>
        ${grupo.itens.map(item => `<li>${item}</li>`).join('')}
      </ul>
    `;
  }).join('');
  
  const preparoHTML = receita.modoPreparo.map(passo => `<p>${passo}</p>`).join('');
  
  document.getElementById('recipe-content').innerHTML = `
    <div class="recipe-container">
      <div class="image-ingredients">
        <div class="recipe-image">
          <a href="../../receitas.html">
            <img src="../../assets/images/pages/pages/receitas/${nomeImagem}" 
                 alt="Imagem Ilustrativa - ${receita.nome}, funciona como botão de retorno a página das receitas">
          </a>
        </div>
        <div class="ingredients">
          <h2>Ingredientes</h2>
          ${ingredientesHTML}
        </div>
      </div>
      <div class="instructions">
        <h2>Modo de Preparo</h2>
        ${preparoHTML}
      </div>
    </div>
  `;
  
  document.title = `${receita.nome} | Receitas Máx - Rede Máximo`;
}