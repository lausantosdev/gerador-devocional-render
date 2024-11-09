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
            document.getElementById('history-section').classList.add('hidden');
            
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

        function showHistory() {
            // Esconde todas as outras seções primeiro
            document.getElementById('initial-selection').classList.add('hidden');
            document.getElementById('manual-input').classList.add('hidden');
            document.getElementById('theme-list').classList.add('hidden');
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('devotional-result').classList.add('hidden');
            
            // Mostra a seção de histórico
            document.getElementById('history-section').classList.remove('hidden');
            
            const history = JSON.parse(localStorage.getItem('devotionalHistory') || '[]');
            const historyContainer = document.getElementById('history-container');
            
            if (history.length === 0) {
                historyContainer.innerHTML = '<p class="no-history">Nenhum devocional salvo ainda.</p>';
            } else {
                historyContainer.innerHTML = history.map((item, index) => `
                    <div class="history-item">
                        <div class="history-header">
                            <h3>Tema: ${item.theme}</h3>
                            <button class="delete-button" onclick="deleteHistoryItem(${index})">
                                <span class="delete-icon">🗑️</span>
                            </button>
                        </div>
                        <p class="history-date">Data: ${new Date(item.date).toLocaleDateString('pt-BR')}</p>
                        <div class="history-content">
                            <div class="devotional-section">
                                <h4>Devocional</h4>
                                ${item.content}
                            </div>
                            <div class="prayer-section">
                                <h4>Oração</h4>
                                ${item.prayer}
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }

        function clearHistory() {
            if (confirm('Tem certeza que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
                localStorage.removeItem('devotionalHistory');
                showToast('Histórico limpo com sucesso!');
                showHistory(); // Atualiza a visualização
            }
        }

        function deleteHistoryItem(index) {
            let history = JSON.parse(localStorage.getItem('devotionalHistory') || '[]');
            history.splice(index, 1);
            localStorage.setItem('devotionalHistory', JSON.stringify(history));
            showToast('Item removido do histórico!');
            showHistory(); // Atualiza a visualização
        }
