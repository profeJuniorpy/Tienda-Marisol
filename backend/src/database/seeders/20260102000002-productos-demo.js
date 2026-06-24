'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener IDs de categorías
    const cats = await queryInterface.sequelize.query(
      `SELECT id, nombre FROM categorias`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const cat = (nombre) => {
      const c = cats.find(c => c.nombre.toLowerCase().includes(nombre.toLowerCase()));
      return c ? c.id : cats[0].id;
    };

    const now = new Date();
    const productos = [
      // Lácteos
      { codigo_barras: '7791234000011', nombre: 'Leche entera 1L', descripcion: 'Leche entera pasteurizada', categoria_id: cat('lact'), unidad_medida: 'litro',   precio_costo: 5000,  precio_venta: 7500,  stock_actual: 50, stock_minimo: 10, tasa_iva: 'IVA_5',   es_perecedero: true,  visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000012', nombre: 'Queso Paraguay 400g', descripcion: 'Queso tipo Paraguay artesanal', categoria_id: cat('lact'), unidad_medida: 'unidad', precio_costo: 15000, precio_venta: 22000, stock_actual: 30, stock_minimo: 5,  tasa_iva: 'IVA_5',   es_perecedero: true,  visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000013', nombre: 'Yogur natural 500g', descripcion: 'Yogur natural sin azúcar añadida', categoria_id: cat('lact'), unidad_medida: 'unidad', precio_costo: 8000,  precio_venta: 12000, stock_actual: 25, stock_minimo: 5,  tasa_iva: 'IVA_5',   es_perecedero: true,  visible_online: true, activo: true, created_at: now, updated_at: now },

      // Bebidas
      { codigo_barras: '7791234000021', nombre: 'Agua mineral 1.5L', descripcion: 'Agua mineral sin gas', categoria_id: cat('bebid'), unidad_medida: 'litro',   precio_costo: 2500,  precio_venta: 4000,  stock_actual: 100, stock_minimo: 20, tasa_iva: 'EXENTO', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000022', nombre: 'Refresco Cola 2L',   descripcion: 'Refresco sabor cola', categoria_id: cat('bebid'), unidad_medida: 'litro',   precio_costo: 7000,  precio_venta: 10000, stock_actual: 60, stock_minimo: 10, tasa_iva: 'IVA_10', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000023', nombre: 'Jugo naranja 1L',    descripcion: 'Jugo de naranja natural', categoria_id: cat('bebid'), unidad_medida: 'litro',   precio_costo: 6000,  precio_venta: 9000,  stock_actual: 40, stock_minimo: 8,  tasa_iva: 'IVA_5',   es_perecedero: true,  visible_online: true, activo: true, created_at: now, updated_at: now },

      // Limpieza
      { codigo_barras: '7791234000031', nombre: 'Detergente líquido 1L',    descripcion: 'Detergente multiusos', categoria_id: cat('limpi'), unidad_medida: 'litro',   precio_costo: 8000,  precio_venta: 13500, stock_actual: 45, stock_minimo: 10, tasa_iva: 'IVA_10', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000032', nombre: 'Lavandina 1L',              descripcion: 'Blanqueador desinfectante', categoria_id: cat('limpi'), unidad_medida: 'litro',   precio_costo: 4000,  precio_venta: 7000,  stock_actual: 60, stock_minimo: 12, tasa_iva: 'IVA_10', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000033', nombre: 'Jabón en barra x3',         descripcion: 'Pack 3 jabones antibacterial', categoria_id: cat('limpi'), unidad_medida: 'paquete', precio_costo: 5000,  precio_venta: 9000,  stock_actual: 80, stock_minimo: 15, tasa_iva: 'IVA_10', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },

      // Almacén
      { codigo_barras: '7791234000041', nombre: 'Arroz largo fino 1kg', descripcion: 'Arroz largo fino seleccionado', categoria_id: cat('alm'), unidad_medida: 'kg',     precio_costo: 5500,  precio_venta: 9000,  stock_actual: 120, stock_minimo: 20, tasa_iva: 'EXENTO', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000042', nombre: 'Fideo spaghetti 500g', descripcion: 'Fideo spaghetti de sémola', categoria_id: cat('alm'), unidad_medida: 'paquete', precio_costo: 4000,  precio_venta: 6500,  stock_actual: 90,  stock_minimo: 15, tasa_iva: 'EXENTO', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000043', nombre: 'Aceite girasol 900ml',  descripcion: 'Aceite de girasol refinado', categoria_id: cat('alm'), unidad_medida: 'litro',   precio_costo: 13000, precio_venta: 19000, stock_actual: 55,  stock_minimo: 10, tasa_iva: 'IVA_10', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000044', nombre: 'Azúcar blanca 1kg',     descripcion: 'Azúcar blanca refinada', categoria_id: cat('alm'), unidad_medida: 'kg',     precio_costo: 5000,  precio_venta: 8000,  stock_actual: 110, stock_minimo: 25, tasa_iva: 'EXENTO', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000045', nombre: 'Harina 1kg',            descripcion: 'Harina de trigo 000', categoria_id: cat('alm'), unidad_medida: 'kg',     precio_costo: 4500,  precio_venta: 7500,  stock_actual: 80,  stock_minimo: 20, tasa_iva: 'EXENTO', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },

      // Carnes
      { codigo_barras: '7791234000051', nombre: 'Pechuga de pollo 1kg', descripcion: 'Pechuga sin hueso refrigerada', categoria_id: cat('carne'), unidad_medida: 'kg',   precio_costo: 22000, precio_venta: 32000, stock_actual: 20, stock_minimo: 5, tasa_iva: 'IVA_5', es_perecedero: true, visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000052', nombre: 'Carne molida 500g',     descripcion: 'Carne molida especial', categoria_id: cat('carne'), unidad_medida: 'unidad', precio_costo: 15000, precio_venta: 22000, stock_actual: 15, stock_minimo: 4, tasa_iva: 'IVA_5', es_perecedero: true, visible_online: true, activo: true, created_at: now, updated_at: now },

      // Panadería
      { codigo_barras: '7791234000061', nombre: 'Pan de sandwich', descripcion: 'Pan de molde grande para sandwich', categoria_id: cat('panad'), unidad_medida: 'unidad', precio_costo: 6000, precio_venta: 9500,  stock_actual: 30, stock_minimo: 5, tasa_iva: 'EXENTO', es_perecedero: true, visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000062', nombre: 'Medialunas x6',     descripcion: 'Medialunas dulces artesanales', categoria_id: cat('panad'), unidad_medida: 'paquete', precio_costo: 5000, precio_venta: 8000,  stock_actual: 20, stock_minimo: 4, tasa_iva: 'EXENTO', es_perecedero: true, visible_online: true, activo: true, created_at: now, updated_at: now },

      // Snacks
      { codigo_barras: '7791234000071', nombre: 'Papas fritas 100g',     descripcion: 'Papas fritas clásicas', categoria_id: cat('snack'), unidad_medida: 'unidad', precio_costo: 5000, precio_venta: 8000,  stock_actual: 75, stock_minimo: 15, tasa_iva: 'IVA_10', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000072', nombre: 'Galletitas dulces 200g', descripcion: 'Galletitas surtidas', categoria_id: cat('snack'), unidad_medida: 'paquete', precio_costo: 7000, precio_venta: 11000, stock_actual: 50, stock_minimo: 10, tasa_iva: 'IVA_10', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000073', nombre: 'Chocolate 40g',          descripcion: 'Barra de chocolate con leche', categoria_id: cat('snack'), unidad_medida: 'unidad', precio_costo: 4000, precio_venta: 6500,  stock_actual: 90, stock_minimo: 20, tasa_iva: 'IVA_10', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },

      // Higiene personal
      { codigo_barras: '7791234000081', nombre: 'Shampoo 350ml',          descripcion: 'Shampoo para todo tipo de cabello', categoria_id: cat('higiene'), unidad_medida: 'unidad', precio_costo: 18000, precio_venta: 28000, stock_actual: 35, stock_minimo: 8, tasa_iva: 'IVA_10', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000082', nombre: 'Pasta dental 90g',       descripcion: 'Pasta dental con flúor', categoria_id: cat('higiene'), unidad_medida: 'unidad', precio_costo: 8000,  precio_venta: 13000, stock_actual: 60, stock_minimo: 12, tasa_iva: 'IVA_10', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },
      { codigo_barras: '7791234000083', nombre: 'Desodorante roll-on',    descripcion: 'Desodorante antitranspirante', categoria_id: cat('higiene'), unidad_medida: 'unidad', precio_costo: 12000, precio_venta: 19000, stock_actual: 40, stock_minimo: 8, tasa_iva: 'IVA_10', es_perecedero: false, visible_online: true, activo: true, created_at: now, updated_at: now },
    ];

    await queryInterface.bulkInsert('productos', productos, {});

    // Registrar lotes de stock para los perecederos (para el FEFO)
    const prods = await queryInterface.sequelize.query(
      `SELECT id, es_perecedero, stock_actual FROM productos`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const lotes = [];
    const hoy = new Date();

    for (const p of prods) {
      const expiry = new Date(hoy);
      expiry.setDate(expiry.getDate() + (p.es_perecedero ? 14 : 365));
      lotes.push({
        producto_id:       p.id,
        cantidad_inicial:  p.stock_actual,
        cantidad_actual:   p.stock_actual,
        fecha_vencimiento: expiry.toISOString().split('T')[0],
        fecha_ingreso:     hoy.toISOString().split('T')[0],
        numero_lote:       `LOTE-DEMO-${String(p.id).padStart(3, '0')}`,
        activo:            true,
        created_at:        now
      });
    }

    await queryInterface.bulkInsert('lotes', lotes, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('lotes', {}, {});
    await queryInterface.bulkDelete('productos', {}, {});
  }
};
