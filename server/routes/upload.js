const express = require ('express');
const fileUpload = require('express-fileupload');
const app= express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs= require('fs');
const path = require('path');

app.use( fileUpload({ useTempFiles: true }) );

app.put('/upload/:tipo/:id',function(req,res){

  let tipo = req.params.tipo;
  let id= req.params.id;

  if(!req.files){
    return res.status(400).json({
      ok:false,
      message:'Sin archivos'
    });
  }

  //validar tipo
  let tiposValidos = ['producto','usuario'];
  if(tiposValidos.indexOf(tipo)<0){
    return res.status(400).json({
      ok:false,
      err:{
        message:'tipos permitidos son: ' + tiposValidos.join(', ')
      }
    });
  }

  let archivo =req.files.archivo;
  let nombreCortado = archivo.name.split('.');
  let extension = nombreCortado[nombreCortado.length -1];

  // extensiones permitidas
  let extensionesValidas =['png','jpg','gift','jpeg'];

  if(extensionesValidas.indexOf(extension)<0){
    return res.status(400).json({
      ok:false,
      err:{
        extension: extension,
        message: 'extension no permitida, extensiones validas: ' + extensionesValidas.join(', ')
      }
    });
  }

  // cambiar nombre al archivo
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

  archivo.mv(`uploads/${tipo}/${nombreArchivo}`,function(err){
    if(err){
      return res.status(500).json({
        ok:false,
        err:{
          err:err,
          message:'archivo no se pudo guardar'
        }
      });
    }
    // imagen cargada

     if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

  //   res.json({
  //     ok:true,
  //     message:'archivo cargado'
  //   });
   });


});

function imagenUsuario(id,res, nombreArchivo){
  Usuario.findById(id,(err,usuarioBD) => {
    if(err){
    borraArchivo(nombreArchivo,'usuario');
      return res.status(500).json({
        ok:false,
        err:err
      });
    }

    if(!usuarioBD){
    borraArchivo(nombreArchivo,'usuario');
      return res.status(400).json({
        ok:false,
        err: {
          message: 'usuario no existe'
        }
      });
    }

    // let pathImagen =  path.resolve(__dirname,`../../uploads/usuario/${usuarioBD.img}`);
    // if(fs.existsSync(pathImagen)){
    //   fs.unlinkSync(pathImagen);
    // }

    borraArchivo(usuarioBD.img,'usuario');

    usuarioBD.img = nombreArchivo;
    usuarioBD.save((err,usuarioGuardado) => {
       res.json({
        ok:true,
        usuario: usuarioGuardado,
        img: nombreArchivo
      });
    })

  });
}
function imagenProducto(id,res,nombreArchivo){
  Producto.findById(id,(err,productoBD) => {
    if(err){
      borraArchivo(nombreArchivo,'producto');
        return res.status(500).json({
          ok:false,
          err:err
        });
      }
  
      if(!productoBD){
      borraArchivo(nombreArchivo,'producto');
        return res.status(400).json({
          ok:false,
          err: {
            message: 'usuario no existe'
          }
        });
      }
  
      // let pathImagen =  path.resolve(__dirname,`../../uploads/usuario/${usuarioBD.img}`);
      // if(fs.existsSync(pathImagen)){
      //   fs.unlinkSync(pathImagen);
      // }
  
      borraArchivo(productoBD.img,'producto');
  
      productoBD.img = nombreArchivo;
      productoBD.save((err,productoGuardado) => {
         res.json({
          ok:true,
          producto: productoGuardado,
          img: nombreArchivo
        });
      })
  
  });
}

function borraArchivo(nombreImagen,tipo){
  let pathImagen =  path.resolve(__dirname,`../../uploads/${tipo}/${nombreImagen}`);
    if(fs.existsSync(pathImagen)){
      fs.unlinkSync(pathImagen);
    }
}
module.exports = app;
