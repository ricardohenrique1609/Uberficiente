import tkinter as tk
from nltk.chat.util import Chat, reflections

# Padrões de conversação para o chatbot
pairs = [
    (r'oi|olá|ei', ['Olá! Bem-vindo ao Uberficiente! Como posso ajudá-lo hoje?']),
    (r'qual é o seu nome\??', ['Eu sou o assistente do Uberficiente. Como posso ajudar você?']),
    (r'como você está\??', ['Estou aqui pronto para ajudar! O que você precisa?']),
    (r'(quero|preciso) de ajuda', [
        'Claro! Você precisa de informações sobre corridas, acessibilidade ou algo mais?',
    ]),
    (r'como funciona o uber para deficientes\??', [
        'Nosso serviço oferece corridas adaptadas para pessoas com deficiência, '
        'como veículos com suporte para cadeira de rodas e motoristas treinados. '
        'Como posso ajudar mais?'
    ]),
    (r'(.*) acessibilidade(.*)', [
        'Nós priorizamos acessibilidade com veículos adaptados. Há algo específico que você precisa saber?',
    ]),
    (r'quanto custa uma corrida(.*)\??', [
        'O custo depende da distância e do trajeto. Você gostaria de simular um preço estimado?',
    ]),
    (r'adeus|tchau', ['Até mais! Volte sempre que precisar de ajuda!']),
    (r'(.*)', [
        'Desculpe, não entendi sua mensagem. Poderia reformular ou perguntar de outra forma?',
    ]),
]

# Função para processar mensagens do usuário
def chatbot_response(msg):
    response = chatbot.respond(msg)
    if not response:  # Caso não encontre uma resposta nos padrões
        response = "Desculpe, não entendi. Pode tentar perguntar de outra forma?"
    return response

# Criação da interface do chatbot
def send_message():
    user_input = entry.get().strip()
    if user_input:  # Verificar se a entrada não está vazia
        entry.delete(0, tk.END)
        response = chatbot_response(user_input)
        chat_box.config(state=tk.NORMAL)
        chat_box.insert(tk.END, f"Você: {user_input}\n", "user")
        chat_box.insert(tk.END, f"Bot: {response}\n", "bot")
        chat_box.config(state=tk.DISABLED)
        chat_box.see(tk.END)  # Rola automaticamente para a última mensagem

# Configurando o chatbot
chatbot = Chat(pairs, reflections)

# Configurando a janela principal
root = tk.Tk()
root.title("Uberficiente - Assistente Virtual")
root.geometry("500x500")
root.resizable(False, False)

# Configurando a caixa de texto para exibir o chat
chat_box = tk.Text(root, state=tk.DISABLED, wrap=tk.WORD, bg="#f4f4f4", font=("Arial", 12))
chat_box.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)
chat_box.tag_configure("user", foreground="blue")
chat_box.tag_configure("bot", foreground="green")

# Configurando a entrada de texto
entry_frame = tk.Frame(root)
entry_frame.pack(pady=5, fill=tk.X)

entry = tk.Entry(entry_frame, width=40, font=("Arial", 12))
entry.pack(side=tk.LEFT, padx=5, pady=5, expand=True, fill=tk.X)
entry.bind("<Return>", lambda event: send_message())  # Enviar ao pressionar Enter

# Configurando o botão de envio
send_button = tk.Button(entry_frame, text="Enviar", command=send_message, bg="#4CAF50", fg="white", font=("Arial", 10))
send_button.pack(side=tk.RIGHT, padx=5)

# Configurações adicionais da interface
def welcome_message():
    chat_box.config(state=tk.NORMAL)
    chat_box.insert(tk.END, "Bot: Olá! Bem-vindo ao Uberficiente. Como posso ajudar você hoje?\n", "bot")
    chat_box.config(state=tk.DISABLED)

# Mostrar mensagem de boas-vindas ao iniciar
welcome_message()

# Iniciando o loop da interface
root.mainloop()
