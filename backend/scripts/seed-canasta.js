/**
 * Carga la canasta básica paraguaya en la base de datos de producción.
 * Uso: node scripts/seed-canasta.js
 * Requiere Node 18+
 */

const BASE = 'https://tienda-marisol.onrender.com/api/v1';
const ADMIN = { email: 'admin@marisol.com', password: 'Admin2026!' };

// Fecha de vencimiento: hoy + días
const fv = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
};

// ─── Productos por categoría ───────────────────────────────────────────────
const PRODUCTOS = [

  // LÁCTEOS
  { cat: 'Lácteos', nombre: 'Leche entera Conaprole 1L',        codigo: '7730416100019', precio_costo: 3500,  precio_venta: 4200,  unidad: 'unidad', minimo: 20, perecedero: true,  vence: 20 },
  { cat: 'Lácteos', nombre: 'Leche entera La Serenísima 1L',    codigo: '7790070000012', precio_costo: 3200,  precio_venta: 3900,  unidad: 'unidad', minimo: 20, perecedero: true,  vence: 20 },
  { cat: 'Lácteos', nombre: 'Leche descremada Conaprole 1L',    codigo: '7730416100026', precio_costo: 3800,  precio_venta: 4600,  unidad: 'unidad', minimo: 10, perecedero: true,  vence: 20 },
  { cat: 'Lácteos', nombre: 'Yogur natural Lácteos del Norte 1L',codigo:'7791234500011', precio_costo: 4500,  precio_venta: 5500,  unidad: 'unidad', minimo: 10, perecedero: true,  vence: 14 },
  { cat: 'Lácteos', nombre: 'Yogur frutado Ilolay 190g',        codigo: '7791234500028', precio_costo: 2800,  precio_venta: 3500,  unidad: 'unidad', minimo: 15, perecedero: true,  vence: 14 },
  { cat: 'Lácteos', nombre: 'Queso Paraguay 500g',              codigo: '7891234560031', precio_costo: 14000, precio_venta: 18000, unidad: 'unidad', minimo: 10, perecedero: true,  vence: 30 },
  { cat: 'Lácteos', nombre: 'Queso fresco Mendicrim 200g',      codigo: '7791234500035', precio_costo: 9000,  precio_venta: 11500, unidad: 'unidad', minimo: 8,  perecedero: true,  vence: 21 },
  { cat: 'Lácteos', nombre: 'Manteca Conaprole 200g',           codigo: '7730416100033', precio_costo: 9500,  precio_venta: 12000, unidad: 'unidad', minimo: 8,  perecedero: true,  vence: 60 },

  // BEBIDAS
  { cat: 'Bebidas', nombre: 'Agua mineral Aqua 500ml',          codigo: '7891234560044', precio_costo: 1500,  precio_venta: 2000,  unidad: 'unidad', minimo: 30, perecedero: false, vence: null },
  { cat: 'Bebidas', nombre: 'Agua mineral Aqua 1.5L',           codigo: '7891234560051', precio_costo: 2500,  precio_venta: 3200,  unidad: 'unidad', minimo: 20, perecedero: false, vence: null },
  { cat: 'Bebidas', nombre: 'Coca-Cola 2.25L',                  codigo: '7891234560068', precio_costo: 7500,  precio_venta: 9500,  unidad: 'unidad', minimo: 15, perecedero: false, vence: 180 },
  { cat: 'Bebidas', nombre: 'Pepsi 2.25L',                      codigo: '7891234560075', precio_costo: 6800,  precio_venta: 8500,  unidad: 'unidad', minimo: 15, perecedero: false, vence: 180 },
  { cat: 'Bebidas', nombre: 'Sprite 2.25L',                     codigo: '7891234560082', precio_costo: 7000,  precio_venta: 8800,  unidad: 'unidad', minimo: 10, perecedero: false, vence: 180 },
  { cat: 'Bebidas', nombre: 'Jugo Baggio manzana 1L',           codigo: '7791234500049', precio_costo: 5000,  precio_venta: 6500,  unidad: 'unidad', minimo: 12, perecedero: false, vence: 365 },
  { cat: 'Bebidas', nombre: 'Jugo Baggio naranja 1L',           codigo: '7791234500056', precio_costo: 5000,  precio_venta: 6500,  unidad: 'unidad', minimo: 12, perecedero: false, vence: 365 },
  { cat: 'Bebidas', nombre: 'Té Negro Lauro 500g',              codigo: '7891234560099', precio_costo: 6000,  precio_venta: 8000,  unidad: 'unidad', minimo: 8,  perecedero: false, vence: 730 },

  // ALMACÉN
  { cat: 'Almacén', nombre: 'Arroz Patria largo fino 1kg',      codigo: '7891234560106', precio_costo: 3200,  precio_venta: 4200,  unidad: 'kg',     minimo: 20, perecedero: false, vence: null },
  { cat: 'Almacén', nombre: 'Arroz Toledo 1kg',                 codigo: '7891234560113', precio_costo: 2800,  precio_venta: 3800,  unidad: 'kg',     minimo: 20, perecedero: false, vence: null },
  { cat: 'Almacén', nombre: 'Fideos Lucchetti spaghetti 500g',  codigo: '7890101001015', precio_costo: 3500,  precio_venta: 4500,  unidad: 'unidad', minimo: 20, perecedero: false, vence: null },
  { cat: 'Almacén', nombre: 'Fideos Don Victorio tallarín 500g',codigo: '7891234560120', precio_costo: 2800,  precio_venta: 3600,  unidad: 'unidad', minimo: 20, perecedero: false, vence: null },
  { cat: 'Almacén', nombre: 'Azúcar Azucarera Paraguaya 1kg',   codigo: '7891234560137', precio_costo: 2500,  precio_venta: 3200,  unidad: 'kg',     minimo: 15, perecedero: false, vence: null },
  { cat: 'Almacén', nombre: 'Aceite Cañuela girasol 900ml',     codigo: '7790387000013', precio_costo: 9500,  precio_venta: 12500, unidad: 'unidad', minimo: 12, perecedero: false, vence: 365 },
  { cat: 'Almacén', nombre: 'Aceite Cocinero girasol 900ml',    codigo: '7790387000020', precio_costo: 8800,  precio_venta: 11500, unidad: 'unidad', minimo: 12, perecedero: false, vence: 365 },
  { cat: 'Almacén', nombre: 'Sal La Carioca 1kg',               codigo: '7891234560144', precio_costo: 1200,  precio_venta: 1800,  unidad: 'kg',     minimo: 10, perecedero: false, vence: null },
  { cat: 'Almacén', nombre: 'Harina Blancaflor 1kg',            codigo: '7790387000037', precio_costo: 3500,  precio_venta: 4800,  unidad: 'kg',     minimo: 10, perecedero: false, vence: 180 },
  { cat: 'Almacén', nombre: 'Puré de tomate Arcor 520g',        codigo: '7790580000014', precio_costo: 5000,  precio_venta: 6500,  unidad: 'unidad', minimo: 10, perecedero: false, vence: 730 },
  { cat: 'Almacén', nombre: 'Lentejas bolsa 500g',              codigo: '7891234560151', precio_costo: 4000,  precio_venta: 5500,  unidad: 'unidad', minimo: 8,  perecedero: false, vence: null },
  { cat: 'Almacén', nombre: 'Porotos bolsa 500g',               codigo: '7891234560168', precio_costo: 3800,  precio_venta: 5000,  unidad: 'unidad', minimo: 8,  perecedero: false, vence: null },
  { cat: 'Almacén', nombre: 'Avena Quaker 200g',                codigo: '7891234560175', precio_costo: 4500,  precio_venta: 6000,  unidad: 'unidad', minimo: 8,  perecedero: false, vence: 365 },
  { cat: 'Almacén', nombre: 'Café molido Café Brasil 250g',     codigo: '7896005001018', precio_costo: 9500,  precio_venta: 13000, unidad: 'unidad', minimo: 8,  perecedero: false, vence: 365 },

  // CARNES
  { cat: 'Carnes',  nombre: 'Pechuga de pollo Granja del Rey 1kg', codigo: '7891234560182', precio_costo: 14000, precio_venta: 18000, unidad: 'kg',     minimo: 10, perecedero: true,  vence: 5  },
  { cat: 'Carnes',  nombre: 'Muslos de pollo Avex 1kg',         codigo: '7891234560199', precio_costo: 11000, precio_venta: 15000, unidad: 'kg',     minimo: 10, perecedero: true,  vence: 5  },
  { cat: 'Carnes',  nombre: 'Pollo entero Granja del Rey 1.5kg',codigo: '7891234560205', precio_costo: 18000, precio_venta: 24000, unidad: 'kg',     minimo: 5,  perecedero: true,  vence: 5  },
  { cat: 'Carnes',  nombre: 'Carne molida especial 1kg',        codigo: '7891234560212', precio_costo: 17000, precio_venta: 22000, unidad: 'kg',     minimo: 8,  perecedero: true,  vence: 3  },
  { cat: 'Carnes',  nombre: 'Huevos blancos docena',            codigo: '7891234560229', precio_costo: 8000,  precio_venta: 10500, unidad: 'unidad', minimo: 15, perecedero: true,  vence: 21 },
  { cat: 'Carnes',  nombre: 'Salchicha Palacios 500g',          codigo: '7891234560236', precio_costo: 9000,  precio_venta: 12000, unidad: 'unidad', minimo: 10, perecedero: true,  vence: 30 },
  { cat: 'Carnes',  nombre: 'Jamón cocido Palacios 200g',       codigo: '7891234560243', precio_costo: 10000, precio_venta: 13500, unidad: 'unidad', minimo: 8,  perecedero: true,  vence: 20 },

  // PANADERÍA
  { cat: 'Panadería', nombre: 'Pan lactal Bimbo blanco 680g',   codigo: '7891234560250', precio_costo: 7500,  precio_venta: 9500,  unidad: 'unidad', minimo: 10, perecedero: true,  vence: 7  },
  { cat: 'Panadería', nombre: 'Pan lactal Seven Days integral 500g', codigo: '7891234560267', precio_costo: 6000, precio_venta: 8000, unidad: 'unidad', minimo: 8, perecedero: true, vence: 7 },
  { cat: 'Panadería', nombre: 'Galletitas Bagley agua 200g',    codigo: '7790580000021', precio_costo: 3500,  precio_venta: 4500,  unidad: 'unidad', minimo: 15, perecedero: false, vence: 180 },
  { cat: 'Panadería', nombre: 'Galletitas Tita chocolate 200g', codigo: '7790580000038', precio_costo: 3500,  precio_venta: 4500,  unidad: 'unidad', minimo: 15, perecedero: false, vence: 180 },
  { cat: 'Panadería', nombre: 'Bizcochos salados 250g',         codigo: '7891234560274', precio_costo: 4000,  precio_venta: 5500,  unidad: 'unidad', minimo: 10, perecedero: false, vence: 90  },

  // LIMPIEZA
  { cat: 'Limpieza', nombre: 'Detergente Ala limón 800g',       codigo: '7891234560281', precio_costo: 6500,  precio_venta: 8500,  unidad: 'unidad', minimo: 10, perecedero: false, vence: null },
  { cat: 'Limpieza', nombre: 'Lavandina Rex 1L',                codigo: '7891234560298', precio_costo: 3200,  precio_venta: 4500,  unidad: 'unidad', minimo: 10, perecedero: false, vence: 365 },
  { cat: 'Limpieza', nombre: 'Jabón en barra Skip 800g',        codigo: '7891234560304', precio_costo: 7000,  precio_venta: 9000,  unidad: 'unidad', minimo: 8,  perecedero: false, vence: null },
  { cat: 'Limpieza', nombre: 'Papel higiénico Elite doble hoja x4', codigo: '7891234560311', precio_costo: 9000, precio_venta: 12000, unidad: 'unidad', minimo: 10, perecedero: false, vence: null },
  { cat: 'Limpieza', nombre: 'Desengrasante Mr. Músculo 500ml', codigo: '7891234560328', precio_costo: 13000, precio_venta: 18000, unidad: 'unidad', minimo: 6,  perecedero: false, vence: null },
  { cat: 'Limpieza', nombre: 'Suavizante Comfort 900ml',        codigo: '7891234560335', precio_costo: 10000, precio_venta: 13500, unidad: 'unidad', minimo: 6,  perecedero: false, vence: null },
  { cat: 'Limpieza', nombre: 'Esponja limpiadora 3M x2',        codigo: '7891234560342', precio_costo: 5000,  precio_venta: 7000,  unidad: 'unidad', minimo: 8,  perecedero: false, vence: null },

  // HIGIENE PERSONAL
  { cat: 'Higiene personal', nombre: 'Champú Pantene hidratación 400ml',  codigo: '7891234560359', precio_costo: 17000, precio_venta: 22000, unidad: 'unidad', minimo: 6, perecedero: false, vence: null },
  { cat: 'Higiene personal', nombre: 'Champú Head & Shoulders 400ml',     codigo: '7891234560366', precio_costo: 18000, precio_venta: 24000, unidad: 'unidad', minimo: 6, perecedero: false, vence: null },
  { cat: 'Higiene personal', nombre: 'Jabón Dove original 90g',           codigo: '7891234560373', precio_costo: 6500,  precio_venta: 8500,  unidad: 'unidad', minimo: 10, perecedero: false, vence: null },
  { cat: 'Higiene personal', nombre: 'Pasta dental Colgate triple acción 90g', codigo: '7891234560380', precio_costo: 7000, precio_venta: 9500, unidad: 'unidad', minimo: 10, perecedero: false, vence: null },
  { cat: 'Higiene personal', nombre: 'Desodorante Rexona men 150ml',      codigo: '7891234560397', precio_costo: 12000, precio_venta: 16000, unidad: 'unidad', minimo: 8, perecedero: false, vence: null },
  { cat: 'Higiene personal', nombre: 'Desodorante Dove women 150ml',      codigo: '7891234560403', precio_costo: 12000, precio_venta: 16000, unidad: 'unidad', minimo: 8, perecedero: false, vence: null },
  { cat: 'Higiene personal', nombre: 'Cepillo dental Colgate suave',      codigo: '7891234560410', precio_costo: 5000,  precio_venta: 7000,  unidad: 'unidad', minimo: 10, perecedero: false, vence: null },

  // SNACKS
  { cat: 'Snacks', nombre: 'Papas fritas Pringles original 124g', codigo: '7891234560427', precio_costo: 13000, precio_venta: 18000, unidad: 'unidad', minimo: 10, perecedero: false, vence: 180 },
  { cat: 'Snacks', nombre: 'Chocolatines Milka leche 150g',        codigo: '7891234560434', precio_costo: 10500, precio_venta: 14500, unidad: 'unidad', minimo: 10, perecedero: false, vence: 180 },
  { cat: 'Snacks', nombre: 'Galletitas Oreo original 264g',        codigo: '7891234560441', precio_costo: 11000, precio_venta: 15000, unidad: 'unidad', minimo: 10, perecedero: false, vence: 180 },
  { cat: 'Snacks', nombre: 'Maní tostado salado 250g',             codigo: '7891234560458', precio_costo: 4500,  precio_venta: 6500,  unidad: 'unidad', minimo: 12, perecedero: false, vence: 180 },
  { cat: 'Snacks', nombre: 'Chizitos Cheese Tris 75g',             codigo: '7891234560465', precio_costo: 3500,  precio_venta: 5000,  unidad: 'unidad', minimo: 15, perecedero: false, vence: 120 },
  { cat: 'Snacks', nombre: 'Caramelos Sugus surtidos 125g',        codigo: '7891234560472', precio_costo: 4500,  precio_venta: 6000,  unidad: 'unidad', minimo: 10, perecedero: false, vence: 365 },
];

// ─── Funciones auxiliares ──────────────────────────────────────────────────
async function api(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('🛒 Cargando canasta básica paraguaya en', BASE);

  // 1. Login
  console.log('\n→ Autenticando...');
  const auth = await api('/auth/login-admin', 'POST', ADMIN);
  const token = auth.accessToken;
  console.log('  ✓ Sesión iniciada como', auth.usuario.email);

  // 2. Obtener categorías
  console.log('\n→ Obteniendo categorías...');
  const catResp = await api('/categorias', 'GET', null, token);
  const catArr = Array.isArray(catResp) ? catResp : (catResp.categorias || catResp.data || []);
  const catMap = {};
  catArr.forEach(c => catMap[c.nombre] = c.id);
  console.log('  ✓ Categorías:', Object.keys(catMap).join(', '));

  // 3. Crear proveedor base
  console.log('\n→ Creando proveedor...');
  let proveedor_id;
  try {
    const provResp = await api('/proveedores', 'POST', {
      nombre: 'Distribuidora Mayorista Central',
      ruc:    '80123456-1',
      telefono: '0981-000-000',
      email:  'distribuidora@mayorista.com.py',
      direccion: 'Mercado de Abasto, Coronel Oviedo'
    }, token);
    const prov = provResp.id ? provResp : provResp.proveedor;
    proveedor_id = prov.id;
    console.log('  ✓ Proveedor creado (id:', proveedor_id + ')');
  } catch (e) {
    const provResp = await api('/proveedores', 'GET', null, token);
    const provArr = Array.isArray(provResp) ? provResp : (provResp.proveedores || provResp.data || []);
    proveedor_id = provArr[0]?.id;
    console.log('  ℹ Usando proveedor existente (id:', proveedor_id + ')');
  }

  // 4. Crear productos
  console.log('\n→ Creando', PRODUCTOS.length, 'productos...');
  const creados = [];
  let ok = 0, err = 0;

  for (const p of PRODUCTOS) {
    const cat_id = catMap[p.cat];
    if (!cat_id) { console.log('  ✗ Sin categoría:', p.cat); err++; continue; }
    try {
      const resp = await api('/productos', 'POST', {
        nombre:        p.nombre,
        categoria_id:  cat_id,
        precio_costo:  p.precio_costo,
        precio_venta:  p.precio_venta,
        unidad_medida: p.unidad,
        stock_minimo:  p.minimo,
        es_perecedero: p.perecedero
      }, token);
      // La API devuelve el producto directamente o dentro de { producto }
      const prod = resp.id ? resp : resp.producto;
      creados.push({ id: prod.id, precio_costo: p.precio_costo, vence: p.vence, nombre: p.nombre });
      process.stdout.write('.');
      ok++;
    } catch (e) {
      process.stdout.write('x');
      err++;
    }
  }
  console.log(`\n  ✓ ${ok} creados, ${err} errores`);

  // 5. Registrar compra inicial con stock
  console.log('\n→ Registrando stock inicial (50 unidades por producto)...');
  const items = creados.map(p => ({
    producto_id:      p.id,
    cantidad:         50,
    precio_unitario:  p.precio_costo,
    fecha_vencimiento: p.vence ? fv(p.vence) : undefined
  }));

  await api('/compras', 'POST', {
    proveedor_id,
    fecha_compra:     new Date().toISOString().split('T')[0],
    numero_factura:   'STOCK-INICIAL-001',
    observaciones:    'Carga inicial — Canasta Básica Paraguaya',
    items
  }, token);
  console.log('  ✓ Stock inicial cargado (50 unidades × producto)');

  console.log('\n✅ Listo! Tienda cargada con', ok, 'productos de la canasta básica paraguaya.');
  console.log('   Tienda: https://tienda-marisol.netlify.app/tienda');
}

main().catch(e => {
  console.error('\n❌ Error:', e.message);
  process.exit(1);
});
