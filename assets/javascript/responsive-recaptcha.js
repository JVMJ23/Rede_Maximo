
// Função para ajustar o reCAPTCHA responsivamente
function adjustRecaptcha() {
    setTimeout(function () {
        var recaptchaContainer = document.querySelector('.recaptcha');
        var captcha = document.querySelector('.g-recaptcha');

        if (!recaptchaContainer || !captcha) {
            console.log('reCAPTCHA principal não encontrado ou ainda não carregado, tentando novamente...');
            return;
        }

        var containerWidth = recaptchaContainer.offsetWidth;
        var recaptchaStandardWidth = 304;
        var recaptchaStandardHeight = 78;
        var isDesktop = window.innerWidth > 768;

        var scale = 1;
        
        // Só aplicar escala se realmente não couber E não for desktop
        if (containerWidth < recaptchaStandardWidth && !isDesktop) {
            scale = containerWidth / recaptchaStandardWidth;
        }

        if (scale < 1 && !isDesktop) {
            captcha.style.transform = 'scale(' + scale + ')';
            captcha.style.transformOrigin = 'left top';
            captcha.style.webkitTransform = 'scale(' + scale + ')';
            captcha.style.webkitTransformOrigin = 'left top';
            captcha.style.width = recaptchaStandardWidth + 'px';
            captcha.style.height = recaptchaStandardHeight + 'px';

            recaptchaContainer.style.height = (recaptchaStandardHeight * scale) + 'px';
            recaptchaContainer.style.width = (recaptchaStandardWidth * scale) + 'px';
            recaptchaContainer.style.overflow = 'visible';

            console.log('reCAPTCHA widget ajustado para mobile - Scale:', scale);
        } else {
            // Reset para estado normal (desktop ou quando cabe)
            captcha.style.transform = 'none';
            captcha.style.webkitTransform = 'none';
            captcha.style.width = 'auto';
            captcha.style.height = 'auto';
            recaptchaContainer.style.height = 'auto';
            recaptchaContainer.style.width = 'auto';
            recaptchaContainer.style.overflow = 'visible';
            console.log('reCAPTCHA widget resetado para tamanho normal (desktop).');
        }
    }, 200);
}

// ✅ Versão corrigida: comportamento específico para desktop vs mobile
function adjustRecaptchaChallenge() {
    var challengeFrame = document.querySelector('iframe[src*="recaptcha"][src*="bframe"]');

    if (challengeFrame) {
        var container = challengeFrame.parentElement;
        var isDesktop = window.innerWidth > 768;
        var isMobile = window.innerWidth <= 768;
        var isSmallMobile = window.innerWidth <= 480;

        if (container) {
            if (isDesktop) {
                // ✅ CONFIGURAÇÃO ESPECÍFICA PARA DESKTOP
                container.style.cssText = `
                    position: fixed !important;
                    top: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background-color: rgba(255, 255, 255, 0.6) !important;
                    z-index: 2147483647 !important;
                    padding: 20px !important;
                    margin: 0 !important;
                    box-sizing: border-box !important;
                    overflow: visible !important;
                `;
            } else {
                // Configuração para mobile)
                container.style.cssText = `
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background-color: rgba(0, 0, 0, 0.6) !important;
                    z-index: 2147483647 !important;
                    padding: ${isSmallMobile ? '5px' : '10px'} !important;
                    margin: 0 !important;
                    box-sizing: border-box !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    -webkit-overflow-scrolling: touch !important;
                `;
            }
        }

        if (isDesktop) {
            // ✅ CONFIGURAÇÃO ESPECÍFICA PARA DESKTOP
            challengeFrame.style.cssText += `
                width: auto !important;
                height: auto !important;
                min-height: 700px !important;
                max-height: 80vh !important;
                max-width: 750px !important;
                min-width: 550px !important;
                margin: auto 0!important;
                display: block !important;
                transform: none !important;
                border: none !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
                background: white !important;
                overflow: auto !important;
            `;
        } else {
            // Configuração para mobile
            challengeFrame.style.cssText += `
                width: ${isMobile ? '100%' : 'auto'} !important;
                height: ${isMobile ? '85vh' : 'auto'} !important;
                min-height: ${isSmallMobile ? '580px' : isMobile ? '620px' : '450px'} !important;
                max-width: ${isSmallMobile ? '98vw' : isMobile ? '95vw' : '500px'} !important;
                min-width: ${isMobile ? '280px' : '300px'} !important;
                margin: auto !important;
                display: block !important;
                transform: none !important;
                border: none !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
                background: white !important;
                overflow: auto !important;
            `;
        }

        // ✅ Ajuste específico para desktop
        if (isDesktop) {
            setTimeout(function() {
                if (challengeFrame.contentWindow) {
                    try {
                        var contentHeight = challengeFrame.contentWindow.document.body.scrollHeight;
                        if (contentHeight > 500) {
                            var adjustedHeight = Math.min(contentHeight + 50, window.innerHeight * 0.8);
                            challengeFrame.style.height = adjustedHeight + 'px';
                        }
                    } catch (e) {
                        // Fallback para desktop: altura fixa adequada
                        challengeFrame.style.height = '650px';
                        console.log('Usando altura fallback para desktop');
                    }
                }
            }, 300);
        } else {
            
            setTimeout(function() {
                if (challengeFrame.contentWindow) {
                    try {
                        challengeFrame.style.height = challengeFrame.contentWindow.document.body.scrollHeight + 'px';
                    } catch (e) {
                        console.log('Usando fallback para altura do iframe mobile');
                    }
                }
            }, 500);
        }

        console.log('Desafio reCAPTCHA ajustado para', isDesktop ? 'desktop' : 'mobile');
    }
}

// Detecta quando o reCAPTCHA principal estiver carregado
function waitForRecaptcha(callback, maxAttempts = 30) {
    let attempts = 0;
    function check() {
        let recaptcha = document.querySelector('.g-recaptcha');
        let recaptchaFrame = document.querySelector('iframe[src*="recaptcha"][src*="anchor"]');
        if (recaptcha && recaptchaFrame) {
            callback();
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(check, 250);
        } else {
            console.warn('reCAPTCHA principal não foi carregado após', maxAttempts, 'tentativas.');
        }
    }
    check();
}

// Aguarda e ajusta janela de desafio do reCAPTCHA
function waitForChallengeWindow(callback, maxAttempts = 50) {
    let attempts = 0;
    function check() {
        let challengeFrame = document.querySelector('iframe[src*="recaptcha"][src*="bframe"]');
        let fixedContainer = document.querySelector('body > div[style*="position: fixed"]');
        if (challengeFrame && fixedContainer) {
            callback();
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(check, 200);
        } else {
            console.warn('Janela do desafio reCAPTCHA não foi carregada após', maxAttempts, 'tentativas.');
        }
    }
    check();
}

//  CSS responsivo corrigido com regras específicas para desktop
function addRecaptchaResponsiveCSS() {
    let existingStyle = document.getElementById('recaptcha-responsive-css');
    if (existingStyle) existingStyle.remove();

    let css = `
        <style id="recaptcha-responsive-css">
        /* ========== CONFIGURAÇÕES PARA DESKTOP ========== */
        @media screen and (min-width: 769px) {
            /* Container principal do desafio - Desktop */
            body > div[style*="position: fixed"][style*="z-index: 2000000000"],
            body > div[style*="position: fixed"][style*="z-index: 2147483647"] {
                width: 100vw !important;
                height: 100vh !important;
                top: 0 !important;
                left: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background-color: rgba(0, 0, 0, 0.6) !important;
                z-index: 2147483647 !important;
                padding: 20px !important;
                margin: 0 !important;
                box-sizing: border-box !important;
                overflow: hidden !important;
            }

            /* Iframe do desafio - Desktop */
            iframe[src*="recaptcha"][src*="bframe"] {
                width: auto !important;
                height: auto !important;
                min-height: 650px !important;
                max-height: 80vh !important;
                max-width: 700px !important;
                min-width: 500px !important;
                border: none !important;
                display: block !important;
                margin: auto !important;
                transform: none !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
                background: white !important;
                overflow: auto !important;
            }
        }

        /* ========== CONFIGURAÇÕES PARA MOBILE (mantém o original) ========== */
        @media screen and (max-width: 768px) {
            /* Container principal do desafio - Mobile */
            body > div[style*="position: fixed"][style*="z-index: 2000000000"],
            body > div[style*="position: fixed"][style*="z-index: 2147483647"] {
                width: 100vw !important;
                height: 100vh !important;
                top: 0 !important;
                left: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background-color: rgba(0, 0, 0, 0.6) !important;
                z-index: 2147483647 !important;
                padding: 8px !important;
                margin: 0 !important;
                box-sizing: border-box !important;
                overflow-y: auto !important;
                overflow-x: hidden !important;
                -webkit-overflow-scrolling: touch !important;
            }

            /* Iframe do desafio - Mobile */
            iframe[src*="recaptcha"][src*="bframe"] {
                width: 100% !important;
                height: 85vh !important;
                min-height: 620px !important;
                max-width: 95vw !important;
                min-width: 280px !important;
                border: none !important;
                display: block !important;
                margin: auto !important;
                transform: none !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
                background: white !important;
                overflow: auto !important;
            }
        }

        /* Configurações para telas muito pequenas */
        @media screen and (max-width: 480px) {
            body > div[style*="position: fixed"][style*="z-index: 2000000000"],
            body > div[style*="position: fixed"][style*="z-index: 2147483647"] {
                padding: 5px !important;
            }

            iframe[src*="recaptcha"][src*="bframe"] {
                height: 80vh !important;
                min-height: 580px !important;
                max-width: 98vw !important;
                min-width: 270px !important;
            }
        }

        /* NÃO bloqueia o scroll da página principal */
        body.recaptcha-challenge-open {
            /* Permite que a página mantenha o scroll normal */
        }

        /* Melhora para iOS Safari */
        @supports (-webkit-touch-callout: none) {
            @media screen and (max-width: 768px) {
                body > div[style*="position: fixed"][style*="z-index: 2000000000"],
                body > div[style*="position: fixed"][style*="z-index: 2147483647"] {
                    -webkit-overflow-scrolling: touch !important;
                }
            }
        }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', css);
    console.log('CSS responsivo do reCAPTCHA injetado com correções para desktop.');
}

// ✅ Função melhorada para garantir que o desafio apareça completo
function handleChallengeAppearance() {
    setTimeout(function() {
        adjustRecaptchaChallenge();
        
        var isDesktop = window.innerWidth > 768;
        
        // Aguarda mais um pouco e força o recalculo da altura
        setTimeout(function() {
            var challengeFrame = document.querySelector('iframe[src*="recaptcha"][src*="bframe"]');
            if (challengeFrame) {
                if (isDesktop) {
                    // ✅ Lógica específica para desktop
                    challengeFrame.style.minHeight = '600px';
                    challengeFrame.style.maxHeight = '80vh';
                    challengeFrame.style.height = 'auto';
                    
                    // Tenta ajustar baseado no conteúdo
                    try {
                        var contentHeight = challengeFrame.contentWindow.document.documentElement.scrollHeight;
                        if (contentHeight > 500) {
                            var adjustedHeight = Math.min(contentHeight + 50, window.innerHeight * 0.8);
                            challengeFrame.style.height = adjustedHeight + 'px';
                        } else {
                            challengeFrame.style.height = '550px';
                        }
                    } catch (e) {
                        challengeFrame.style.height = '550px';
                        console.log('Usando altura fallback para desktop');
                    }
                } else {
                    // Lógica EXATAMENTE igual ao código original para mobile
                    var isMobile = window.innerWidth <= 768;
                    var isSmallMobile = window.innerWidth <= 480;
                    var minHeight = isSmallMobile ? '580px' : isMobile ? '620px' : '450px';
                    
                    challengeFrame.style.minHeight = minHeight;
                    challengeFrame.style.height = isMobile ? '85vh' : 'auto';
                    
                    // Tenta ajustar baseado no conteúdo se possível (código original)
                    try {
                        var contentHeight = challengeFrame.contentWindow.document.documentElement.scrollHeight;
                        if (contentHeight > 450) {
                            // Garante pelo menos 50px extras para margem
                            var adjustedHeight = Math.min(contentHeight + 80, window.innerHeight * 0.9);
                            challengeFrame.style.height = adjustedHeight + 'px';
                        }
                    } catch (e) {
                        // Fallback: usa altura fixa adequada que garante que tudo apareça
                        challengeFrame.style.height = isMobile ? '85vh' : '650px';
                        console.log('Usando altura fallback para o desafio');
                    }
                }
                
                console.log('Altura do desafio reajustada para:', challengeFrame.style.height, '(', isDesktop ? 'desktop' : 'mobile', ')');
            }
        }, isDesktop ? 500 : 1000);
    }, 100);
}

// Quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function () {
    addRecaptchaResponsiveCSS();
    waitForRecaptcha(adjustRecaptcha);
});

// Quando a página for totalmente carregada
window.addEventListener('load', function () {
    setTimeout(function () {
        waitForRecaptcha(adjustRecaptcha);
        waitForChallengeWindow(handleChallengeAppearance);
    }, 500);
});

// Em redimensionamento de tela
window.addEventListener('resize', function () {
    clearTimeout(window.recaptchaResizeTimeout);
    window.recaptchaResizeTimeout = setTimeout(function () {
        adjustRecaptcha();
        adjustRecaptchaChallenge();
    }, 100);
});

// Callback da API do reCAPTCHA
window.onRecaptchaLoad = function () {
    console.log('onRecaptchaLoad acionado.');
    setTimeout(function () {
        adjustRecaptcha();
        waitForChallengeWindow(handleChallengeAppearance);
    }, 200);
};

// MutationObserver melhorado com detecção de desktop/mobile
if (window.MutationObserver) {
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    var node = mutation.addedNodes.item(i);
                    if (node && node.nodeType === 1) {
                        if (node.matches && node.matches('.g-recaptcha, iframe[src*="recaptcha"][src*="anchor"]')) {
                            setTimeout(adjustRecaptcha, 300);
                        }

                        if (node.matches && (
                            node.matches('iframe[src*="recaptcha"][src*="bframe"]') ||
                            (node.tagName.toLowerCase() === 'div' && node.style.position === 'fixed')
                        )) {
                            document.body.classList.add('recaptcha-challenge-open');
                            handleChallengeAppearance();
                        }
                    }
                }
            } else if (mutation.removedNodes && mutation.removedNodes.length > 0) {
                for (var i = 0; i < mutation.removedNodes.length; i++) {
                    var node = mutation.removedNodes.item(i);
                    if (node && node.nodeType === 1 && node.tagName.toLowerCase() === 'div' && node.style.position === 'fixed') {
                        document.body.classList.remove('recaptcha-challenge-open');
                    }
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });
    console.log('MutationObserver iniciado com detecção desktop/mobile.');
}

// Monitoramento de cliques no widget
document.addEventListener('click', function (event) {
    var recaptchaElement = event.target.closest('.g-recaptcha, iframe[src*="recaptcha"]');
    if (recaptchaElement) {
        console.log('Clique detectado no reCAPTCHA.');
        setTimeout(function () {
            waitForChallengeWindow(handleChallengeAppearance);
        }, 200);
    }
});

// Inicialização manual se necessário
window.initRecaptchaResponsive = function () {
    console.log('initRecaptchaResponsive chamado.');
    addRecaptchaResponsiveCSS();
    adjustRecaptcha();
    adjustRecaptchaChallenge();
};

// ✅ Função melhorada para debug com detecção desktop/mobile
window.debugRecaptcha = function() {
    console.log('=== DEBUG RECAPTCHA ===');
    console.log('Viewport:', window.innerWidth + 'x' + window.innerHeight);
    console.log('Dispositivo:', window.innerWidth > 768 ? 'DESKTOP' : 'MOBILE');
    
    var challengeFrame = document.querySelector('iframe[src*="recaptcha"][src*="bframe"]');
    var container = document.querySelector('body > div[style*="position: fixed"]');
    
    console.log('Challenge iframe:', challengeFrame);
    console.log('Container:', container);
    
    if (challengeFrame) {
        console.log('Iframe dimensions:', challengeFrame.offsetWidth + 'x' + challengeFrame.offsetHeight);
        console.log('Iframe style height:', challengeFrame.style.height);
        console.log('Iframe style minHeight:', challengeFrame.style.minHeight);
        console.log('Iframe style maxHeight:', challengeFrame.style.maxHeight);
        
        try {
            var contentHeight = challengeFrame.contentWindow.document.documentElement.scrollHeight;
            console.log('Iframe content height:', contentHeight);
        } catch (e) {
            console.log('Cannot access iframe content height (CORS)');
        }
    }
    
    if (container) {
        console.log('Container dimensions:', container.offsetWidth + 'x' + container.offsetHeight);
    }
    
    console.log('======================');
};

// ✅ Função para forçar reajuste específico para desktop ou mobile
window.forceRecaptchaResize = function() {
    console.log('Forçando reajuste do reCAPTCHA...');
    var challengeFrame = document.querySelector('iframe[src*="recaptcha"][src*="bframe"]');
    if (challengeFrame) {
        var isDesktop = window.innerWidth > 768;
        
        if (isDesktop) {
            challengeFrame.style.height = '650px';
            challengeFrame.style.minHeight = '600px';
            challengeFrame.style.maxHeight = '80vh';
            challengeFrame.style.maxWidth = '680px';
            challengeFrame.style.minWidth = '400px';
            console.log('Reajuste DESKTOP aplicado');
        } else {
            var isMobile = window.innerWidth <= 768;
            var isSmallMobile = window.innerWidth <= 480;
            
            challengeFrame.style.height = isMobile ? '85vh' : 'auto';
            challengeFrame.style.minHeight = isSmallMobile ? '580px' : isMobile ? '620px' : '450px';
            challengeFrame.style.maxWidth = isSmallMobile ? '98vw' : isMobile ? '95vw' : '500px';
            challengeFrame.style.minWidth = isMobile ? '280px' : '300px';
            console.log('Reajuste MOBILE aplicado (código original)');
        }
        
        console.log('Reajuste aplicado - Nova altura:', challengeFrame.style.height);
        console.log('Altura mínima:', challengeFrame.style.minHeight);
    } else {
        console.log('Iframe do desafio não encontrado');
    }
};