/**
 * orden-form.js
 * ------------------------------------------------------------
 * Permite crear y editar órdenes de trabajo.
 * También calcula automáticamente el total = valor x cantidad.
 */

const ORDEN_FORM_KEY = 'acme_ordenes';

document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.querySelector('#form-orden');
  const id = new URLSearchParams(window.location.search).get('id');
  const orden = id ? Storage.findBy(ORDEN_FORM_KEY, 'id', id) : null;

  // Carga los datos existentes cuando el usuario está editando.
  if (orden) {
    ['cliente', 'responsable', 'metodo', 'estado', 'producto', 'valor', 'cantidad', 'total'].forEach(campo => {
      document.querySelector(`#${campo}`).value = orden[campo] ?? '';
    });

    document.querySelector('h2').textContent = 'Editar orden de trabajo';
    document.querySelector('#btn-guardar').textContent = 'Guardar cambios';
  }

  // Recalcula el total cada vez que cambia el valor o la cantidad.
  const calcularTotal = () => {
    const valor = Number(document.querySelector('#valor').value) || 0;
    const cantidad = Number(document.querySelector('#cantidad').value) || 0;
    document.querySelector('#total').value = valor * cantidad;
  };

  document.querySelector('#valor').addEventListener('input', calcularTotal);
  document.querySelector('#cantidad').addEventListener('input', calcularTotal);

  // Guarda la orden nueva o actualiza la orden existente.
  formulario.addEventListener('submit', evento => {
    evento.preventDefault();

    const datos = Object.fromEntries(new FormData(formulario).entries());
    datos.valor = Number(datos.valor);
    datos.cantidad = Number(datos.cantidad);
    datos.total = datos.valor * datos.cantidad;

    if (id && orden) {
      Storage.updateBy(ORDEN_FORM_KEY, 'id', id, datos);
    } else {
      Storage.add(ORDEN_FORM_KEY, {
        id: siguienteId(ORDEN_FORM_KEY, 'ORD'),
        ...datos
      });
    }

    window.location.href = 'ordenes.html';
  });

  // Cancelar vuelve a la lista sin guardar.
  document.querySelector('.btn-secondary').addEventListener('click', evento => {
    evento.preventDefault();
    window.location.href = 'ordenes.html';
  });
});

// Genera el siguiente ID de orden disponible.
function siguienteId(key, prefijo) {
  const mayor = Storage.getAll(key).reduce((maximo, elemento) => {
    const numero = Number((elemento.id || '').split('-')[1]) || 0;
    return Math.max(maximo, numero);
  }, 0);

  return `${prefijo}-${String(mayor + 1).padStart(3, '0')}`;
}
