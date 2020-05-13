const express = require('express');

const {verificaToken} = require('../middlewares/autenticacion');
const app = express();
const Producto = require('../models/producto');

// obtener todos los productos

app.get('/producto',verificaToken,(req,res) => {

  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 5;
  limite = Number(limite);

  Producto.find({disponible:true})
          .skip(desde)
          .limit(limite)
          .populate('categoria','descripcion')
          .populate('usuario','nombre email')
          .exec((err,productoDB) => {
            if(err){
              return res.status(500).json({
                ok:false,
                err:err
              });
            }
          
              Producto.count({disponible:true},(err,conteo) => {
                if(err){
                  return res.status(500).json({
                    ok:false,
                    err:err
                  });
                }
                let cantidad = conteo;
                res.json({
                  ok:true,
                  cantidad: cantidad,
                  productos:productoDB
                });
              })

          })

});

app.get('/producto/:id',verificaToken, (req,res) => {
  
  let id = req.params.id;

  Producto.findById(id)
          .populate('usuario','nombre email')
          .populate('categoria','descripcion')
          .exec((err,productoDB) => {
    if(err){
      return res.status(500).json({
        ok:false,
        err
      });
    }
    if(!productoDB) {
      return res.status(400).json({
        ok:false,
        err: {
          message: 'id no existe'
        }
      });
    }
    res.json({
      ok:true,
      producto: productoDB
    });
  });

});

app.get('/producto/buscar/:termino',verificaToken,(req, res) => {

  let termino = req.params.termino;

  let regex = new RegExp(termino,'i');

  Producto.find({nombre: regex})
          .populate('categoria','descripcion')
          .exec((err,productos) => {
            if(err){
              return res.status(500).json({
                ok:false,
                err
              });
            }
            res.json({
              ok:true,
              productos
            });
          });
});

app.post('/producto',verificaToken,(req,res) => {
  let body = req.body;
  let usuario = req.usuario;

  let producto = new Producto({
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    disponible: body.disponible,
    categoria: body.categoria,
    usuario : usuario._id
  });
  producto.save((err,productoDB) => {
    if(err) {
      return res.status(500).json({
        ok:false,
        err: err
      });
    }
    if(!productoDB) {
      return res.status(400).json({
        ok:false,
        err: err
      });
    }

    res.json({
      ok:true,
      Producto: productoDB
    });

  });

});

app.put('/producto/:id',verificaToken,(req,res) => {
   let id = req.params.id;
  let body = req.body;

  Producto.findById(id,(err,productoBD) => {

    if(err) {
      return res.status(400).json({
        ok:false,
        err: err
      });
    }
    if(!productoBD) {
      return res.status(400).json({
        ok:false,
        err: {
          message: 'id no existe'
        }
      });
    }

    productoBD.nombre = body.nombre;
    productoBD.precioUni =body.precioUni;
    productoBD.categoria =body.categoria;
    productoBD.disponible =body.disponible;
    productoBD.descripcion =body.descripcion;

    productoBD.save((err,productoGuardado) => {

      if(err) {
        return res.status(400).json({
          ok:false,
          err: err
        });
      }
     if(!productoGuardado) {
        return res.status(400).json({
          ok:false,
          err: err
        });
      }
  

      res.json({
        ok: true,
        producto: productoGuardado
      });


    });

  });
  // res.json({
  //         ok: true,
  //         producto: body
  //      });
});

app.delete('/producto/:id',verificaToken,(req,res) => {
  let id = req.params.id;

  Producto.findById(id,(err,productoBD) => {
    if(err){
      return res.status(500).json({
        ok:false,
        err
      });
    }
    if(!productoBD) {
      return res.status(400).json({
        ok:false,
        err: {
          message: 'id no existe'
        }
      });
    }

    productoBD.disponible = false;

    productoBD.save((err,productoBorrado) => {

      if(err){
        return res.status(500).json({
          ok:false,
          err
        });
      }
      res.json({
        ok:true,
        message: 'producto eliminado',
        producto: productoBD
      });

    });

  });
});


module.exports = app;