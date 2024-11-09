from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
from typing import Dict, List
from dotenv import load_dotenv
import json
import os
from datetime import datetime

# Carrega variáveis de ambiente
load_dotenv()

class DevotionalGenerator:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.7
        )
        self.history_file = "theme_history.json"
        self.agent = Agent(
            role='Escritor Devocional',
            goal='Criar devocionais cristãos para mulheres',
            backstory="""Especialista em conteúdo cristão com experiência em 
            criar devocionais inspiradores e relevantes para mulheres cristãs.""",
            verbose=True,
            allow_delegation=False,
            llm=self.llm
        )

    def generate_themes(self) -> List[str]:
        theme_task = Task(
            description="""
            Gere 10 temas relevantes para devocionais cristãos.
            
            Regras importantes:
            - Temas variados e relevantes para mulheres cristãs
            - Temas práticos e aplicáveis ao dia a dia
            - Evite temas muito abstratos
            - Use Português do Brasil
            """,
            expected_output="Lista com 10 temas para devocionais",
            agent=self.agent
        )

        crew = Crew(
            agents=[self.agent],
            tasks=[theme_task],
            verbose=True
        )

        result = crew.kickoff()
        themes = str(result).strip().split('\n')
        # Limpa numeração e espaços extras
        themes = [theme.split('. ')[-1].strip() for theme in themes]
        return themes[:10]  # Garante que teremos exatamente 10 temas

    def generate_content(self, theme: str) -> Dict[str, str]:
        devotional_task = Task(
            description=f"""
            Crie um devocional cristão sobre: {theme}
            
            Regras importantes:
            - Use linguagem clara e acolhedora
            - Tom pessoal, como uma amiga próxima
            - Texto com aproximadamente 260 palavras
            - Utilize SEMPRE o idioma Português do Brasil
            
            Estrutura:
            1. Saudação calorosa e breve
            2. Introdução do tema de forma pessoal
            3. Um versículo-chave
            4. Desenvolvimento breve com uma aplicação prática
            5. Conclusão inspiradora
            """,
            expected_output="""Um texto devocional com aproximadamente 
            260 palavras, seguindo a estrutura solicitada e com linguagem acolhedora.""",
            agent=self.agent
        )

        prayer_task = Task(
            description=f"""
            Baseado no devocional anterior, crie uma oração que:
            
            Regras importantes:
            - Use linguagem clara e pessoal
            - Tom íntimo e reverente
            - Texto com aproximadamente 260 palavras
            - Crie um texto corrido seguindo a estrutura pré-definida
            
            Estrutura:
            1. Invocação amorosa a Deus
            2. Gratidão pelo tema abordado
            3. Pedidos específicos relacionados
            4. Entrega e confiança
            5. Encerramento em nome de Jesus
            """,
            expected_output="""Uma oração com aproximadamente 
            260 palavras, seguindo a estrutura solicitada e com tom reverente e pessoal.""",
            agent=self.agent
        )

        crew = Crew(
            agents=[self.agent],
            tasks=[devotional_task, prayer_task],
            verbose=True,
            process=Process.sequential
        )

        result = crew.kickoff()
        
        outputs = result.tasks_output
        return {
            "devotional": str(outputs[0]),
            "prayer": str(outputs[1])
        }

    def save_theme_to_history(self, theme: str):
        try:
            if os.path.exists(self.history_file):
                with open(self.history_file, 'r', encoding='utf-8') as f:
                    history = json.load(f)
            else:
                history = []

            history.append({
                'theme': theme,
                'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })

            with open(self.history_file, 'w', encoding='utf-8') as f:
                json.dump(history, f, ensure_ascii=False, indent=4)

        except Exception as e:
            print(f"Erro ao salvar tema no histórico: {e}")

def main():
    generator = DevotionalGenerator()
    
    while True:
        choice = input("\nDeseja:\n1 - Inserir um tema manualmente\n2 - Escolher de uma lista de temas\nEscolha (1 ou 2): ")
        
        if choice == "1":
            theme = input("\nDigite o tema desejado: ")
        else:
            themes = generator.generate_themes()
            print("\nTemas sugeridos:")
            for i, theme in enumerate(themes, 1):
                print(f"{i}. {theme}")
            
            while True:
                try:
                    choice = int(input("\nEscolha um tema (1-10): "))
                    if 1 <= choice <= 10:
                        theme = themes[choice-1]
                        break
                    print("Por favor, escolha um número entre 1 e 10.")
                except ValueError:
                    print("Por favor, digite um número válido.")

        print("\nGerando devocional...")
        result = generator.generate_content(theme)
        
        print("\n=== Devocional ===")
        print(result["devotional"])
        print("\n=== Oração ===")
        print(result["prayer"])

        while True:
            save = input("\nDeseja registrar este tema no histórico? (s/n): ").lower()
            if save in ['s', 'n']:
                break
            print("Por favor, responda com 's' ou 'n'.")

        if save == 's':
            generator.save_theme_to_history(theme)
            print("Tema salvo no histórico!")
            break
        else:
            continue_gen = input("\nDeseja gerar outro devocional? (s/n): ").lower()
            if continue_gen != 's':
                break

if __name__ == "__main__":
    main()