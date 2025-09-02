// Scroll suave para navegação - Usar em todas as páginas
document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll('header nav ul li a');
    
    navLinks.forEach(link => {
        if(link.getAttribute('href').charAt(0) === "#") {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });
});