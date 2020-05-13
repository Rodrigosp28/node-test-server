const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');
const app = express();


app.post('/login',(req,res) => {

  let body = req.body;
  Usuario.findOne({email : body.email},(err,usuarioDB)=> {

    if(err){
      return res.status(500).json({
        ok:false,
        err:err
      });
    }

    if(!usuarioDB) {
      return res.status(400).json({
        ok:false,
        err: {
          message: '(usuario) o contraseña incorrecto'
        }
      });
    }

    if(!bcrypt.compareSync(body.password,usuarioDB.password)){
      return res.status(400).json({
        ok:false,
        err: {
          message: 'usuario o (contraseña) incorrecto'
        }
      });
    }

    let token = jwt.sign({
      usuario: usuarioDB
    },process.env.SEED,{expiresIn: process.env.CADUCIDAD_TOKEN});

    res.json({
      ok:true,
      usuario: usuarioDB,
      token: token
    });

  });


});

// configuraciones de google
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();

  // console.log(payload.name);
  // console.log(payload.email);
  // console.log(payload.picture);

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  }

}

app.post('/google',async(req,res) => { 

  let token = req.body.idtoken;

  let googleuser = await verify(token)
                          .catch(e=> {
                            return res.status(403).json({
                              ok:false,
                              err:e
                            });
                          });

    Usuario.findOne({email: googleuser.email},(err,usuarioDB) => {

      // si sucede un error
      if(err){
        return res.status(500).json({
          ok:false,
          err:err
        });
      }

      // si existe en la base de datos
      if(usuarioDB) {

        //si existe pero no se registro con google
        if(usuarioDB.google ===false){
          return res.status(400).json({
            ok:false,
            err: {
              meesage: 'debe utilizar su autenticacion normal'
            }
          });
        }
        // si existe y se registro con google
        else {
          let token = jwt.sign({
            usuario: usuarioDB
          },process.env.SEED,{expiresIn: process.env.CADUCIDAD_TOKEN});

          return res.json({
            ok: true,
            usuario: usuarioDB,
            token
          });

        }
      }
      // si el usuario no existe en la base de datos
      else {
        // crea un nuevo usuario
        let usuario = new Usuario();
        usuario.nombre = googleuser.nombre;
        usuario.email = googleuser.email;
        usuario.img = googleuser.img;
        usuario.google = true;
        usuario.password = ':)';

        usuario.save((err,usuarioDB) => {
          // si ocurre error al guardar
          if(err){
            return res.status(400).json({
              ok:false,
              err: {
                meesage: 'debe utilizar su autenticacion normal'
              }
            });
          }

          //si guarda correctamente
          let token = jwt.sign({
            usuario: usuarioDB
          },process.env.SEED,{expiresIn: process.env.CADUCIDAD_TOKEN});

          return res.json({
            ok: true,
            usuario: usuarioDB,
            token
          });

        })
      }
    });


});




module.exports = app;