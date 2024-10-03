const express = require('express');
const app = express(); 
const routes = require('./routes');

app.use(express.json());

app.use('/', routes);

module.exports = app;

//El puerto utilizado es el 3000
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});