const jwt = require('jsonwebtoken');

// ===============
// verificar token
// ==============

let verificaToken = ( req,res,next ) => {

  let token = req.get('token');
  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if(err){
      return res.status(401).json({
        ok:false,
        err: {
          message: 'token no valido'
        }
      });
    }
    req.usuario = decoded.usuario;
    next();
  });

};

// ===============
// verificar adminrol
// ==============

let verificaAdminRol = (req,res,next) => {

  let usuario = req.usuario;

  if(usuario.role === 'ADMIN_ROLE') {
    next();
    return;
  }else{
    return res.status(401).json({
      ok:false,
      err: {
        message: 'rol no es administrado'
      }
    });
  }

}

// ===============
// verificar token img
// ==============

let verificaTokenImg = (req,res,next) => {
  let token = req.query.token;

  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if(err){
      return res.status(401).json({
        ok:false,
        err: {
          message: 'token no valido'
        }
      });
    }
    req.usuario = decoded.usuario;
    next();
  });

};




module.exports = {
  verificaToken,
  verificaAdminRol,
  verificaTokenImg
}