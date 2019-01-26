require('dotenv').config();

const express = require('express'); // Подключаем express
const app = express();
const fileUpload = require('express-fileupload');
const PORT = process.env.API_PORT || 3001; // Можно любой другой порт
const router = require('./libs/router');
const server = require('http').Server(app); // Подключаем http через app

app.use(fileUpload());
app.use('/', router);


server.listen(PORT, '127.0.0.1', function () {

});
