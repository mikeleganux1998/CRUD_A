// Ruta de la API para operaciones relacionadas con alumnos
const apiAlumnos = '/api/alumnos';

// Configuración de Notyf para notificaciones
const notyf = new Notyf({
    duration: 1000, // Duración de la notificación en milisegundos
    position: {
        x: 'right', // Posición horizontal de la notificación
        y: 'top',   // Posición vertical de la notificación
    },
    types: [
        {
            type: 'warning', // Tipo de notificación para advertencias
            background: 'orange', // Color de fondo para advertencias
            icon: '<i class="fas fa-exclamation"></i>', // Icono para advertencias
            duration: 2000, // Duración de la notificación en milisegundos
            dismissible: true // Permite que la notificación sea cerrada manualmente
        },
        {
            type: 'error', // Tipo de notificación para errores
            background: 'indianred', // Color de fondo para errores
            duration: 2000, // Duración de la notificación en milisegundos
            dismissible: true // Permite que la notificación sea cerrada manualmente
        },
        {
            type: 'success', // Tipo de notificación para éxitos
            background: 'green', // Color de fondo para éxitos
            duration: 2000, // Duración de la notificación en milisegundos
            dismissible: true // Permite que la notificación sea cerrada manualmente
        }
    ]
});

// Configuración de textos y mensajes en español para DataTables
const language = {
    lengthMenu: "Mostrar _MENU_ registros",
    zeroRecords: "No se encontraron resultados",
    info: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
    infoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
    infoFiltered: "(filtrado de un total de _MAX_ registros)",
    sSearch: "Buscar:",
    oPaginate: {
        sFirst: "Primero",
        sLast: "Último",
        sNext: "Siguiente",
        sPrevious: "Anterior",
    },
    sProcessing: "Procesando...",
};

// Función para validar el formato del correo electrónico
const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Función para validar el tamaño de la imagen
const validateImageSize = async (imageUrl, width, height) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve(img.width === width && img.height === height);
        };
        img.src = imageUrl;
    });
}

// Función para validar el formato del número de teléfono
const validatePhoneNumber = (phone) => {
    const re = /^\d{10}$/; // Número de teléfono debe tener exactamente 10 dígitos
    return re.test(phone);
}

// Función para crear un nuevo alumno
const createAlumno = async (body) => {
    try {
        const response = await fetch(`${apiAlumnos}/createAlumno`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (response.ok) {
            notyf.success('Alumno creado exitosamente'); // Notificación de éxito
            $('#alumnosModal').modal('hide'); // Cierra el modal
            await drawDataTable(dt); // Actualiza la tabla con los nuevos datos
        } else {
            throw new Error(result.message || 'Error al crear el alumno');
        }
    } catch (error) {
        console.error('Error:', error);
        notyf.error('Hubo un error al crear el alumno'); // Notificación de error
    }
}

// Función para editar un alumno existente
const editAlumno = async (id) => {
    try {
        const response = await fetch(`${apiAlumnos}/editAlumno/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        if (result.success) {
            const alumno = result.alumno;
            console.log("alumno", alumno);

            // Completa el formulario con los datos del alumno
            $('#nombre').val(alumno.nombre);
            $('#apellidos').val(alumno.apellidos);
            $('#calle').val(alumno.calle);
            $('#colonia').val(alumno.colonia);
            $('#correo').val(alumno.correo);
            $('#img_save_edit').val(alumno.fotografia);
            $('#estatus').val(alumno.status);

            // Completa los números de teléfono
            $('.phone-list').empty(); // Limpiar la lista actual de teléfonos
            alumno.telefonos.forEach(phone => {
                const phoneField = `
                    <div class="phone-item mb-3">
                        <input class="form-control phone-number" type="text" value="${phone.number}" required placeholder="Ingresa un teléfono" maxlength="10" pattern="\d{10}">
                        <button type="button" class="btn btn-outline-danger remove-phone">Eliminar</button>
                    </div>`;
                $('.phone-list').append(phoneField);
            });

            $('#alumnosModalLabel').text('Editar Alumno');
            $('#alumnosModal').modal('show');
            $('#saveNewAlumno').hide();
            $('#editAlumno').show().attr('id_alumno', id);
            $('#img_save').attr('isnew', 'false');

        } else {
            notyf.error(result.message || 'Error al obtener los datos del alumno'); // Notificación de error
        }
    } catch (error) {
        console.error('Error:', error);
        notyf.error('Hubo un error al obtener los datos del alumno'); // Notificación de error
    }
};

// Función para actualizar los datos de un alumno
const updateAlumno = async (id, body) => {
    try {
        const response = await fetch(`${apiAlumnos}/updateAlumno/${id}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (response.ok) {
            notyf.success('Alumno actualizado exitosamente'); // Notificación de éxito
            $('#alumnosModal').modal('hide'); // Cierra el modal
            await drawDataTable(dt); // Actualiza la tabla con los datos actualizados
        } else {
            throw new Error(result.message || 'Error al actualizar el alumno');
        }
    } catch (error) {
        console.error('Error:', error);
        notyf.error('Hubo un error al actualizar el alumno'); // Notificación de error
    }
};

// Función para eliminar un alumno
const deleteAlumno = async (id) => {
    try {
        const response = await fetch(`${apiAlumnos}/deleteAlumno/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (response.ok) {
            notyf.success('Alumno eliminado exitosamente'); // Notificación de éxito
            await drawDataTable(dt); // Actualiza la tabla después de eliminar
        } else {
            throw new Error(result.message || 'Error al eliminar el alumno');
        }
    } catch (error) {
        console.error('Error:', error);
        notyf.error('Hubo un error al eliminar el alumno'); // Notificación de error
    }
};
