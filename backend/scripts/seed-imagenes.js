/**
 * Asigna imagen_url a los 62 productos de la canasta básica.
 * Uso: node scripts/seed-imagenes.js
 */

const BASE  = 'https://tienda-marisol.onrender.com/api/v1';
const ADMIN = { email: 'admin@marisol.com', password: 'Admin2026!' };

function getImagen(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes('leche'))                              return 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80';
  if (n.includes('yogur'))                              return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80';
  if (n.includes('queso'))                              return 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&q=80';
  if (n.includes('manteca'))                            return 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80';
  if (n.includes('agua'))                               return 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500&q=80';
  if (n.includes('coca'))                               return 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=500&q=80';
  if (n.includes('pepsi') || n.includes('sprite'))     return 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500&q=80';
  if (n.includes('jugo'))                               return 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80';
  if (n.includes('té') || n.includes('te negro'))      return 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80';
  if (n.includes('arroz'))                              return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80';
  if (n.includes('fideos'))                             return 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=500&q=80';
  if (n.includes('azúcar') || n.includes('azucar'))    return 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=500&q=80';
  if (n.includes('aceite'))                             return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80';
  if (n.startsWith('sal ') || n === 'sal')             return 'https://images.unsplash.com/photo-1584812989895-2d8ff9e44e85?w=500&q=80';
  if (n.includes('harina'))                             return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80';
  if (n.includes('tomate'))                             return 'https://images.unsplash.com/photo-1546039907-7fa05f864c02?w=500&q=80';
  if (n.includes('lenteja') || n.includes('poroto'))   return 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?w=500&q=80';
  if (n.includes('avena'))                              return 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=500&q=80';
  if (n.includes('café') || n.includes('cafe'))        return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80';
  if (n.includes('pechuga') || n.includes('muslo') || n.includes('pollo')) return 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500&q=80';
  if (n.includes('carne'))                              return 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&q=80';
  if (n.includes('huevo'))                              return 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&q=80';
  if (n.includes('salchicha') || n.includes('jamón'))  return 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=500&q=80';
  if (n.includes('lactal') || n.includes('pan '))      return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80';
  if (n.includes('galletita') || n.includes('bizcocho')) return 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80';
  if (n.includes('papel'))                              return 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=500&q=80';
  if (n.includes('detergente') || n.includes('lavandina') || n.includes('suavizante') || n.includes('esponja')) return 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&q=80';
  if (n.includes('desengrasante') || n.includes('jabón en')) return 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=500&q=80';
  if (n.includes('champú') || n.includes('champu'))    return 'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=500&q=80';
  if (n.includes('jabón dove') || n.includes('jabon dove')) return 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&q=80';
  if (n.includes('pasta dental') || n.includes('cepillo')) return 'https://images.unsplash.com/photo-1559580665-9d9430d91c71?w=500&q=80';
  if (n.includes('desodorante'))                        return 'https://images.unsplash.com/photo-1585914924626-915d6f0ecb05?w=500&q=80';
  if (n.includes('pringles') || n.includes('chizito'))  return 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&q=80';
  if (n.includes('milka'))                              return 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=500&q=80';
  if (n.includes('oreo'))                               return 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80';
  if (n.includes('maní') || n.includes('mani'))         return 'https://images.unsplash.com/photo-1574570072397-5e7c73c6ad97?w=500&q=80';
  if (n.includes('caramelo'))                           return 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=500&q=80';
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80';
}

async function put(path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body:    JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${res.status}: ${txt.slice(0, 120)}`);
  }
  return res.json();
}

async function main() {
  // 1. Despertar el servidor
  console.log('Despertando servidor…');
  try {
    const h = await fetch(`${BASE.replace('/api/v1', '')}/health`);
    console.log('Servidor:', (await h.json()).estado);
  } catch { console.log('(health sin respuesta, continúo)'); }
  await new Promise(r => setTimeout(r, 1500));

  // 2. Login
  const loginRes = await fetch(`${BASE}/auth/login-admin`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(ADMIN)
  });
  if (!loginRes.ok) throw new Error('Login fallido: ' + (await loginRes.text()));
  const { accessToken } = await loginRes.json();
  console.log('Sesión iniciada.\n');

  // 3. Obtener todos los productos
  const prodRes = await fetch(`${BASE}/productos?limite=100&pagina=1`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const { productos } = await prodRes.json();
  console.log(`${productos.length} productos encontrados.\n`);

  // 4. Actualizar imagen de cada producto
  let ok = 0, fail = 0;
  for (const p of productos) {
    const url = getImagen(p.nombre);
    try {
      await put(`/productos/${p.id}`, { imagen_url: url }, accessToken);
      console.log(`  ✓ [${String(p.id).padEnd(4)}] ${p.nombre}`);
      ok++;
    } catch (e) {
      console.log(`  ✗ [${String(p.id).padEnd(4)}] ${p.nombre} → ${e.message}`);
      fail++;
    }
    await new Promise(r => setTimeout(r, 220)); // 220 ms entre requests
  }

  console.log(`\n✓ ${ok} imágenes cargadas · ${fail} errores`);
  if (fail === 0) console.log('¡Listo! Revisá la tienda: https://tienda-marisol.netlify.app/tienda');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
