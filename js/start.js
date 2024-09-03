function startGame() {
    // Redireciona para a página do jogo
    window.location.href = 'index.html'; // substitua com o caminho do jogo
}

function closeGame() {
    if (confirm("Tem certeza que deseja fechar o jogo?")) {
        window.location.href = 'start.html'; // Fecha a janela
    }
}