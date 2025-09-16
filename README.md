Passos projeto

Instalar:
- Node.js (versão LTS) → https://nodejs.org/en/download <br>
Verificar instalação: <br>
node -v <br>
npm -v <br>

- Git → https://git-scm.com/downloads <br>
Verificar instalação: <br>
git --version <br>

- MySQL + Workbench → https://dev.mysql.com/downloads/installer/ <br>
Baixar a maior versão, com Community server e workbench <br>
Instalar versão full ou custom (com server, workbench e shell) <br>

Clonar o repositório: <br>
git clone https://github.com/GabrielAugusto842/Tg-manutencao.git <br>
cd Tg-manutencao <br>

Instalar dependências do backend: <br>
cd backend <br>
npm install <br>

Instalar dependências do frontend: <br>
cd frontend <br>
npm install <br>

Criar arquivo .env dentro de backend/ com: <br>
DB_HOST=localhost <br>
DB_USER=root <br>
DB_PASS=123456 <br>
DB_NAME=sist_manutencao <br>
PORT=3001 <br>

No Workbench: <br>
CREATE DATABASE sist_manutencao; <br>
use sist_manutencao; <br>
Server > Data Import <br>
importar o banco que está na pasta /database do projeto <br>

Para testar, rodar dentro da pasta backend: <br>
npm run dev
