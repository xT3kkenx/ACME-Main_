/**
 * venta-form.js
 * ------------------------------------------------------------
 * Permite crear y editar ventas y calcula el total automáticamente.
 */

const VENTA_FORM_KEY = 'acme_ventas';

document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.querySelector('#form-venta');
  const id = new URLSearchParams(window.location.search).get('id');
  const venta = id ? Storage.findBy(VENTA_FORM_KEY, 'id', id) : null;

  // Carga los datos de la venta si estamos en modo edición.
  if (venta) {
    ['cliente', 'fecha', 'producto', 'valor', 'cantidad', 'total'].forEach(campo => {
      document.querySelector(`#${campo}`).value = venta[campo] ?? '';
    });

    document.querySelector('h2').textContent = 'Editar venta';
    document.querySelector('#btn-guardar').textContent = 'Guardar cambios';
  }

  // Calcula el total de la venta en tiempo real.
  const calcularTotal = () => {
    const valor = Number(document.querySelector('#valor').value) || 0;
    const cantidad = Number(document.querySelector('#cantidad').value) || 0;
    document.querySelector('#total').value = valor * cantidad;
  };

  document.querySelector('#valor').addEventListener('input', calcularTotal);
  document.querySelector('#cantidad').addEventListener('input', calcularTotal);

  // Guarda la venta nueva o actualiza la venta existente.
  formulario.addEventListener('submit', evento => {
    evento.preventDefault();

    const datos = Object.fromEntries(new FormData(formulario).entries());
    datos.valor = Number(datos.valor);
    datos.cantidad = Number(datos.cantidad);
    datos.total = datos.valor * datos.cantidad;

    if (id && venta) {
      Storage.updateBy(VENTA_FORM_KEY, 'id', id, datos);
    } else {
      Storage.add(VENTA_FORM_KEY, {
        id: siguienteId(VENTA_FORM_KEY, 'VEN'),
        ...datos
      });
    }

    window.location.href = 'ventas.html';
  });

  // Cancelar vuelve a la lista.
  document.querySelector('.btn-secondary').addEventListener('click', evento => {
    evento.preventDefault();
    window.location.href = 'ventas.html';
  });
});

// Genera el siguiente ID consecutivo de venta.
function siguienteId(key, prefijo) {
  const mayor = Storage.getAll(key).reduce((maximo, elemento) => {
    const numero = Number((elemento.id || '').split('-')[1]) || 0;
    return Math.max(maximo, numero);
  }, 0);

  return `${prefijo}-${String(mayor + 1).padStart(3, '0')}`;
}
