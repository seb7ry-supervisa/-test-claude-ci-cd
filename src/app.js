const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use(cors())

/**
 * Registro central de clientes simulados.
 * Para agregar un cliente nuevo:
 *   1. Crear src/clients/<nombreCliente>/routes.js exportando un express.Router()
 *   2. Agregar una línea aquí: app.use('/<nombreCliente>', require('./clients/<nombreCliente>/routes'))
 */
app.use('/transkal', require('./clients/transkal/routes'))

app.use((error, req, res, next) => {
    res.status(500).json({
        status: 500,
        message: error.message
    })
})

module.exports = app
