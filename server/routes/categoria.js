const express = require('express');
const {verificaToken,verificaAdminRol} = require('../middlewares/autenticacion');
const Categoria = require('../models/categoria');

const app = express();

app.get('/categoria',verificaToken,(req,res) => {
  
  Categoria.find({})
            .sort('descripcion')
            .populate('usuario','nombre email')
            .exec((err, categoriaBD) => {
    if(err){
      return res.status(500).json({
        ok:false,
        err:err
      });
    }

    Categoria.count({},(err,conteo) => {
      let cantidad = conteo;
      res.json({
        ok:true,
        cantidad: cantidad,
        categorias:categoriaBD
      });
    });

  });

});

app.get('/categoria/:id',verificaToken,(req,res) => {
  
  let id = req.params.id;

  Categoria.findById(id,(err,categoriaBD) => {
    if(err){
      return res.status(500).json({
        ok:false,
        err
      });
    }
    if(!categoriaBD) {
      return res.status(400).json({
        ok:false,
        err: err
      });
    }
    res.json({
      ok:true,
      categoria: categoriaBD
    });
  });
});

app.post('/categoria',verificaToken,(req,res) => {

  let usuario = req.usuario;
  let body = req.body;
  let categoria = new Categoria({
    descripcion: body.descripcion,
    usuario: usuario._id
  });
  categoria.save((err,categoriaBD) => {
    if(err) {
      return res.status(500).json({
        ok:false,
        err: err
      });
    }
    if(!categoriaBD) {
      return res.status(400).json({
        ok:false,
        err: err
      });
    }

    res.json({
      ok:true,
      categoria:categoriaBD
    });

  });

});

app.put('/categoria/:id',verificaToken, (req,res) => {

  let id = req.params.id;
  let body = req.body;

  Categoria.findByIdAndUpdate(id,body,{new:true,runValidators:true},(err,categoriaBD) => {

    if(err) {
      return res.status(400).json({
        ok:false,
        err: err
      });
    }
    if(!categoriaBD) {
      return res.status(400).json({
        ok:false,
        err: err
      });
    }

    res.json({
      ok: true,
      categoria: categoriaBD
    });

  });

});

app.delete('/categoria/:id',[verificaToken,verificaAdminRol], (req,res) => {

  let id = req.params.id;

  Categoria.findByIdAndRemove(id,(err,categoriaBD) => {
    if(err){
      return res.status(500).json({
        ok:false,
        err
      });
    }
    if(!categoriaBD) {
      return res.status(400).json({
        ok:false,
        err: err
      });
    }

    res.json({
      ok:true,
      message: 'categoria eliminada',
      categoria: categoriaBD
    });
  });

});

module.exports = app;