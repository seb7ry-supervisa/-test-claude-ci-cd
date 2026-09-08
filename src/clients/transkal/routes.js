const router = require('express').Router()

/**
 * @name EndPoint que permite realizar el envio de mensajes de texto
 * @param { cellphoneTo, bodyMessage}
 * @returns json con el estado de la transacción y una observación
 */

/**
 * Simular Error
 * */
router.post('/srvipservices/SPRBOperacionControlAccesos/error', (req, res) => {
    console.log("[/transkal/srvipservices/SPRBOperacionControlAccesos");
    console.log("Body:", req.body);
    console.log("Headers:", req.headers);

    res.status(200).json({
        "resultado": "ERROR",
        "errores": [
            {
                "locale": "es_ES",
                "pincode": "240201000022",
                "codigo": "10",
                "mensaje": "El peso introducido [25000.0] es similar al peso anterior obtenido [25000.0] el [24/09/2024 10:15]."
            }
        ],
        "mensajes": [
            {
                "locale": "es_ES",
                "mensaje": "Error."
            }
        ],
        "operacionFinalizada": "true",
        "tipoMovimiento": "WEIGHT",
        "tipoPaso": "NO PASAR"
    });
});

/**
 * Simular Respuesta Positiva
 * */
router.post('/srvipservices/SPRBOperacionControlAccesos', (req, res) => {
    console.log("[/transkal/srvipservices/SPRBOperacionControlAccesos");
    console.log("Body:", req.body);
    console.log("Headers:", req.headers);

    res.status(200).json({
        "resultado": "OK",
        "mensajes": [
            {
                "locale": "es_ES",
                "mensaje": "Diríjase al siguiente [Control de acceso para BASCULA] en el punto de control [cualquiera de los siguientes : <br />-Basc. 03 - Entrada de VH<br />-Basc. 01 - Entrada de VH<br />-Basc. Almagran<br />-Basc. 06 - Diagonal Bod. 3<br />-Basc. 11 - Salida de VH<br />-Basc. 05 - Diagonal Bod. 3<br />-Basc. 10 - Salida de VH<br />-Basc. 02 - Entrada de VH<br />-Basc 9 - S Vh pesados<br />-Basc 4 - E/S ZF]."
            },
            {
                "locale": "es_ES",
                "mensaje": "Su peso es 25000."
            }
        ],
        "matricula": "WTQ250",
        "pesoBascula": "25000",
        "idVisita": "20240201#000002",
        "puerta": "BASCULA_11",
        "operacionFinalizada": "true",
        "tipoMovimiento": "WEIGHT",
        "tipoPaso": "PERMITIDO",
        "datosCamionero": {
            "dni": "123",
            "nombreCamionero": "LUIS",
            "apellidoCamionero": "DE LA HOZ",
            "nombreApellidos": "LUIS DE LA HOZ",
            "numTarjeta": ""
        }
    })
});

/**
 * Simular Consulta de Cita (SolicitudCitas)
 * Búsqueda por placa (tractora):
 *   5998LVV   → cita activa (RESERVADA)
 *   SIN000    → sin cita
 *   otra      → ERROR
 *
 * Búsqueda por documento (documento):
 *   1234567890 → cita activa (RESERVADA)
 *   0000000000 → sin cita
 *   otro       → ERROR
 *
 * Si vienen ambos campos, tractora tiene prioridad.
 */
router.post('/srvipservices/XXXSolicitudCitas', (req, res) => {
    console.log("[/transkal/srvipservices/XXXSolicitudCitas]");
    console.log("Body:", req.body);
    console.log("Headers:", req.headers);

    const tractora   = req.body.tractora   || null;
    const documento  = req.body.documento  || null;
    const searchKey  = tractora || documento;

    if (!searchKey) {
        return res.status(200).json({
            "resultado": "ERROR",
            "errores": [
                {
                    "locale": "es_ES",
                    "codigo": "10",
                    "mensaje": "Debe indicar tractora o documento para realizar la consulta."
                }
            ]
        });
    }

    const citaActiva = (matricula) => ({
        "pincode": "240209001595",
        "estadoCita": "RESERVADA",
        "tipoVehiculo": "DIRECTO", //URBANO o DIRECTO
        "numeroEjes": 5,
        "configuracionEjes": "3S2",
        "requiereInspeccion": false,
        "rueda": false,
        "numeroMaximoAccesos": 0,
        "taraSiempre": true,
        "accesosSinTara": 0,
        "taraFechaInicioValidezTara": 0,
        "taraFechaFinValidezTara": 0,
        "taraValidezMinutos": 0,
        "taraKilosDecrementar": 0,
        "fechaInicioCita": "12-02-2024T00:01:00",
        "fechaFinCita": "12-02-2024T23:59:00",
        "matriculaTractora": matricula || "5998LVV",
        "matriculaRemolque": "R1303BDF",
        "parteDeOperacion": [
            {
                "idOperacion": "PA 36321",
                "puntoControl": "CAR_BASCULA-D",
                "tipoOperacion": "CARGA",
                "fechaHoraOperacion": "09-02-2024T19:40:06",
                "idCliente": "1672300",
                "nombreCliente": "TOLOSA Y VALIENTE SA",
                "dniCliente": "ESA02000875",
                "medioLlegada": matricula || "5998LVV",
                "plataformaLlegada": "R1303BDF",
                "codigoConductorLlegada": "1013097927",
                "nombreConductorLlegada": "ANGEL RAMON VALCARCEL LOPEZ",
                "lugarDescarga": "TOLOSA Y VALIENTE SA",
                "pma": "40000",
                "lineas": [
                    {
                        "idCliente": "1252",
                        "dniCliente": "ESA02000875",
                        "idPtr": 38520,
                        "articulo": "TRIGO FORRAJERO",
                        "referencia1": "69-4753.1.EE",
                        "referencia2": "N/A",
                        "referencia3": "N/A",
                        "referencia4": "N/A",
                        "cantidad1": 0,
                        "cantidad2": 0,
                        "cantidad3": 0,
                        "cantidad4": 0,
                        "cantidadAutorizada": 64320,
                        "cantidadDisponible": 64320,
                        "idAlmacenOrigen": "417",
                        "ubicacionOrigen": "484"
                    }
                ]
            }
        ]
    });

    // Escenarios por placa
    if (tractora) {
        if (tractora === 'LRN504') {
            return res.status(200).json({
                "resultado": "OK",
                "idPlataforma": req.body.idPlataforma,
                "puntoControl": req.body.puntoControl,
                "tractora": tractora,
                "citas": [citaActiva(tractora)]
            });
        }
        if (tractora === 'SIN000' || tractora === 'ABC123') {
            return res.status(200).json({
                "resultado": "OK",
                "idPlataforma": req.body.idPlataforma,
                "puntoControl": req.body.puntoControl,
                "tractora": tractora,
                "citas": []
            });
        }
        return res.status(200).json({
            "resultado": "ERROR",
            "errores": [
                {
                    "locale": "es_ES",
                    "codigo": "10",
                    "mensaje": "No se encontró información para la matrícula indicada: " + tractora
                }
            ]
        });
    }

    // Escenarios por documento
    if (documento === '1110579790') {
        return res.status(200).json({
            "resultado": "OK",
            "idPlataforma": req.body.idPlataforma,
            "puntoControl": req.body.puntoControl,
            "documento": documento,
            "citas": [citaActiva(null)]
        });
    }
    if (documento === '0000000000') {
        return res.status(200).json({
            "resultado": "OK",
            "idPlataforma": req.body.idPlataforma,
            "puntoControl": req.body.puntoControl,
            "documento": documento,
            "citas": []
        });
    }
    return res.status(200).json({
        "resultado": "ERROR",
        "errores": [
            {
                "locale": "es_ES",
                "codigo": "10",
                "mensaje": "No se encontró información para el documento indicado: " + documento
            }
        ]
    });
});

module.exports = router
