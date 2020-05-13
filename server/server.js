require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());
 
// configuracion global de rutas
app.use(require('./routes/index'));

//habilitar el public
app.use(express.static(path.resolve(__dirname,'../public')));

mongoose.connect(process.env.urlDB,
                {useNewUrlParser:true, useCreateIndex:true},
                (err,res) => {

  if(err) throw err;

  console.log("base de datos ONLINE");

});
 
app.listen(process.env.PORT,() => {
  console.log("escuchando el puerto ",process.env.PORT);
});