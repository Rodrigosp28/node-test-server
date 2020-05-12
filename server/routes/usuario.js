const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const {verificaToken,verificaAdminRol} = require('../middlewares/autenticacion')
const app = express();



app.get('/usuario', verificaToken, (req, res) => {

  // return res.json({
  //   usuario: req.usuario
  // });

  

  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 5;
  limite = Number(limite);
  
  
  Usuario.find({estado:true},'nombre email role estado google img')
    .skip(desde)
    .limit(limite)
    .exec((err,usuarios) => {
      if(err) {
        return res.status(400).json({
          ok:false,
          err: err
        });
      }
      Usuario.count({estado:true},(err,conteo) => {
        let cant = conteo;
        res.json({
          ok:true,
          cantidad: cant,
          usuarios: usuarios
        });
      });
    });

});

app.post('/usuario',[verificaToken,verificaAdminRol],(req, res) => { 

  let body = req.body;

  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password,10),
    role: body.role
  });

  usuario.save((err, usuarioDB) => {

    if(err) {
      return res.status(400).json({
        ok:false,
        err: err
      });
    }

    // usuarioDB.password =null;

    res.json( {
      ok:true,
      usuario: usuarioDB
    })

  })

});

app.put('/usuario/:id',[verificaToken,verificaAdminRol], (req, res) => {

  let id = req.params.id;
  let body = _.pick(req.body, ['nombre','email','img','role','estado']);

 

  Usuario.findByIdAndUpdate(id,body,{new:true,runValidators:true},(err,usuarioDB) => {

    if(err){

      return res.status(400).json({
        ok:false,
        err: err
      });
    }

    res.json({
      ok: true,
      usuario: usuarioDB
    });

  });

});

app.delete('/usuario/:id', [verificaToken,verificaAdminRol], (req, res) => {
  
  let id = req.params.id;

  // Usuario.findByIdAndRemove(id,(err,usuarioBorrado) => {
  let cambiaEstado = {
    estado:false
  }
  Usuario.findByIdAndUpdate(id,cambiaEstado,{new:true},(err,usuarioBorrado) => {

    if(err){
      return res.status(400).json({
        ok:false,
        err
      });
    }

    if(!usuarioBorrado) {
      return res.status(400).json({
        ok:false,
        error: {
          meesage: 'Usuario no encotrado'
        }

      });
    }

    res.json({
      ok:true,
      usuario: usuarioBorrado
    });

  })

});

module.exports = app;