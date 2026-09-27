/**
 * cliente-form.js
 * ------------------------------------------------------------
 * Usa el mismo formulario para crear y editar clientes.
 */

const CLIENTES_FORM_KEY = 'acme_clientes';

// Espera a que el formulario exista en el DOM.
document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.querySelector('#form-cliente');
  const id = new URLSearchParams(window.location.search).get('id');
  const cliente = id ? Storage.findBy(CLIENTES_FORM_KEY, 'id', id) : null;

  // Si hay un ID en la URL, cargamos los datos para editar.
  if (cliente) {
    document.querySelector('#nombre').value = cliente.nombre;
    document.querySelector('#apellido').value = cliente.apellido;
    document.querySelector('#direccion').value = cliente.direccion;
    document.querySelector('#correo').value = cliente.correo;
    document.querySelector('#telefono').value = cliente.telefono;
    document.querySelector('h2').textContent = 'Editar cliente';
    document.querySelector('#btn-guardar').textContent = 'Guardar cambios';
  }

  // Guarda o actualiza cuando se envía el formulario.
  formulario.addEventListener('submit', evento => {
    evento.preventDefault();

    const datos = Object.fromEntries(new FormData(formulario).entries());

    if (!datos.nombre.trim() || !datos.apellido.trim()) {
      alert('Nombre y apellido son obligatorios.');
      return;
    }

    if (id && cliente) {
      Storage.updateBy(CLIENTES_FORM_KEY, 'id', id, datos);
    } else {
      Storage.add(CLIENTES_FORM_KEY, {
        id: siguienteId(CLIENTES_FORM_KEY, 'CLI'),
        ...datos
      });
    }

    window.location.href = 'clientes.html';
  });

  // El botón Cancelar vuelve a la tabla sin guardar cambios.
  document.querySelector('.btn-secondary').addEventListener('click', evento => {
    evento.preventDefault();
    window.location.href = 'clientes.html';
  });
});

// Genera el siguiente ID disponible: CLI-001, CLI-002, etc.
function siguienteId(key, prefijo) {
  const mayor = Storage.getAll(key).reduce((maximo, elemento) => {
    const numero = Number((elemento.id || '').split('-')[1]) || 0;
    return Math.max(maximo, numero);
  }, 0);

  return `${prefijo}-${String(mayor + 1).padStart(3, '0')}`;
}
