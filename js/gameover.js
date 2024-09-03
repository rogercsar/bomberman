const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let msg = 'Game Over'

ctx.fillStyle = 'white';
ctx.font = '40px Arial';
ctx.clearRect(0, canvas.height - 50, canvas.width, 50); // Limpa a área onde desenhamos o texto
ctx.fillText(`${msg}`, 10, canvas.height - 30);
