// Dados dos slides da página principal
const slidesData = [
  {
    id: 1,
    imagem: "assets/images/pages/pages/index/festival vegano-02.png",
    alt: "Imagem descritiva do Festival Vegano",
    link: "novidades.html"
  },
  {
    id: 2,
    imagem: "assets/images/pages/pages/index/foliamax-02.png",
    alt: "Imagem descritiva do Folia-Max",
    link: "novidades.html"
  }
];

// Função para gerar e controlar os slides
function gerarSlides() {
  const slider = document.querySelector('.banner-slider');
  
  if (!slider) return;
  
  let currentSlide = 0;
  const slides = slidesData;
  const totalSlides = slides.length;
  
  // Renderiza os slides no HTML
  function renderSlides() {
    slider.innerHTML = '';
    
    slides.forEach((slide, index) => {
      const slideDiv = document.createElement('div');
      slideDiv.classList.add('slide');
      if (index === 0) slideDiv.classList.add('active');
      
      slideDiv.innerHTML = `
        <div class="slide-content">
          <button onclick="window.location.href='${slide.link}'">
            <img src="${slide.imagem}" alt="${slide.alt}" loading="lazy">
          </button>
        </div>
      `;
      
      slider.appendChild(slideDiv);
    });
    
    // Cria indicadores (bolinhas)
    const indicatorsDiv = document.createElement('div');
    indicatorsDiv.classList.add('slider-indicators');
    
    slides.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.classList.add('indicator');
      if (index === 0) indicator.classList.add('active');
      
      indicator.addEventListener('click', () => {
        goToSlide(index);
        resetAutoSlide();
      });
      
      indicatorsDiv.appendChild(indicator);
    });
    
    slider.appendChild(indicatorsDiv);
    
    // Cria controles setas
    const controlsDiv = document.createElement('div');
    controlsDiv.classList.add('slider-controls');
    
    const prevSpan = document.createElement('span');
    prevSpan.classList.add('prev');
    prevSpan.title = 'Slide anterior';
    prevSpan.textContent = '❮';
    prevSpan.addEventListener('click', () => {
      prevSlide();
      resetAutoSlide();
    });
    
    const nextSpan = document.createElement('span');
    nextSpan.classList.add('next');
    nextSpan.title = 'Próximo slide';
    nextSpan.textContent = '❯';
    nextSpan.addEventListener('click', () => {
      nextSlide();
      resetAutoSlide();
    });
    
    controlsDiv.appendChild(prevSpan);
    controlsDiv.appendChild(nextSpan);
    slider.appendChild(controlsDiv);
  }
  
  // Função para ir para um slide específico
  function goToSlide(index) {
    const slideElements = document.querySelectorAll('.banner-slider .slide');
    const indicators = document.querySelectorAll('.slider-indicators .indicator');
    
    slideElements[currentSlide].classList.remove('active');
    if (indicators[currentSlide]) {
      indicators[currentSlide].classList.remove('active');
    }
    
    currentSlide = index;
    
    slideElements[currentSlide].classList.add('active');
    if (indicators[currentSlide]) {
      indicators[currentSlide].classList.add('active');
    }
  }
  
  // Próximo slide
  function nextSlide() {
    const newIndex = (currentSlide + 1) % totalSlides;
    goToSlide(newIndex);
  }
  
  // Slide anterior
  function prevSlide() {
    const newIndex = (currentSlide - 1 + totalSlides) % totalSlides;
    goToSlide(newIndex);
  }
  
  // Resetar auto-play
  let slideInterval;
  
  function resetAutoSlide() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
  }
  
  // Inicializa
  renderSlides();
  slideInterval = setInterval(nextSlide, 5000);
  
  // Pausa ao passar mouse
  slider.addEventListener('mouseenter', () => clearInterval(slideInterval));
  slider.addEventListener('mouseleave', () => resetAutoSlide());
  
  console.log(`✅ ${totalSlides} slide(s) carregado(s)`);
}

// Executa quando o DOM está pronto
document.addEventListener('DOMContentLoaded', gerarSlides);
