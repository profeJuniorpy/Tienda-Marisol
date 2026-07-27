/**
 * Pobla la tienda con imágenes y simula el ciclo completo del sistema:
 * imágenes, ventas POS, slots pickup, pedidos de clientes, cambios de estado.
 * Uso: node scripts/seed-demo.js
 */

const BASE  = 'https://tienda-marisol.onrender.com/api/v1';
const ADMIN = { email: 'admin@marisol.com', password: 'Admin2026!' };

// ─── Imágenes por tipo de producto ────────────────────────────────────────────
function getImagen(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes('leche'))                            return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80';
  if (n.includes('yogur'))                            return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80';
  if (n.includes('queso'))                            return 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&q=80';
  if (n.includes('manteca'))                          return 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80';
  if (n.includes('agua'))                             return 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500&q=80';
  if (n.includes('coca'))                             return 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=500&q=80';
  if (n.includes('pepsi') || n.includes('sprite'))   return 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500&q=80';
  if (n.includes('jugo'))                             return 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80';
  if (n.includes('té') || n.includes('te negro'))    return 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80';
  if (n.includes('arroz'))                            return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80';
  if (n.includes('fideos'))                           return 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80';
  if (n.includes('azúcar') || n.includes('azucar'))  return 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=500&q=80';
  if (n.includes('aceite'))                           return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80';
  if (n.includes('sal ') || n === 'sal')             return 'https://images.unsplash.com/photo-1584812989895-2d8ff9e44e85?w=500&q=80';
  if (n.includes('harina'))                           return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80';
  if (n.includes('tomate'))                           return 'https://images.unsplash.com/photo-1546039907-7fa05f864c02?w=500&q=80';
  if (n.includes('lenteja') || n.includes('poroto')) return 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=500&q=80';
  if (n.includes('avena'))                            return 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=500&q=80';
  if (n.includes('café') || n.includes('cafe'))      return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80';
  if (n.includes('pechuga') || n.includes('muslo') || n.includes('pollo')) return 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500&q=80';
  if (n.includes('carne'))                            return 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&q=80';
  if (n.includes('huevo'))                            return 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&q=80';
  if (n.includes('salchicha') || n.includes('jamón')) return 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=500&q=80';
  if (n.includes('lactal') || n.includes('pan '))    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80';
  if (n.includes('galletita') || n.includes('bizcocho')) return 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80';
  if (n.includes('papel'))                            return 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=500&q=80';
  if (n.includes('detergente') || n.includes('lavandina') || n.includes('suavizante') || n.includes('esponja')) return 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&q=80';
  if (n.includes('desengrasante') || n.includes('jabón en')) return 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=500&q=80';
  if (n.includes('champú') || n.includes('champu')) return 'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=500&q=80';
  if (n.includes('jabón dove') || n.includes('jabon dove')) return 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80';
  if (n.includes('pasta dental') || n.includes('cepillo')) return 'https://images.unsplash.com/photo-1559580665-9d9430d91c71?w=500&q=80';
  if (n.includes('desodorante'))                      return 'https://images.unsplash.com/photo-1585914924626-915d6f0ecb05?w=500&q=80';
  if (n.includes('pringles') || n.includes('chizito')) return 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&q=80';
  if (n.includes('milka'))                            return 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=500&q=80';
  if (n.includes('oreo'))                             return 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80';
  if (n.includes('maní') || n.includes('mani'))      return 'https://images.unsplash.com/photo-1574570072397-5e7c73c6ad97?w=500&q=80';
  if (n.includes('caramelo'))                         return 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500&q=80';
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80';
}

// ─── Helper HTTP ──────────────────────────────────────────────────────────────
async function api(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

const espera = (ms) => new Promise(r => setTimeout(r, ms));

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Demo Tienda Marisol — iniciando\n');

  // ── 0. Wake-up del servidor ─────────────────────────────────────────────────
  try {
    await fetch(`${BASE.replace('/api/v1', '')}/health`);
    await espera(2000);
    console.log('✓ Servidor activo');
  } catch { console.log('  (health check omitido)'); }

  // ── 1. Login admin ───────────────────────────────────────────────────────────
  const auth  = await api('/auth/login-admin', 'POST', ADMIN);
  const token = auth.accessToken;
  console.log('✓ Sesión admin iniciada');

  // ── 2. Obtener todos los productos ──────────────────────────────────────────
  const prodResp = await api('/productos?limite=100&pagina=1', 'GET', null, token);
  const productos = prodResp.productos || [];
  console.log(`✓ ${productos.length} productos cargados`);

  // ── 3. Asignar imágenes ─────────────────────────────────────────────────────
  console.log('\n→ Asignando imágenes...');
  let imgOk = 0;
  for (const p of productos) {
    try {
      await api(`/productos/${p.id}`, 'PUT', { imagen_url: getImagen(p.nombre) }, token);
      process.stdout.write('.');
      imgOk++;
    } catch { process.stdout.write('x'); }
    await espera(250);
  }
  console.log(`\n✓ ${imgOk}/${productos.length} imágenes asignadas`);

  // ── 4. Crear usuario vendedor ───────────────────────────────────────────────
  console.log('\n→ Creando vendedor...');
  try {
    await api('/usuarios', 'POST', {
      nombre:   'María Vendedora',
      email:    'vendedora@marisol.com',
      password: 'Vend2026!',
      rol:      'vendedor'
    }, token);
    console.log('✓ Vendedor: vendedora@marisol.com / Vend2026!');
  } catch { console.log('  ℹ Vendedor ya existe'); }

  // ── 5. Generar slots pickup ─────────────────────────────────────────────────
  console.log('\n→ Generando slots de retiro...');
  try {
    const slotsGen = await api('/slots/generar-semana', 'POST', { dias: 7 }, token);
    console.log(`✓ ${slotsGen.slots?.length || '?'} slots generados`);
  } catch (e) { console.log('  ℹ Slots:', e.message.substring(0, 60)); }

  // Slots públicos disponibles (no requieren auth)
  await espera(300);
  const slotsResp = await api('/tienda/slots', 'GET');
  const slotIds   = (slotsResp.slots || []).filter(s => !s.lleno).map(s => s.id);
  console.log(`✓ ${slotIds.length} slots disponibles para reservar`);

  // ── 6. Simular ventas POS ───────────────────────────────────────────────────
  console.log('\n→ Registrando ventas POS...');

  const find = (kw) => productos.find(p =>
    p.nombre.toLowerCase().includes(kw.toLowerCase())
  );

  const canastas = [
    {
      label: 'Canasta básica familiar',
      prods: ['Leche entera Conaprole','Pan lactal Bimbo','Huevos blancos','Arroz Patria','Azúcar'],
      qty:   [2, 1, 1, 1, 1], pago: 'efectivo'
    },
    {
      label: 'Limpieza del hogar',
      prods: ['Detergente Ala','Lavandina Rex','Papel higiénico','Jabón en barra'],
      qty:   [2, 1, 2, 1], pago: 'tarjeta'
    },
    {
      label: 'Snacks y bebidas',
      prods: ['Coca-Cola','Pringles','Milka','Galletitas Oreo','Maní tostado'],
      qty:   [2, 2, 1, 1, 1], pago: 'efectivo'
    },
    {
      label: 'Compras de carnes',
      prods: ['Pechuga de pollo','Carne molida','Huevos blancos','Salchicha Palacios'],
      qty:   [2, 1, 2, 1], pago: 'efectivo'
    },
    {
      label: 'Almacén completo',
      prods: ['Fideos Lucchetti','Arroz Toledo','Aceite Cocinero','Café molido','Avena Quaker','Sal La'],
      qty:   [2, 2, 1, 1, 1, 1], pago: 'transferencia'
    },
    {
      label: 'Higiene personal',
      prods: ['Champú Pantene','Jabón Dove','Pasta dental Colgate','Desodorante Rexona'],
      qty:   [1, 2, 1, 1], pago: 'tarjeta'
    },
    {
      label: 'Desayuno completo',
      prods: ['Leche entera La Serenísima','Yogur natural','Pan lactal Seven','Galletitas Bagley','Café molido'],
      qty:   [2, 1, 1, 1, 1], pago: 'efectivo'
    },
    {
      label: 'Lácteos semanales',
      prods: ['Leche entera Conaprole','Leche descremada','Yogur frutado','Queso Paraguay','Manteca Conaprole'],
      qty:   [2, 2, 2, 1, 1], pago: 'tarjeta'
    },
  ];

  let ventasOk = 0;
  for (const c of canastas) {
    const prods   = c.prods.map(kw => find(kw)).filter(Boolean);
    if (prods.length === 0) { console.log(`  ⚠ Sin items: ${c.label}`); continue; }
    const items = prods.map((p, idx) => ({
      producto_id:     p.id,
      cantidad:        c.qty[idx] || 1,
      precio_unitario: p.precio_venta
    }));
    try {
      await api('/ventas', 'POST', { items, metodo_pago: c.pago }, token);
      console.log(`  ✓ ${c.label} (${items.length} ítems)`);
      ventasOk++;
    } catch (e) { console.log(`  ✗ ${c.label}: ${e.message.substring(0, 80)}`); }
    await espera(400);
  }
  console.log(`✓ ${ventasOk} ventas POS registradas`);

  // ── 7. Crear clientes y pedidos pickup ─────────────────────────────────────
  console.log('\n→ Registrando clientes y pedidos pickup...');

  const clientes = [
    { nombre: 'Carlos López',   email: 'carlos.lopez@gmail.com',   password: 'Carlos123!' },
    { nombre: 'Ana Martínez',   email: 'ana.martinez@gmail.com',   password: 'Ana12345!' },
    { nombre: 'Juan Rodríguez', email: 'juan.rodriguez@gmail.com', password: 'Juan1234!' },
    { nombre: 'María García',   email: 'maria.garcia@gmail.com',   password: 'Maria123!' },
  ];

  const pedidoProds = [
    ['Arroz Patria','Fideos Lucchetti','Aceite Cañuela','Pechuga de pollo'],
    ['Leche entera Conaprole','Yogur natural','Queso Paraguay','Pan lactal Bimbo'],
    ['Coca-Cola','Pepsi','Pringles','Milka'],
    ['Detergente Ala','Champú Pantene','Pasta dental Colgate','Papel higiénico'],
  ];

  const pedidosCreados = [];
  for (let i = 0; i < clientes.length; i++) {
    const cl = clientes[i];
    try {
      const reg = await api('/auth/registro-cliente', 'POST', cl);
      const clienteToken = reg.accessToken;
      await espera(300);

      if (!clienteToken || !slotIds[i]) {
        console.log(`  ⚠ Sin token o slot para ${cl.nombre}`);
        continue;
      }

      const items = pedidoProds[i]
        .map(kw => find(kw))
        .filter(Boolean)
        .map(p => ({ producto_id: p.id, cantidad: 2, precio_unitario: p.precio_venta }));

      if (items.length === 0) { console.log(`  ⚠ Sin items para ${cl.nombre}`); continue; }

      const ped = await api('/tienda/pedidos', 'POST', {
        slot_id:         slotIds[i],
        items,
        nombre_contacto: cl.nombre,
        telefono:        '0981' + String(200000 + i)
      }, clienteToken);

      const pedId = ped.pedido?.id || ped.id;
      pedidosCreados.push({ id: pedId, nombre: cl.nombre });
      console.log(`  ✓ Pedido #${pedId} — ${cl.nombre}`);
    } catch (e) { console.log(`  ✗ ${cl.nombre}: ${e.message.substring(0, 100)}`); }
    await espera(400);
  }

  // ── 8. Actualizar estados de pedidos ────────────────────────────────────────
  if (pedidosCreados.length > 0) {
    console.log('\n→ Avanzando estados de pedidos...');
    const flujo = ['confirmado', 'listo', 'retirado'];
    for (let i = 0; i < Math.min(pedidosCreados.length, 3); i++) {
      const { id, nombre } = pedidosCreados[i];
      try {
        await api(`/pedidos/${id}/estado`, 'PATCH', { estado: flujo[i] }, token);
        console.log(`  ✓ Pedido #${id} (${nombre}) → ${flujo[i]}`);
      } catch (e) { console.log(`  ✗ Pedido #${id}: ${e.message.substring(0, 80)}`); }
      await espera(200);
    }
  }

  // ── Resumen ─────────────────────────────────────────────────────────────────
  console.log(`
╔══════════════════════════════════════════════════════╗
║         DEMO TIENDA MARISOL — COMPLETADO ✓           ║
╠══════════════════════════════════════════════════════╣
║  Productos con imagen : ${String(imgOk).padEnd(28)}║
║  Ventas POS           : ${String(ventasOk).padEnd(28)}║
║  Pedidos pickup       : ${String(pedidosCreados.length).padEnd(28)}║
╠══════════════════════════════════════════════════════╣
║  Tienda:  https://tienda-marisol.netlify.app/tienda  ║
║  Admin:   https://tienda-marisol.netlify.app/login   ║
║  admin@marisol.com / Admin2026!                      ║
╚══════════════════════════════════════════════════════╝
`);
}

main().catch(e => { console.error('\n❌', e.message); process.exit(1); });
