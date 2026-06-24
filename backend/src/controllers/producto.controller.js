const { Op }  = require('sequelize');
const { Producto, Categoria, Lote } = require('../models');
const { subirImagen, eliminarImagen } = require('../services/imagen.service');

async function listar(req, res) {
  try {
    const { pagina = 1, limite = 20, categoria_id, busqueda, activo = 'true', perecedero, stock_bajo } = req.query;
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    const where = { activo: activo === 'true' };
    if (categoria_id)        where.categoria_id = categoria_id;
    if (perecedero !== undefined) where.es_perecedero = perecedero === 'true';
    if (stock_bajo === 'true')    where[Op.and] = [{ stock_actual: { [Op.lte]: Op.col('stock_minimo') } }];
    if (busqueda) {
      where[Op.or] = [
        { nombre:        { [Op.like]: `%${busqueda}%` } },
        { codigo_barras: { [Op.like]: `%${busqueda}%` } }
      ];
    }

    const { count, rows } = await Producto.findAndCountAll({
      where,
      include: [{ model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] }],
      limit:  parseInt(limite),
      offset,
      order:  [['nombre', 'ASC']]
    });

    res.json({
      total:    count,
      paginas:  Math.ceil(count / parseInt(limite)),
      pagina:   parseInt(pagina),
      productos: rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los productos', detalle: err.message });
  }
}

async function obtener(req, res) {
  try {
    const producto = await Producto.findByPk(req.params.id, {
      include: [
        { model: Categoria, as: 'categoria' },
        {
          model: Lote, as: 'lotes',
          where:    { activo: true, cantidad_actual: { [Op.gt]: 0 } },
          required: false,
          order:    [['fecha_vencimiento', 'ASC']]
        }
      ]
    });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el producto', detalle: err.message });
  }
}

async function crear(req, res) {
  try {
    let imagen_url = null;
    if (req.file) {
      imagen_url = await subirImagen(req.file.buffer, req.file.originalname);
    }

    const producto = await Producto.create({ ...req.body, imagen_url });
    res.status(201).json(producto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function actualizar(req, res) {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    let imagen_url = producto.imagen_url;
    if (req.file) {
      await eliminarImagen(imagen_url);
      imagen_url = await subirImagen(req.file.buffer, req.file.originalname);
    }

    await producto.update({ ...req.body, imagen_url });
    res.json(producto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function archivar(req, res) {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.update({ activo: false, visible_online: false });
    res.json({ mensaje: 'Producto archivado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function buscarPorBarcode(req, res) {
  try {
    const producto = await Producto.findOne({
      where: { codigo_barras: req.params.code, activo: true },
      include: [{ model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] }]
    });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado con ese código de barras' });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function importarCSV(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Archivo CSV requerido' });

  try {
    const csv    = req.file.buffer.toString('utf-8');
    const lineas = csv.split('\n').filter(l => l.trim());
    const cabeceras = lineas[0].split(',').map(h => h.trim().toLowerCase());

    const requeridos = ['nombre', 'precio_venta', 'categoria_id'];
    const faltantes  = requeridos.filter(r => !cabeceras.includes(r));
    if (faltantes.length) {
      return res.status(400).json({ error: `Columnas requeridas faltantes: ${faltantes.join(', ')}` });
    }

    let creados = 0, errores = [];

    for (let i = 1; i < lineas.length; i++) {
      const valores = lineas[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const fila    = {};
      cabeceras.forEach((h, idx) => { fila[h] = valores[idx] || null; });

      try {
        await Producto.create({
          nombre:          fila.nombre,
          codigo_barras:   fila.codigo_barras   || null,
          descripcion:     fila.descripcion      || null,
          categoria_id:    parseInt(fila.categoria_id),
          unidad_medida:   fila.unidad_medida   || 'unidad',
          tasa_iva:        fila.tasa_iva         || 'IVA_10',
          precio_costo:    parseFloat(fila.precio_costo)  || 0,
          precio_venta:    parseFloat(fila.precio_venta),
          stock_minimo:    parseInt(fila.stock_minimo)    || 5,
          es_perecedero:   fila.es_perecedero === 'true' || fila.es_perecedero === '1',
          visible_online:  fila.visible_online  !== 'false'
        });
        creados++;
      } catch (e) {
        errores.push({ fila: i + 1, error: e.message });
      }
    }

    res.json({ mensaje: `Importación completada: ${creados} productos creados.`, errores });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar el CSV', detalle: err.message });
  }
}

module.exports = { listar, obtener, crear, actualizar, archivar, buscarPorBarcode, importarCSV };
