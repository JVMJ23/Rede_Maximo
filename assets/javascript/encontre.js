document.addEventListener('DOMContentLoaded', function() {
    const lojaLinks = document.querySelectorAll('.loja a[data-target-area]');
    const mapImage = document.querySelector('.mapa img');
    const areas = document.querySelectorAll('map area');
  
    let activeLojaLink = null; // Rastreia qual link de loja está ativo
  
    // Verifica se os elementos necessários existem
    if (!lojaLinks.length) {
        console.warn('Nenhum link de loja encontrado. Verifique se os elementos possuem a classe ".loja" e atributo "data-target-area".');
        return;
    }
    
    if (!areas.length) {
        console.warn('Nenhuma área do mapa encontrada. Verifique se existe um elemento <map> com <area>s.');
        return;
    }
    
    console.log(`Sistema iniciado: ${lojaLinks.length} lojas e ${areas.length} áreas encontradas.`);
  
    // Remove o destaque de qualquer link de loja ativo
    function removeHighlight() {
        if (activeLojaLink) {
            const lojaElement = activeLojaLink.closest('.loja');
            if (lojaElement) {
                lojaElement.classList.remove('destacada');
                // Remove também classes de tema se existirem
                lojaElement.classList.remove('theme-green', 'theme-red');
            }
            activeLojaLink = null;
        }
    }
  
    // Adiciona destaque a um link de loja específico
    function addHighlight(linkElement, theme = '') {
        removeHighlight(); // Primeiro, remove destaques anteriores
        if (linkElement) {
            const lojaElement = linkElement.closest('.loja');
            if (lojaElement) {
                lojaElement.classList.add('destacada');
                // Adiciona tema se especificado
                if (theme && ['theme-green', 'theme-red'].includes(theme)) {
                    lojaElement.classList.add(theme);
                }
                activeLojaLink = linkElement;
            }
        }
    }
    
    // --- EVENTOS DE HOVER APENAS ---
    
    // Hover nas lojas
    lojaLinks.forEach(link => {
        // Quando entra com o mouse
        link.addEventListener('mouseenter', function() {
            const targetAreaId = this.dataset.targetArea;
            const targetArea = document.getElementById(targetAreaId);
            
            if (targetArea) {
                addHighlight(this);
            }
        });
        
        // Quando sai com o mouse
        link.addEventListener('mouseleave', function() {
            removeHighlight();
        });
        
        // Permite que os links funcionem normalmente (abrir Google Maps)
        link.addEventListener('click', function(event) {
            // Não impede o comportamento padrão - link abre normalmente
        });
    });
    
    // Hover nas áreas do mapa
    areas.forEach(area => {
        // Quando entra com o mouse
        area.addEventListener('mouseenter', function() {
            const areaId = this.id;
            const correspondingLojaLink = document.querySelector(`.loja a[data-target-area="${areaId}"]`);
            
            if (correspondingLojaLink) {
                addHighlight(correspondingLojaLink);
            }
        });
        
        // Quando sai com o mouse
        area.addEventListener('mouseleave', function() {
            removeHighlight();
        });
        
        // Clique na área do mapa abre o Google Maps correspondente
        area.addEventListener('click', function(event) {
            event.preventDefault();
            const areaId = this.id;
            const correspondingLojaLink = document.querySelector(`.loja a[data-target-area="${areaId}"]`);
            
            if (correspondingLojaLink && correspondingLojaLink.href) {
                window.open(correspondingLojaLink.href, '_blank');
            }
        });
    });
    
    // --- Funções públicas para uso externo ---
    window.destacarLoja = function(targetAreaId, theme = '') {
        const lojaLink = document.querySelector(`.loja a[data-target-area="${targetAreaId}"]`);
        if (lojaLink) {
            addHighlight(lojaLink, theme);
            return true;
        }
        console.warn(`Loja com data-target-area="${targetAreaId}" não encontrada.`);
        return false;
    };
    
    window.removerDestaqueLoja = function() {
        removeHighlight();
    };
});
function makeMapResponsive() {
    const mapImage = document.querySelector('.mapa img');
    const areas = document.querySelectorAll('map area');
    
    if (!mapImage || !areas.length) return;
    
    // Defina o tamanho original da sua imagem aqui
    const originalWidth = 745;  // SUBSTITUA pelo tamanho real
    const originalHeight = 955; // SUBSTITUA pelo tamanho real
    
    function updateCoords() {
        const currentWidth = mapImage.offsetWidth;
        const currentHeight = mapImage.offsetHeight;
        
        const scaleX = currentWidth / originalWidth;
        const scaleY = currentHeight / originalHeight;
        
        areas.forEach(area => {
            const coords = area.getAttribute('data-original-coords') || area.coords;
            if (!area.getAttribute('data-original-coords')) {
                area.setAttribute('data-original-coords', coords);
            }
            
            const [x, y, r] = coords.split(',').map(Number);
            const newCoords = `${Math.round(x * scaleX)},${Math.round(y * scaleY)},${Math.round(r * Math.min(scaleX, scaleY))}`;
            area.coords = newCoords;
        });
    }
    
    mapImage.onload = updateCoords;
    if (mapImage.complete) updateCoords();
    
    window.addEventListener('resize', () => {
        clearTimeout(window.mapResizeTimeout);
        window.mapResizeTimeout = setTimeout(updateCoords, 100);
    });
}

// Execute quando a página carregar
makeMapResponsive();