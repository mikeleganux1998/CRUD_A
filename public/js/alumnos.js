// Configuración de las columnas para la tabla DataTable
const columns = [
    {data: 'nombre'}, // Columna para el nombre del alumno
    {data: 'apellidos'}, // Columna para los apellidos del alumno
    {data: 'calle'}, // Columna para la calle del alumno
    {data: 'colonia'}, // Columna para la colonia del alumno
    {data: 'correo'}, // Columna para el correo electrónico del alumno
    {
        data: 'fotografia', // Columna para la fotografía del alumno
        render: function (data) {
            // Renderiza la fotografía como una imagen
            return `<img src="${data}" class="img-fluid">`
        }
    },
    {
        data: 'telefonosDetails', // Columna para los detalles de los teléfonos del alumno
        render: function (data) {
            // Renderiza los números de teléfono como una lista separada por comas
            if (Array.isArray(data)) {
                return data.map(phone => phone.number).join(', ');
            } else {
                return '';
            }
        }
    },
    {data: 'status'}, // Columna para el estatus del alumno
    {
        data: '_id', // Columna para el ID del alumno (para acciones de edición y eliminación)
        render: function (data, type, row) {
            // Renderiza los botones de editar y eliminar
            return `
                <button class="btn btn-warning btn-sm edit-btn" id_alumno="${data}">Editar</button>
                <button class="btn btn-danger btn-sm delete-btn" id_alumno="${data}">Eliminar</button>
            `;
        }
    }
]

// Inicialización de DataTable con configuración específica
const dt = $('#alumnosTable').DataTable({
    responsive: true, // Habilita la opción de respuesta para la tabla
    language: language, // Configuración de textos en español
    data: [], // Datos iniciales vacíos
    lengthMenu: [
        [5, 10, 15, 25, 50, 100, 1000], // Opciones de número de filas por página
        ["5 rows", "10 rows", "15 rows", "25 rows", "50 rows", "100 rows", "1000 rows"], // Etiquetas para opciones de filas por página
    ],
    order: [
        [0, "asc"], // Ordenar por la primera columna en orden ascendente
    ],
    pageLength: 10, // Número de filas por página
    columns: columns, // Configuración de columnas
    paging: true, // Habilita la paginación
    searching: true, // Habilita la búsqueda
    fixedHeader: true, // Fija el encabezado de la tabla
    bAutoWidth: false, // Desactiva el ajuste automático del ancho de las columnas
    initComplete: function () {
        // Ajusta el formulario de búsqueda para deshabilitar el autocompletado
        $(this.api().table().container())
            .find("input")
            .parent()
            .wrap("<form>")
            .parent()
            .attr("autocomplete", "off");
    },
});

// Función para cargar y mostrar datos en la tabla
const drawDataTable = async (data_table) => {
    HoldOn.open(); // Muestra el indicador de carga

    try {
        const response = await fetch(`${apiAlumnos}/getAlumnos`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok'); // Manejo de errores en la red
        }

        const data = await response.json();
        let data_query = data.alumnos; // Obtiene los datos de alumnos

        data_table.clear(); // Limpia la tabla
        data_table.rows.add(data_query).draw(); // Añade los nuevos datos y dibuja la tabla
    } catch (error) {
        console.error('Error fetching data:', error); // Manejo de errores en la obtención de datos
    } finally {
        HoldOn.close(); // Oculta el indicador de carga
    }
};

// Función principal que se ejecuta cuando el documento está listo
$(async function () {

    // Inicializa la DataTable
    await drawDataTable(dt);

    // Añadir un nuevo campo de teléfono
    $('#addPhone').click(function () {
        const newPhoneField = `
            <div class="phone-item mb-3">
                <input class="form-control phone-number" type="text" name="telefonos[]" required placeholder="Ingresa un teléfono" maxlength="10" pattern="\d{10}">
                <button type="button" class="btn btn-outline-danger remove-phone">Eliminar</button>
            </div>`;
        $('.phone-list').append(newPhoneField); // Añade el nuevo campo al formulario
    });

    // Eliminar un campo de teléfono
    $('.phone-list').on('click', '.remove-phone', function () {
        $(this).closest('.phone-item').remove(); // Elimina el campo de teléfono correspondiente
    });

    // Abrir el modal para agregar un nuevo alumno
    $('#addAlumnoBtn').click(function () {
        $('#alumnosModalLabel').text('Agregar Alumno'); // Cambia el título del modal
        $('#alumnoForm').trigger('reset'); // Resetea el formulario
        $('#alumnosModal').modal('show'); // Muestra el modal

        $('#imagen_input').attr('isnew', 'true'); // Marca el input de imagen como nuevo
        $('#saveNewAlumno').show(); // Muestra el botón para guardar nuevo alumno
        $('#editAlumno').hide(); // Oculta el botón de editar alumno
    });

    // Editar un alumno
    $(document.body).on('click', '.edit-btn', async function () {
        const id = $(this).attr('id_alumno');
        await editAlumno(id); // Llama a la función para editar el alumno
    });

    // Eliminar un alumno
    $(document.body).on('click', '.delete-btn', async function () {
        const id = $(this).attr('id_alumno');
        if (confirm('¿Estás seguro de que deseas eliminar este alumno?')) {
            await deleteAlumno(id); // Llama a la función para eliminar el alumno si se confirma
        }
    });

    // Guardar un nuevo alumno
    $('#saveNewAlumno').click(async function () {
        const status = $('#estatus').val();
        const nombre = $('#nombre').val();
        const apellidos = $('#apellidos').val();
        const calle = $('#calle').val();
        const colonia = $('#colonia').val();
        const correo = $('#correo').val();
        const fotografia = $('#img_save').val();
        const telefonos = $('.phone-number').map(function () {
            return $(this).val();
        }).get();

        // Validaciones de los campos del formulario
        if (!status) {
            notyf.error('El estatus es requerido');
            return;
        }
        if (!nombre) {
            notyf.error('El nombre es requerido');
            return;
        }
        if (!apellidos) {
            notyf.error('Los apellidos son requeridos');
            return;
        }
        if (!calle) {
            notyf.error('La calle es requerida');
            return;
        }
        if (!colonia) {
            notyf.error('La colonia es requerida');
            return;
        }
        if (!correo || !validateEmail(correo)) {
            notyf.error('Un correo válido es requerido');
            return;
        }
        if (!fotografia) {
            notyf.error('La fotografía es requerida');
            return;
        }

        // Validar tamaño de la imagen después de subirla
        const isImageValid = await validateImageSize(fotografia, 350, 350);
        if (!isImageValid) {
            notyf.error('La fotografía debe ser de 350x350 píxeles');
            return;
        }

        if (!telefonos.length || telefonos.some(t => !t || !validatePhoneNumber(t))) {
            notyf.error('Todos los teléfonos deben ser válidos y únicos');
            return;
        }
        if (new Set(telefonos).size !== telefonos.length) {
            notyf.error('Los números de teléfono no deben repetirse');
            return;
        }

        const alumnoData = {
            status,
            nombre,
            apellidos,
            calle,
            colonia,
            correo,
            fotografia,
            telefonos
        };

        await createAlumno(alumnoData); // Llama a la función para crear el nuevo alumno
    });

    // Guardar cambios en un alumno existente
    $('#editAlumno').click(async function () {
        const id = $(this).attr('id_alumno');

        const status = $('#estatus').val();
        const nombre = $('#nombre').val();
        const apellidos = $('#apellidos').val();
        const calle = $('#calle').val();
        const colonia = $('#colonia').val();
        const correo = $('#correo').val();
        const fotografia = $('#img_save_edit').val();
        const telefonos = $('.phone-number').map(function () {
            return $(this).val();
        }).get();

        // Validaciones de los campos del formulario
        if (!status) {
            notyf.error('El estatus es requerido');
            return;
        }
        if (!nombre) {
            notyf.error('El nombre es requerido');
            return;
        }
        if (!apellidos) {
            notyf.error('Los apellidos son requeridos');
            return;
        }
        if (!calle) {
            notyf.error('La calle es requerida');
            return;
        }
        if (!colonia) {
            notyf.error('La colonia es requerida');
            return;
        }
        if (!correo || !validateEmail(correo)) {
            notyf.error('Un correo válido es requerido');
            return;
        }
        if (!fotografia) {
            notyf.error('La fotografía es requerida');
            return;
        }

        // Validar tamaño de la imagen después de subirla
        const isImageValid = await validateImageSize(fotografia, 350, 350);
        if (!isImageValid) {
            notyf.error('La fotografía debe ser de 350x350 píxeles');
            return;
        }

        if (!telefonos.length || telefonos.some(t => !t || !validatePhoneNumber(t))) {
            notyf.error('Todos los teléfonos deben ser válidos y únicos');
            return;
        }
        if (new Set(telefonos).size !== telefonos.length) {
            notyf.error('Los números de teléfono no deben repetirse');
            return;
        }

        const alumnoData = {
            status,
            nombre,
            apellidos,
            calle,
            colonia,
            correo,
            fotografia,
            telefonos
        };

        await updateAlumno(id, alumnoData); // Llama a la función para actualizar el alumno existente
    });

    // Subir imagen
    $('.uploadImage').on('change', function () {
        const formData = new FormData();
        formData.append('file', $(this)[0].files[0]);
        const isNew = $(this).attr('isnew');

        HoldOn.open(); // Muestra el indicador de carga
        $.ajax({
            url: `https://filesServer.mikerosasdev.com/api/upload`,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: async function (response) {
                console.log("response", response);

                if (response.success) {
                    const imageUrl = response.url;
                    const isImageValid = await validateImageSize(imageUrl, 350, 350);
                    if (isImageValid) {
                        if (isNew === 'true') {
                            $('#img_save').val(imageUrl); // Actualiza el campo de imagen para un nuevo alumno
                            notyf.success('Archivo subido correctamente.');
                        } else {
                            $('#img_save_edit').val(imageUrl); // Actualiza el campo de imagen para un alumno existente
                            notyf.success('Archivo subido correctamente.');
                        }
                    } else {
                        notyf.error('La fotografía debe ser de 350x350 píxeles');
                    }
                } else {
                    notyf.error('Hubo un error al subir el archivo.');
                }
                HoldOn.close(); // Oculta el indicador de carga
            },
            error: function (err) {
                console.error('Error al subir archivo:', err);
                notyf.error('Hubo un error al subir el archivo.');
            }
        });
    });

    // Deshabilitar copiar y pegar y prohibir comillas en los inputs
    $('input, textarea').on('paste', function (e) {
        e.preventDefault(); // Prevenir el pegado
        notyf.error('Copiar y pegar no está permitido');
    });

    $('input, textarea').on('keypress', function (e) {
        if (e.key === '"' || e.key === "'") {
            e.preventDefault(); // Prevenir la inserción de comillas
            notyf.error('No se permiten comillas en los campos');
        }
    });
});
