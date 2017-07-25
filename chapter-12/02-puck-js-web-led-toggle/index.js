const express = require('express');
const path    = require('path');
const http    = require('http');

const app    = new express();
const server = new http.Server(app);

app.use(express.static(path.join(__dirname, '/app')));
server.listen(3000);
