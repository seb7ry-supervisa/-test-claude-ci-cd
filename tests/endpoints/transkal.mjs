export default [
  {
    name: 'Simular error de control de acceso (báscula)',
    method: 'POST',
    path: '/transkal/srvipservices/SPRBOperacionControlAccesos/error',
    body: null,
    schema: {
      type: 'object',
      required: ['resultado', 'operacionFinalizada', 'tipoMovimiento', 'tipoPaso'],
      properties: {
        resultado: { const: 'ERROR' },
        errores: {
          type: 'array',
          items: {
            type: 'object',
            required: ['locale', 'codigo', 'mensaje'],
            properties: {
              locale: { type: 'string' },
              pincode: { type: 'string' },
              codigo: { type: 'string' },
              mensaje: { type: 'string' }
            }
          }
        },
        mensajes: { type: 'array' },
        operacionFinalizada: { type: 'string' },
        tipoMovimiento: { type: 'string' },
        tipoPaso: { type: 'string' }
      }
    }
  },
  {
    name: 'Simular respuesta positiva de control de acceso (báscula)',
    method: 'POST',
    path: '/transkal/srvipservices/SPRBOperacionControlAccesos',
    body: null,
    schema: {
      type: 'object',
      required: ['resultado', 'matricula', 'puerta', 'tipoPaso', 'datosCamionero'],
      properties: {
        resultado: { const: 'OK' },
        mensajes: { type: 'array' },
        matricula: { type: 'string' },
        pesoBascula: { type: 'string' },
        idVisita: { type: 'string' },
        puerta: { type: 'string' },
        operacionFinalizada: { type: 'string' },
        tipoMovimiento: { type: 'string' },
        tipoPaso: { type: 'string' },
        datosCamionero: {
          type: 'object',
          required: ['dni', 'nombreCamionero', 'apellidoCamionero'],
          properties: {
            dni: { type: 'string' },
            nombreCamionero: { type: 'string' },
            apellidoCamionero: { type: 'string' },
            nombreApellidos: { type: 'string' },
            numTarjeta: { type: 'string' }
          }
        }
      }
    }
  },
  {
    name: 'Consultar cita (SolicitudCitas) — con cita activa por placa',
    method: 'POST',
    path: '/transkal/srvipservices/XXXSolicitudCitas',
    body: { tractora: 'LRN504', idPlataforma: 'PLAT-01', puntoControl: 'GARITA-02' },
    schema: {
      type: 'object',
      required: ['resultado', 'citas'],
      properties: {
        resultado: { const: 'OK' },
        idPlataforma: {},
        puntoControl: {},
        tractora: { type: 'string' },
        citas: {
          type: 'array',
          items: {
            type: 'object',
            required: ['estadoCita', 'matriculaTractora'],
            properties: {
              pincode: { type: 'string' },
              estadoCita: { type: 'string' },
              tipoVehiculo: { type: 'string' },
              matriculaTractora: { type: 'string' },
              matriculaRemolque: { type: 'string' }
            }
          }
        }
      }
    }
  },
  {
    name: 'Consultar cita (SolicitudCitas) — sin datos de búsqueda (error)',
    method: 'POST',
    path: '/transkal/srvipservices/XXXSolicitudCitas',
    body: {},
    schema: {
      type: 'object',
      required: ['resultado', 'errores'],
      properties: {
        resultado: { const: 'ERROR' },
        errores: {
          type: 'array',
          items: {
            type: 'object',
            required: ['locale', 'codigo', 'mensaje'],
            properties: {
              locale: { type: 'string' },
              codigo: { type: 'string' },
              mensaje: { type: 'string' }
            }
          }
        }
      }
    }
  }
]
