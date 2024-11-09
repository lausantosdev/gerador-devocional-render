        const API_URL = 'http://localhost:5000';
        
        let currentTheme = '';

        const saveToHistory = () => {
            try {
                const devotional = {
                    theme: currentTheme,
                    content: document.getElementById('devotional-text').innerHTML,
                    prayer: document.getElementById('prayer-text').innerHTML,
                    date: new Date().toISOString(),
                };

                let history = JSON.parse(localStorage.getItem('devotionalHistory') || '[]');
                history.unshift(devotional);
                
                if (history.length > 10) {
                    history = history.slice(0, 10);
                }
                
                localStorage.setItem('devotionalHistory', JSON.stringify(history));
                showToast('Devocional salvo no histórico!');
            } catch (error) {
                console.error('Erro ao salvar no histórico:', error);
            }
            
            return false;
        };

        function showManualInput() {
            document.getElementById('initial-selection').classList.add('hidden');
            document.getElementById('devotional-result').classList.add('hidden');
            document.getElementById('manual-input').classList.remove('hidden');
        }

        function showInitialSelection() {
            document.getElementById('manual-input').classList.add('hidden');
            document.getElementById('theme-list').classList.add('hidden');
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('devotional-result').classList.add('hidden');
            document.getElementById('initial-selection').classList.remove('hidden');
            document.getElementById('manual-theme').value = '';
        }

        async function showThemeList() {
            document.getElementById('initial-selection').classList.add('hidden');
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('themes-loading').classList.remove('hidden');
            
            try {
                const response = await fetch(`${API_URL}/themes`);
                const themes = await response.json();
                
                const themesContainer = document.getElementById('themes-container');
                themesContainer.innerHTML = themes.map(theme => 
                    `<button class="theme-button" onclick="generateDevotional('list', '${theme}')">${theme}</button>`
                ).join('');
                
                document.getElementById('themes-loading').classList.add('hidden');
                document.getElementById('theme-list').classList.remove('hidden');
            } catch (error) {
                console.error('Erro ao carregar temas:', error);
                showToast('Erro ao carregar temas. Tente novamente.');
                showInitialSelection();
            }
        }

        async function generateDevotional(mode, selectedTheme = '') {
            currentTheme = mode === 'manual' 
                ? document.getElementById('manual-theme').value 
                : selectedTheme;
            
            if (!currentTheme) {
                showToast('Por favor, insira um tema.');
                return;
            }

            document.getElementById('manual-input').classList.add('hidden');
            document.getElementById('theme-list').classList.add('hidden');
            document.getElementById('loading').classList.remove('hidden');

            try {
                const response = await fetch(`${API_URL}/generate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ theme: currentTheme }),
                });

                const result = await response.json();
                
                // Atualiza o conteúdo
                document.getElementById('devotional-text').innerHTML = 
                    result.devotional.split('\n').map(p => `<p>${p}</p>`).join('');
                document.getElementById('prayer-text').innerHTML = 
                    result.prayer.split('\n').map(p => `<p>${p}</p>`).join('');
                
                // Configura os botões
                const saveButton = document.getElementById('save-history-btn');
                const backButton = document.querySelector('#devotional-result .button-group .secondary-button');
                
                saveButton.onclick = (e) => {
                    e.preventDefault();
                    saveToHistory();
                };

                backButton.onclick = mode === 'list' 
                    ? () => {
                        document.getElementById('devotional-result').classList.add('hidden');
                        document.getElementById('theme-list').classList.remove('hidden');
                      }
                    : () => showManualInput();
                
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('devotional-result').classList.remove('hidden');
                
                showToast('Devocional gerado com sucesso!');
            } catch (error) {
                console.error('Erro ao gerar devocional:', error);
                showToast('Erro ao gerar devocional. Tente novamente.');
                showInitialSelection();
            }
        }

        function showToast(message, duration = 3000) {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toast-message');
            
            toastMessage.textContent = message;
            toast.classList.remove('hidden');
            toast.classList.add('visible');
            
            setTimeout(() => {
                toast.classList.remove('visible');
                toast.classList.add('hidden');
            }, duration);
        }

        async function copyContent(elementId) {
            const element = document.getElementById(elementId);
            const text = element.innerText;
            
            try {
                await navigator.clipboard.writeText(text);
                showToast('Texto copiado com sucesso!');
            } catch (err) {
                showToast('Erro ao copiar texto. Tente novamente.');
                console.error('Erro ao copiar:', err);
            }
        }
