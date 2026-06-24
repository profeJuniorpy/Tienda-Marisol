'use strict';

/**
 * Tests para StockService.descontarFEFO()
 *
 * Se usan mocks de los modelos Sequelize para no depender de una BD real.
 * Los casos cubren: descuento en un lote, múltiples lotes FEFO, stock insuficiente.
 */

jest.mock('../src/models', () => {
  const mockTransaction = { LOCK: { UPDATE: 'UPDATE' } };

  return {
    Lote:            { findAll: jest.fn() },
    Producto:        { findByPk: jest.fn(), decrement: jest.fn() },
    MovimientoStock: { create:   jest.fn() },
    Alerta:          { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn() }
  };
});

const { descontarFEFO, verificarDisponibilidad, generarAlertas } = require('../src/services/stock.service');
const { Lote, Producto, MovimientoStock, Alerta } = require('../src/models');

// Helper para crear un lote mock con un spy de save/update
function crearLoteMock({ id, cantidad_actual, fecha_vencimiento, fecha_ingreso }) {
  const lote = {
    id,
    producto_id: 1,
    cantidad_actual,
    fecha_vencimiento,
    fecha_ingreso: fecha_ingreso || '2026-01-01',
    update: jest.fn(async (data) => { Object.assign(lote, data); })
  };
  return lote;
}

function crearProductoMock(stock_actual) {
  const p = {
    id: 1,
    nombre: 'Tomate',
    stock_actual,
    stock_minimo: 5,
    activo: true,
    update: jest.fn(async (data) => { Object.assign(p, data); })
  };
  return p;
}

const txMock = {
  LOCK: { UPDATE: 'UPDATE' }
};

beforeEach(() => {
  jest.clearAllMocks();
  MovimientoStock.create.mockResolvedValue({});
});

// ─── descontarFEFO ─────────────────────────────────────────────────────────────

describe('StockService.descontarFEFO', () => {
  test('descuenta de un único lote cuando hay stock suficiente', async () => {
    const lote1    = crearLoteMock({ id: 1, cantidad_actual: 20, fecha_vencimiento: '2026-07-10' });
    const producto = crearProductoMock(20);

    Lote.findAll.mockResolvedValue([lote1]);
    Producto.findByPk.mockResolvedValue(producto);

    const resultado = await descontarFEFO(1, 5, txMock);

    expect(lote1.update).toHaveBeenCalledWith({ cantidad_actual: 15 }, { transaction: txMock });
    expect(producto.update).toHaveBeenCalledWith({ stock_actual: 15 }, { transaction: txMock });
    expect(resultado).toEqual([{ lote_id: 1, cantidad: 5 }]);
  });

  test('distribuye el consumo entre múltiples lotes según FEFO (vencimiento más próximo primero)', async () => {
    // Lote A vence antes → debe consumirse primero
    const loteA = crearLoteMock({ id: 1, cantidad_actual: 3, fecha_vencimiento: '2026-06-25' });
    const loteB = crearLoteMock({ id: 2, cantidad_actual: 10, fecha_vencimiento: '2026-07-15' });
    const producto = crearProductoMock(13);

    // El ORM devuelve los lotes ya ordenados por fecha_vencimiento ASC (como en producción)
    Lote.findAll.mockResolvedValue([loteA, loteB]);
    Producto.findByPk.mockResolvedValue(producto);

    const resultado = await descontarFEFO(1, 8, txMock);

    // Debe consumir 3 del lote A y 5 del lote B
    expect(loteA.update).toHaveBeenCalledWith({ cantidad_actual: 0 }, { transaction: txMock });
    expect(loteB.update).toHaveBeenCalledWith({ cantidad_actual: 5 }, { transaction: txMock });
    expect(resultado).toEqual([
      { lote_id: 1, cantidad: 3 },
      { lote_id: 2, cantidad: 5 }
    ]);
    expect(producto.update).toHaveBeenCalledWith({ stock_actual: 5 }, { transaction: txMock });
  });

  test('consume exactamente todos los lotes disponibles', async () => {
    const loteA = crearLoteMock({ id: 1, cantidad_actual: 4, fecha_vencimiento: '2026-06-20' });
    const loteB = crearLoteMock({ id: 2, cantidad_actual: 6, fecha_vencimiento: '2026-06-28' });
    const producto = crearProductoMock(10);

    Lote.findAll.mockResolvedValue([loteA, loteB]);
    Producto.findByPk.mockResolvedValue(producto);

    const resultado = await descontarFEFO(1, 10, txMock);

    expect(resultado).toEqual([
      { lote_id: 1, cantidad: 4 },
      { lote_id: 2, cantidad: 6 }
    ]);
    expect(producto.update).toHaveBeenCalledWith({ stock_actual: 0 }, { transaction: txMock });
  });

  test('lanza error cuando el stock total es insuficiente', async () => {
    const lote1 = crearLoteMock({ id: 1, cantidad_actual: 3, fecha_vencimiento: '2026-07-01' });
    const producto = crearProductoMock(3);

    Lote.findAll.mockResolvedValue([lote1]);
    Producto.findByPk.mockResolvedValue(producto);

    await expect(descontarFEFO(1, 10, txMock))
      .rejects
      .toThrow(/stock insuficiente/i);

    // El producto NO debe haberse actualizado antes del error
    expect(producto.update).not.toHaveBeenCalled();
  });

  test('lanza error cuando no hay ningún lote disponible', async () => {
    Lote.findAll.mockResolvedValue([]);
    Producto.findByPk.mockResolvedValue(crearProductoMock(0));

    await expect(descontarFEFO(1, 1, txMock))
      .rejects
      .toThrow(/stock insuficiente/i);
  });

  test('registra un MovimientoStock por cada lote consumido', async () => {
    const loteA = crearLoteMock({ id: 10, cantidad_actual: 5, fecha_vencimiento: '2026-06-25' });
    const loteB = crearLoteMock({ id: 11, cantidad_actual: 5, fecha_vencimiento: '2026-07-10' });
    const producto = crearProductoMock(10);

    Lote.findAll.mockResolvedValue([loteA, loteB]);
    Producto.findByPk.mockResolvedValue(producto);

    await descontarFEFO(1, 7, txMock);

    expect(MovimientoStock.create).toHaveBeenCalledTimes(2);
    expect(MovimientoStock.create).toHaveBeenCalledWith(
      expect.objectContaining({ lote_id: 10, tipo: 'salida', cantidad: 5 }),
      expect.any(Object)
    );
    expect(MovimientoStock.create).toHaveBeenCalledWith(
      expect.objectContaining({ lote_id: 11, tipo: 'salida', cantidad: 2 }),
      expect.any(Object)
    );
  });
});

// ─── verificarDisponibilidad ───────────────────────────────────────────────────

describe('StockService.verificarDisponibilidad', () => {
  test('retorna disponible cuando el stock es suficiente', async () => {
    Producto.findByPk.mockResolvedValue(crearProductoMock(20));
    const r = await verificarDisponibilidad(1, 10);
    expect(r.disponible).toBe(true);
  });

  test('retorna no disponible cuando el stock es insuficiente', async () => {
    Producto.findByPk.mockResolvedValue(crearProductoMock(3));
    const r = await verificarDisponibilidad(1, 5);
    expect(r.disponible).toBe(false);
    expect(r.motivo).toMatch(/insuficiente/i);
  });

  test('retorna no disponible para producto inactivo', async () => {
    Producto.findByPk.mockResolvedValue({ ...crearProductoMock(100), activo: false });
    const r = await verificarDisponibilidad(1, 1);
    expect(r.disponible).toBe(false);
  });
});
