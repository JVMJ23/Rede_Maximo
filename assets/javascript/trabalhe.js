document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formulario-trabalho');
    const btnEnviar = document.getElementById('btn-enviar');
    const inputCurriculo = document.getElementById('curriculo');
    const fileNameSpan = document.querySelector('.file-name');
    const checkboxTermos = document.getElementById('Li-termos');
    const statusEnvioDiv = document.getElementById('status-envio');
    const statusTextoSpan = document.getElementById('status-texto');
    const mensagemSucessoDiv = document.getElementById('mensagem-sucesso');
    const abrirPoliticaBtn = document.getElementById('abrir-politica');
    const modalPolitica = document.getElementById('modal-politica');
    const fecharModalBtns = modalPolitica.querySelectorAll('.fechar');
    const inputTelefone = document.getElementById('telefone');

    let recaptchaVerificado = false;

    // --- Funções Auxiliares ---

    // Função para aplicar a máscara no telefone
    function aplicarMascaraTelefone(value) {
        value = value.replace(/\D/g, ""); // Remove tudo o que não é dígito
        if (value.length > 10) {
            value = value.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
        } else if (value.length > 5) {
            value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (value.length > 2) {
            value = value.replace(/^(\d\d)(\d{0,5}).*/, "($1) $2");
        } else {
            value = value.replace(/^(\d*)/, "($1");
        }
        return value;
    }

    // Função para validar todos os campos do formulário (exceto reCAPTCHA)
    function validarFormulario() {
        const camposObrigatorios = form.querySelectorAll('[required]');
        let todosPreenchidos = true;

        camposObrigatorios.forEach(campo => {
            if (campo.type === 'file') {
                if (campo.files.length === 0) {
                    todosPreenchidos = false;
                }
            } else if (campo.type === 'checkbox') {
                if (!campo.checked) {
                    todosPreenchidos = false;
                }
            } else if (!campo.value.trim()) {
                todosPreenchidos = false;
            }
        });
        return todosPreenchidos;
    }

    // Função para verificar e habilitar/desabilitar o botão de envio
    function verificarBotaoEnvio() {
        const formValido = validarFormulario();
        const recaptchaOK = recaptchaVerificado; // Variável global do reCAPTCHA

        if (formValido && recaptchaOK) {
            btnEnviar.removeAttribute('disabled');
            btnEnviar.classList.remove('disabled');
        } else {
            btnEnviar.setAttribute('disabled', 'true');
            btnEnviar.classList.add('disabled');
        }
    }

    // Função para exibir mensagem de status
    function exibirStatus(mensagem, tipo) {
        statusTextoSpan.textContent = mensagem;
        statusEnvioDiv.style.display = 'block';
        if (tipo === 'sucesso') {
            statusEnvioDiv.style.backgroundColor = '#d4edda';
            statusEnvioDiv.style.borderColor = '#c3e6cb';
            statusEnvioDiv.style.color = '#155724';
            mensagemSucessoDiv.style.display = 'block'; // Exibe a mensagem de sucesso específica
        } else if (tipo === 'erro') {
            statusEnvioDiv.style.backgroundColor = '#f8d7da';
            statusEnvioDiv.style.borderColor = '#f5c6cb';
            statusEnvioDiv.style.color = '#721c24';
            mensagemSucessoDiv.style.display = 'none'; // Esconde a mensagem de sucesso
        } else {
            // Limpa o estilo para outros tipos de mensagens (e.g., "enviando...")
            statusEnvioDiv.style.backgroundColor = '';
            statusEnvioDiv.style.borderColor = '';
            statusEnvioDiv.style.color = '';
            mensagemSucessoDiv.style.display = 'none';
        }
    }

    // Função para resetar o formulário
    function resetarFormulario() {
        form.reset();
        fileNameSpan.textContent = 'Nenhum Arquivo escolhido';
        statusEnvioDiv.style.display = 'none';
        mensagemSucessoDiv.style.display = 'none';
        grecaptcha.reset(); // Reseta o widget do reCAPTCHA
        recaptchaVerificado = false;
        verificarBotaoEnvio();
    }


    // --- Event Listeners ---

    // Listener para o input do currículo (exibir nome do arquivo)
    inputCurriculo.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            fileNameSpan.textContent = this.files[0].name;
        } else {
            fileNameSpan.textContent = 'Nenhum Arquivo escolhido';
        }
        verificarBotaoEnvio();
    });

    // Listener para todos os inputs e selects no formulário para validação em tempo real
    form.addEventListener('input', verificarBotaoEnvio);
    form.addEventListener('change', verificarBotaoEnvio); // Para selects e checkboxes

    // Listener para o campo de telefone (máscara)
    inputTelefone.addEventListener('input', function(e) {
        e.target.value = aplicarMascaraTelefone(e.target.value);
        verificarBotaoEnvio(); // Revalida após a máscara, caso afete a validação de preenchimento
    });


    // Listener para o envio do formulário (FormSubmit)
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        exibirStatus('Enviando seu currículo...', 'info');
        btnEnviar.setAttribute('disabled', 'true'); // Desabilita o botão enquanto envia

        // Validação final antes de realmente enviar
        if (!validarFormulario()) {
            exibirStatus('Por favor, preencha todos os campos obrigatórios e aceite os termos.', 'erro');
            btnEnviar.removeAttribute('disabled');
            return;
        }

        if (!recaptchaVerificado) {
            exibirStatus('Por favor, complete a verificação reCAPTCHA.', 'erro');
            btnEnviar.removeAttribute('disabled');
            return;
        }

        try {

            const formData = new FormData(form);
            const response = await fetch(form.action, { // Usar form.action, pois ele ainda será o URL do FormSubmit
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json' // Importante para o FormSubmit retornar JSON
                }
            });

            if (response.ok) {
                exibirStatus('Currículo enviado com sucesso!', 'sucesso');
                resetarFormulario();
            } else {
                const errorData = await response.json(); // Tenta ler o erro do JSON
                exibirStatus(`Erro ao enviar o currículo: ${errorData.message || 'Tente novamente.'}`, 'erro');
            }
        } catch (error) {
            console.error('Erro no envio do formulário:', error);
            exibirStatus('Ocorreu um erro ao enviar o currículo. Verifique sua conexão e tente novamente.', 'erro');
        } finally {
            btnEnviar.removeAttribute('disabled');
        }
    });


    // --- Lógica do Modal de Política de Privacidade ---
    abrirPoliticaBtn.addEventListener('click', function(e) {
        e.preventDefault();
        modalPolitica.style.display = 'block';
    });

    fecharModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            modalPolitica.style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target == modalPolitica) {
            modalPolitica.style.display = 'none';
        }
    });


    window.recaptchaCallback = function() {
        recaptchaVerificado = true;
        verificarBotaoEnvio();
    };

    window.recaptchaExpiredCallback = function() {
        recaptchaVerificado = false;
        verificarBotaoEnvio();
    };

    window.recaptchaErrorCallback = function() {
        recaptchaVerificado = false;
        verificarBotaoEnvio();
    };

    // Inicialização: verifica o botão de envio ao carregar a página
    verificarBotaoEnvio();
});