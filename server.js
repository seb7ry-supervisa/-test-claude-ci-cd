require('dotenv').config()

const app = require('./src/app')
const http = require('http').createServer(app)

const PORT = process.env.PORT || 4000

http.listen(PORT, () => {
    console.log(`Simuladores API escuchando en el puerto ${PORT}`)
})
