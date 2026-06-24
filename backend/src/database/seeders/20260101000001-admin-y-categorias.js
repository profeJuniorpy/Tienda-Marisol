'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    // Usuario admin
    const hash = await bcrypt.hash('Admin1234!', 12);
    await queryInterface.bulkInsert('usuarios', [{
      nombre:        'Administrador',
      email:         'admin@marisol.com',
      password_hash: hash,
      rol:           'admin',
      activo:        true,
      created_at:    new Date(),
      updated_at:    new Date()
    }], { ignoreDuplicates: true });

    // Categorías base de una tienda de mercado en Paraguay
    await queryInterface.bulkInsert('categorias', [
      { nombre: 'Frutas y Verduras', descripcion: 'Frutas frescas, verduras y hortalizas',    activo: true },
      { nombre: 'Carnes y Embutidos', descripcion: 'Carnes frescas, fiambres y embutidos',     activo: true },
      { nombre: 'Lácteos y Huevos',   descripcion: 'Leche, yogur, queso, manteca y huevos',    activo: true },
      { nombre: 'Despensa',           descripcion: 'Arroz, fideos, aceite, harina y similares', activo: true },
      { nombre: 'Bebidas',            descripcion: 'Refrescos, jugos, agua, bebidas alcohólicas', activo: true },
      { nombre: 'Panadería',          descripcion: 'Pan, galletitas y productos de panadería',  activo: true },
      { nombre: 'Limpieza',           descripcion: 'Artículos de limpieza del hogar',           activo: true },
      { nombre: 'Higiene Personal',   descripcion: 'Jabón, shampoo, pasta dental y similares', activo: true },
      { nombre: 'Congelados',         descripcion: 'Productos congelados y comidas preparadas', activo: true },
      { nombre: 'Otros',              descripcion: 'Productos varios no categorizados',         activo: true }
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('usuarios', { email: 'admin@marisol.com' });
    await queryInterface.bulkDelete('categorias', null, {});
  }
};
