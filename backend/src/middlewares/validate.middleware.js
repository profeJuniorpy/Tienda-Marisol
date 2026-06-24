function validar(schema, origen = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[origen], { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        error: 'Error de validación',
        detalles: error.details.map(d => d.message)
      });
    }
    req[origen] = value;
    next();
  };
}

module.exports = { validar };
