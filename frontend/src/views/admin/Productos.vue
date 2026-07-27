<template>
  <div>
    <!-- Encabezado -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
        <p class="text-sm text-gray-500 mt-1">{{ total }} productos registrados</p>
      </div>
      <div class="flex gap-2">
        <label class="btn-secondary cursor-pointer text-sm py-2 px-4">
          Importar CSV
          <input type="file" accept=".csv" class="hidden" @change="importarCSV" />
        </label>
        <button @click="abrirModalNuevo" class="btn-primary">+ Nuevo producto</button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card mb-5">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input
          v-model="filtros.busqueda"
          @input="debounceBuscar"
          type="text"
          placeholder="Buscar por nombre o código..."
          class="input sm:col-span-2"
        />
        <select v-model="filtros.categoria_id" @change="cargar" class="input">
          <option value="">Todas las categorías</option>
          <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
        </select>
        <select v-model="filtros.activo" @change="cargar" class="input">
          <option value="true">Activos</option>
          <option value="false">Archivados</option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <div class="card p-0 overflow-hidden">
      <div v-if="cargando" class="flex justify-center py-12 text-gray-400">
        <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-100">
        <thead class="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <tr>
            <th class="px-4 py-3 text-left">Producto</th>
            <th class="px-4 py-3 text-left">Categoría</th>
            <th class="px-4 py-3 text-right">Precio venta</th>
            <th class="px-4 py-3 text-right">Stock</th>
            <th class="px-4 py-3 text-center">Online</th>
            <th class="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="productos.length === 0">
            <td colspan="6" class="text-center py-10 text-gray-400 text-sm">No se encontraron productos</td>
          </tr>
          <tr v-for="p in productos" :key="p.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img v-if="p.imagen_url" :src="p.imagen_url" :alt="p.nombre"
                  class="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                <div v-else class="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <CubeIcon class="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p class="font-medium text-gray-900 text-sm">{{ p.nombre }}</p>
                  <p class="text-xs text-gray-400">{{ p.codigo_barras || 'Sin código' }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ p.categoria?.nombre || '—' }}</td>
            <td class="px-4 py-3 text-right text-sm font-medium">{{ formatGs(p.precio_venta) }}</td>
            <td class="px-4 py-3 text-right">
              <span :class="stockClase(p)" class="text-sm font-semibold">{{ p.stock_actual }}</span>
              <span class="text-xs text-gray-400 ml-1">{{ p.unidad_medida }}</span>
            </td>
            <td class="px-4 py-3 text-center">
              <span :class="p.visible_online ? 'badge-verde' : 'badge-gris'">
                {{ p.visible_online ? 'Sí' : 'No' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-1">
                <button @click="verLotes(p)" title="Ver lotes" class="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                  <ClipboardDocumentListIcon class="h-4 w-4" />
                </button>
                <button @click="abrirModalEditar(p)" title="Editar" class="p-1.5 text-gray-400 hover:text-primary-600 rounded">
                  <PencilIcon class="h-4 w-4" />
                </button>
                <button v-if="p.activo" @click="confirmarArchivar(p)" title="Archivar" class="p-1.5 text-gray-400 hover:text-red-500 rounded">
                  <ArchiveBoxIcon class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div v-if="totalPaginas > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <p class="text-xs text-gray-500">Página {{ pagina }} de {{ totalPaginas }}</p>
        <div class="flex gap-1">
          <button @click="cambiarPagina(pagina - 1)" :disabled="pagina <= 1"
            class="btn-secondary py-1 px-3 text-xs disabled:opacity-40">Anterior</button>
          <button @click="cambiarPagina(pagina + 1)" :disabled="pagina >= totalPaginas"
            class="btn-secondary py-1 px-3 text-xs disabled:opacity-40">Siguiente</button>
        </div>
      </div>
    </div>

    <!-- Modal Producto -->
    <Transition name="modal">
      <div v-if="modalAbierto" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between px-6 py-4 border-b">
            <h2 class="text-lg font-semibold">{{ editando ? 'Editar producto' : 'Nuevo producto' }}</h2>
            <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600">
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <form @submit.prevent="guardarProducto" class="p-6 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="label">Nombre *</label>
                <input v-model="form.nombre" class="input" required placeholder="Ej: Tomate kg" />
              </div>
              <div>
                <label class="label">Código de barras</label>
                <input v-model="form.codigo_barras" class="input" placeholder="EAN-13 o similar" />
              </div>
              <div>
                <label class="label">Categoría *</label>
                <select v-model="form.categoria_id" class="input" required>
                  <option value="">Seleccionar...</option>
                  <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
                </select>
              </div>
              <div>
                <label class="label">Precio de costo (Gs.)</label>
                <input v-model="form.precio_costo" type="number" min="0" step="1" class="input" placeholder="0" />
              </div>
              <div>
                <label class="label">Precio de venta (Gs.) *</label>
                <input v-model="form.precio_venta" type="number" min="0" step="1" class="input" required />
              </div>
              <div>
                <label class="label">Stock mínimo</label>
                <input v-model="form.stock_minimo" type="number" min="0" class="input" />
              </div>
              <div>
                <label class="label">Unidad de medida</label>
                <select v-model="form.unidad_medida" class="input">
                  <option value="unidad">Unidad</option>
                  <option value="kg">Kilogramo</option>
                  <option value="litro">Litro</option>
                  <option value="paquete">Paquete</option>
                  <option value="docena">Docena</option>
                </select>
              </div>
              <div>
                <label class="label">Tasa de IVA</label>
                <select v-model="form.tasa_iva" class="input">
                  <option value="IVA_10">IVA 10%</option>
                  <option value="IVA_5">IVA 5%</option>
                  <option value="EXENTO">Exento</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label class="label">Descripción</label>
                <textarea v-model="form.descripcion" class="input" rows="2" placeholder="Opcional..." />
              </div>
              <div class="flex items-center gap-6 sm:col-span-2">
                <label class="flex items-center gap-2 text-sm cursor-pointer">
                  <input v-model="form.es_perecedero" type="checkbox" class="rounded" />
                  Producto perecedero
                </label>
                <label class="flex items-center gap-2 text-sm cursor-pointer">
                  <input v-model="form.visible_online" type="checkbox" class="rounded" />
                  Visible en tienda online
                </label>
              </div>
              <div class="sm:col-span-2">
                <label class="label">Imagen del producto</label>
                <div class="flex items-center gap-4 mb-2">
                  <img v-if="previstaImagen || form.imagen_url"
                    :src="previstaImagen || form.imagen_url"
                    class="h-20 w-20 rounded-lg object-cover border flex-shrink-0"
                    @error="form.imagen_url = null" />
                  <div v-else class="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center border flex-shrink-0">
                    <PhotoIcon class="h-8 w-8 text-gray-300" />
                  </div>
                  <div class="flex-1 space-y-2">
                    <input
                      v-model="form.imagen_url"
                      class="input text-sm"
                      placeholder="https://... (pegar URL de imagen)"
                      @input="previstaImagen = null; archivoImagen = null"
                    />
                    <div class="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        @click="sugerirImagen"
                        class="btn-primary text-xs py-1 px-3 inline-flex items-center gap-1"
                        title="Busca una imagen automáticamente según el nombre del producto"
                      >
                        ✨ Sugerir imagen
                      </button>
                      <label class="btn-secondary text-xs cursor-pointer inline-flex items-center gap-1 py-1 px-3">
                        <PhotoIcon class="h-3.5 w-3.5" /> Subir archivo
                        <input type="file" accept="image/*" class="hidden" @change="previsualizar" />
                      </label>
                    </div>
                    <p v-if="archivoImagen" class="text-xs text-gray-400">Archivo: {{ archivoImagen.name }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="errorModal" class="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
              {{ errorModal }}
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t">
              <button type="button" @click="cerrarModal" class="btn-secondary">Cancelar</button>
              <button type="submit" class="btn-primary" :disabled="guardando">
                {{ guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear producto') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal Lotes -->
    <ModalLotes
      v-if="productoSeleccionado"
      :producto="productoSeleccionado"
      @cerrar="productoSeleccionado = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  CubeIcon, PencilIcon, ArchiveBoxIcon,
  ClipboardDocumentListIcon, XMarkIcon, PhotoIcon
} from '@heroicons/vue/24/outline';
import api from '@/services/api';
import ModalLotes from '@/components/stock/ModalLotes.vue';

const productos           = ref([]);
const categorias          = ref([]);
const total               = ref(0);
const pagina              = ref(1);
const totalPaginas        = ref(1);
const cargando            = ref(false);
const modalAbierto        = ref(false);
const editando            = ref(false);
const guardando           = ref(false);
const errorModal          = ref('');
const productoSeleccionado = ref(null);
const previstaImagen      = ref(null);
const archivoImagen       = ref(null);
const filtros = ref({ busqueda: '', categoria_id: '', activo: 'true' });

const formVacio = () => ({
  nombre: '', codigo_barras: '', categoria_id: '',
  precio_costo: 0, precio_venta: 0, stock_minimo: 5,
  unidad_medida: 'unidad', tasa_iva: 'IVA_10',
  descripcion: '', es_perecedero: false, visible_online: true,
  imagen_url: null
});
const form = ref(formVacio());

let timerBusqueda;
function debounceBuscar() {
  clearTimeout(timerBusqueda);
  timerBusqueda = setTimeout(() => { pagina.value = 1; cargar(); }, 400);
}

async function cargar() {
  cargando.value = true;
  try {
    const params = {
      pagina: pagina.value, limite: 20,
      activo: filtros.value.activo,
      ...(filtros.value.categoria_id && { categoria_id: filtros.value.categoria_id }),
      ...(filtros.value.busqueda      && { busqueda:     filtros.value.busqueda })
    };
    const { data } = await api.get('/productos', { params });
    productos.value    = data.productos;
    total.value        = data.total;
    totalPaginas.value = data.paginas;
  } catch { productos.value = []; }
  finally  { cargando.value = false; }
}

async function cargarCategorias() {
  const { data } = await api.get('/categorias');
  categorias.value = data;
}

function cambiarPagina(n) {
  if (n < 1 || n > totalPaginas.value) return;
  pagina.value = n; cargar();
}

function stockClase(p) {
  if (p.stock_actual <= 0)              return 'text-red-600';
  if (p.stock_actual <= p.stock_minimo) return 'text-orange-500';
  return 'text-green-700';
}

function formatGs(v) {
  return 'Gs. ' + Number(v).toLocaleString('es-PY');
}

function abrirModalNuevo() {
  editando.value = false; form.value = formVacio();
  previstaImagen.value = null; archivoImagen.value = null;
  errorModal.value = ''; modalAbierto.value = true;
}

function abrirModalEditar(p) {
  editando.value = true;
  form.value = { ...p };
  previstaImagen.value = null; archivoImagen.value = null;
  errorModal.value = ''; modalAbierto.value = true;
}

function cerrarModal() { modalAbierto.value = false; }
function verLotes(p)   { productoSeleccionado.value = p; }

function previsualizar(e) {
  const archivo = e.target.files[0];
  if (!archivo) return;
  archivoImagen.value  = archivo;
  previstaImagen.value = URL.createObjectURL(archivo);
}

// Mapa de palabras clave → foto Unsplash (sin API key)
const IMAGEN_MAP = [
  [['leche'],                    'photo-1563636619-e9143da7973b'],
  [['yogur'],                    'photo-1488477181946-6428a0291777'],
  [['queso'],                    'photo-1486297678162-eb2a19b0a32d'],
  [['manteca'],                  'photo-1589985270826-4b7bb135bc9d'],
  [['coca','pepsi','sprite','gaseosa','refresco'], 'photo-1581006852262-e4307cf6283a'],
  [['agua'],                     'photo-1548839140-29a749e1cf4d'],
  [['jugo','zumo'],              'photo-1600271886742-f049cd451bba'],
  [['té','te negro','yerba'],    'photo-1544787219-7f47ccb76574'],
  [['arroz'],                    'photo-1586201375761-83865001e31c'],
  [['fideos','pasta','spaghetti','tallarín'], 'photo-1563379926898-05f4575a45d8'],
  [['azúcar','azucar'],          'photo-1574484284002-952d92456975'],
  [['aceite'],                   'photo-1474979266404-7eaacbcd87c5'],
  [['sal ','sal\n'],             'photo-1584812989895-2d8ff9e44e85'],
  [['harina'],                   'photo-1509440159596-0249088772ff'],
  [['tomate'],                   'photo-1546039907-7fa05f864c02'],
  [['lenteja','poroto','legumbre'], 'photo-1585664811087-47f65abbad64'],
  [['avena'],                    'photo-1517093157656-b9eccef91cb1'],
  [['café','cafe'],              'photo-1495474472287-4d71bcdd2085'],
  [['pollo','pechuga','muslo'],  'photo-1548550023-2bdb3c5beed7'],
  [['carne','molida','vacuna'],  'photo-1607623814075-e51df1bdc82f'],
  [['huevo'],                    'photo-1506976785307-8732e854ad03'],
  [['salchicha','jamón','jamon','fiambre'], 'photo-1553909489-cd47e0907980'],
  [['pan ','lactal','pan\n'],    'photo-1509440159596-0249088772ff'],
  [['galletita','bizcocho','cookie'], 'photo-1558961363-fa8fdf82db35'],
  [['papel higiénico','papel higienico','papel'], 'photo-1584556812952-905ffd0c611a'],
  [['detergente','lavandina','suavizante','esponja'], 'photo-1563453392212-326f5e854473'],
  [['desengrasante'],            'photo-1583947581924-860bda6a26df'],
  [['champú','champu','shampoo'], 'photo-1617922001439-4a2e6562f328'],
  [['jabón dove','jabon dove'],  'photo-1556228578-8c89e6adf883'],
  [['pasta dental','dentífrico','cepillo'], 'photo-1559580665-9d9430d91c71'],
  [['desodorante'],              'photo-1585914924626-915d6f0ecb05'],
  [['pringles','papas fritas','chips'], 'photo-1621939514649-280e2ee25f60'],
  [['chocolate','milka','cofler'], 'photo-1606312619070-d48b4c652a52'],
  [['oreo','galleta rellena'],   'photo-1558961363-fa8fdf82db35'],
  [['maní','mani','cacahuate'],  'photo-1574570072397-5e7c73c6ad97'],
  [['caramelo','dulce'],         'photo-1582058091505-f87a2e55a40f'],
  [['jabón en barra','jabon en barra'], 'photo-1583947581924-860bda6a26df'],
];

function sugerirImagen() {
  const n = (form.value.nombre || '').toLowerCase();
  if (!n) { errorModal.value = 'Escribí primero el nombre del producto.'; return; }
  errorModal.value = '';
  for (const [palabras, fotoId] of IMAGEN_MAP) {
    if (palabras.some(p => n.includes(p))) {
      form.value.imagen_url = `https://images.unsplash.com/${fotoId}?w=500&q=80`;
      previstaImagen.value  = null;
      archivoImagen.value   = null;
      return;
    }
  }
  // Fallback genérico: supermercado
  form.value.imagen_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80';
  previstaImagen.value  = null;
  archivoImagen.value   = null;
}

async function guardarProducto() {
  guardando.value = true; errorModal.value = '';
  try {
    const fd = new FormData();
    Object.entries(form.value).forEach(([k, v]) => {
      if (v !== null && v !== undefined && k !== 'imagen_url' && k !== 'categoria' && k !== 'lotes')
        fd.append(k, v);
    });
    if (archivoImagen.value) {
      fd.append('imagen', archivoImagen.value);
    } else if (form.value.imagen_url) {
      fd.append('imagen_url', form.value.imagen_url);
    }

    if (editando.value) {
      await api.put(`/productos/${form.value.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    } else {
      await api.post('/productos', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    cerrarModal(); cargar();
  } catch (err) {
    errorModal.value = err.response?.data?.error || 'Error al guardar';
  } finally {
    guardando.value = false;
  }
}

async function confirmarArchivar(p) {
  if (!confirm(`¿Archivar "${p.nombre}"?`)) return;
  try { await api.delete(`/productos/${p.id}`); cargar(); }
  catch (err) { alert(err.response?.data?.error || 'Error al archivar'); }
}

async function importarCSV(e) {
  const archivo = e.target.files[0];
  if (!archivo) return;
  const fd = new FormData(); fd.append('csv', archivo);
  try {
    const { data } = await api.post('/productos/import-csv', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    alert(`${data.mensaje}${data.errores?.length ? `\n${data.errores.length} fila(s) con errores.` : ''}`);
    cargar();
  } catch (err) { alert(err.response?.data?.error || 'Error al importar'); }
  e.target.value = '';
}

onMounted(() => { cargar(); cargarCategorias(); });
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
