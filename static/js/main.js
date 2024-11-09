        const API_URL = 'http://localhost:5000';
        
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
            document.getElementById('loading').classList.remove('hidden');
            
            try {
                const response = await fetch(`${API_URL}/themes`);
                const themes = await response.json();
                
                const themesContainer = document.getElementById('themes-container');
                themesContainer.innerHTML = themes.map(theme => 
                    `<button class="theme-button" onclick="generateDevotional('list', '${theme}')">${theme}</button>`
                ).join('');
                
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('theme-list').classList.remove('hidden');
            } catch (error) {
                console.error('Erro ao carregar temas:', error);
                showToast('Erro ao carregar temas. Tente novamente.');
                showInitialSelection();
            }
        }

        async function generateDevotional(mode, selectedTheme = '') {
            const theme = mode === 'manual' 
                ? document.getElementById('manual-theme').value 
                : selectedTheme;
            
            if (!theme) {
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
                    body: JSON.stringify({ theme: theme }),
                });

                const result = await response.json();
                
                // Atualiza o conteúdo do devocional e da oração
                document.getElementById('devotional-text').innerHTML = 
                    result.devotional.split('\n').map(p => `<p>${p}</p>`).join('');
                document.getElementById('prayer-text').innerHTML = 
                    result.prayer.split('\n').map(p => `<p>${p}</p>`).join('');
                
                // Esconde o loading e mostra o resultado
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
