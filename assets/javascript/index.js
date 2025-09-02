// Sistema de Slider - Apenas para a página index
document.addEventListener("DOMContentLoaded", function() {
    const slides = document.querySelectorAll('.banner-slider .slide');
    let currentSlide = 0;
    let slideInterval;
    
    // Verifica se existem slides antes de executar
    if (slides.length === 0) return;
    
    // Função para criar os indicadores (bolinhas)
    function createIndicators() {
        const indicatorsContainer = document.querySelector('.slider-indicators');
        
        if (!indicatorsContainer) return;
        
        // Limpa o container de indicadores
        indicatorsContainer.innerHTML = '';
        
        // Cria um indicador para cada slide
        for (let i = 0; i < slides.length; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (i === 0) indicator.classList.add('active');
            
            // Adiciona evento de clique para navegar para o slide correspondente
            indicator.addEventListener('click', function() {
                goToSlide(i);
                resetAutoSlide();
            });
            
            indicatorsContainer.appendChild(indicator);
        }
    }
    
    // Função para ir para um slide específico
    function goToSlide(index) {
        // Remove a classe 'active' do slide atual
        slides[currentSlide].classList.remove('active');
        
        // Remove a classe 'active' do indicador atual
        const indicators = document.querySelectorAll('.indicator');
        if (indicators[currentSlide]) {
            indicators[currentSlide].classList.remove('active');
        }
        
        // Atualiza o índice do slide atual
        currentSlide = index;
        
        // Adiciona a classe 'active' ao novo slide e indicador
        slides[currentSlide].classList.add('active');
        if (indicators[currentSlide]) {
            indicators[currentSlide].classList.add('active');
        }
    }
    
    // Função para ir para o próximo slide
    function nextSlide() {
        const newIndex = (currentSlide + 1) % slides.length;
        goToSlide(newIndex);
    }
    
    // Função para ir para o slide anterior
    function prevSlide() {
        const newIndex = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(newIndex);
    }
    
    // Função para resetar o timer automático
    function resetAutoSlide() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    // Inicializa o slider
    createIndicators();
    
    // Configura o slider automático (5 segundos)
    slideInterval = setInterval(nextSlide, 5000);
    
    // Configura os controles de navegação (setas)
    const prevControl = document.querySelector('.slider-controls .prev');
    const nextControl = document.querySelector('.slider-controls .next');
    
    if (prevControl) {
        prevControl.addEventListener('click', function() {
            prevSlide();
            resetAutoSlide();
        });
    }
    
    if (nextControl) {
        nextControl.addEventListener('click', function() {
            nextSlide();
            resetAutoSlide();
        });
    }
    
    // Pausa o slider quando o usuário passa o mouse sobre o banner
    const bannerSlider = document.querySelector('.banner-slider');
    if (bannerSlider) {
        bannerSlider.addEventListener('mouseenter', function() {
            clearInterval(slideInterval);
        });
        
        bannerSlider.addEventListener('mouseleave', function() {
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
});