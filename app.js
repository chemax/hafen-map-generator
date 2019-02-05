/*Xo, [29.01.19 12:46]
[In reply to енот]
Bonding? Image mergeing уж тогда. Модуль merge-images

for (let x = 0; x < 250; x+=2){
for(let y = 0; y < 250; y+=2){
console.log('=======================')
console.log(`x:${x},y:${y}`)
console.log(`x:${x+1},y:${y}`)
console.log(`x:${x},y:${y+1}`)
console.log(`x:${x+1},y:${y+1}`)
console.log('=======================')
}
}

*/

require('dotenv').config();

const express = require('express'); // Подключаем express
const app = express();
const fileUpload = require('express-fileupload');
const PORT = process.env.API_PORT || 3001; // Можно любой другой порт
const router = require('./libs/router');
const server = require('http').Server(app); // Подключаем http через app
// const generator = require('./generator');
// const antizoom = require('./antizoom');

app.use(fileUpload());
app.use('/', router);


server.listen(PORT, '127.0.0.1', function () {

});
