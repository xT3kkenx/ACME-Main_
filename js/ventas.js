/**
 * ventas.js
 * ------------------------------------------------------------
 * Controla la tabla de ventas: cargar, buscar, editar y eliminar.
 */

const VENTAS_KEY = 'acme_ventas';

// Datos que aparecen solamente la primera vez que no existen ventas guardadas.
const VENTAS_INICIALES = [
  { id: 'VEN-001', cliente: 'Juan', fecha: '2026-08-01', producto: 'Producto general', cantidad: 2, valor: 50000, total: 100000 },
  { id: 'VEN-002', cliente: 'Andres', fecha: '2026-08-02', producto: 'Producto general', cantidad: 1, valor: 50000, total: 50000 },
  { id: 'VEN-003', cliente: 'Nicol', fecha: '2026-08-03', producto: 'Producto general', cantidad: 3, valor: 60000, total: 180000 },
  { id: 'VEN-004', cliente: 'Alejandro', fecha: '2026-08-04', producto: 'Producto general', cantidad: 1, valor: 70000, total: 70000 }
];

// Inicializa la tabla cuando el documento termina de cargar.
document.addEventListener('DOMContentLoaded', () => {
  Storage.seedIfEmpty(VENTAS_KEY, VENTAS_INICIALES);
  renderizarVentas(Storage.getAll(VENTAS_KEY));
  configurarBuscador();
});

// Construye las filas de ventas y los botones flotantes.
function renderizarVentas(ventas) {
  const tbody = document.querySelector('#tabla-ventas tbody');

  if (ventas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">No se encontraron ventas.</td></tr>';
    return;
  }

  tbody.innerHTML = ventas.map(venta => `
    <tr>
      <td>${escaparHtml(venta.cliente)}</td>
      <td>${escaparHtml(venta.cantidad)}</td>
      <td class="celda-disponible">
        $${formatearDinero(venta.total)}
        <span class="icono-flotante-wrap">
          <a class="icono-accion icono-editar"
             href="nueva-venta.html?id=${encodeURIComponent(venta.id)}"
             title="Editar venta" aria-label="Editar venta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
            </svg>
          </a>
          <button type="button" class="icono-accion icono-eliminar"
                  data-id="${escaparHtml(venta.id)}"
                  title="Eliminar venta" aria-label="Eliminar venta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
            </svg>
          </button>
        </span>
      </td>
    </tr>
  `).join('');

  // Conecta los botones de eliminar.
  tbody.querySelectorAll('.icono-eliminar').forEach(boton => {
    boton.addEventListener('click', () => eliminarVenta(boton.dataset.id));
  });
}

// Elimina una venta y actualiza la tabla.
function eliminarVenta(id) {
  if (!confirm('¿Eliminar esta venta?')) return;

  Storage.removeBy(VENTAS_KEY, 'id', id);

  const buscador = document.querySelector('#buscador-ventas');
  renderizarVentas(filtrarVentas(buscador ? buscador.value : ''));
}

// Activa el filtro en tiempo real.
function configurarBuscador() {
  const input = document.querySelector('#buscador-ventas');
  if (!input) return;

  input.addEventListener('input', () => {
    renderizarVentas(filtrarVentas(input.value));
  });
}

// Busca por cliente, producto, fecha, cantidad, total o ID.
function filtrarVentas(termino) {
  const buscado = termino.trim().toLowerCase();
  const todas = Storage.getAll(VENTAS_KEY);
  if (buscado === '') return todas;

  return todas.filter(venta => [
    venta.id,
    venta.cliente,
    venta.producto,
    venta.fecha,
    venta.cantidad,
    venta.total
  ].some(valor => String(valor || '').toLowerCase().includes(buscado)));
}

// Formatea valores monetarios.
function formatearDinero(valor) {
  return Number(valor || 0).toLocaleString('es-CO');
}

// Evita insertar HTML no deseado desde los datos guardados.
function escaparHtml(texto = '') {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}
