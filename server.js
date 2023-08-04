const express = require("express")
const fileupload = require("express-fileupload")
const path = require("path")
const app = express()

// Definir una ruta que reciba un parametro nombre de archivo para ser eliminado, deben usar el método delete.
// Recuerden que este método no admite body, deben enviar el nombre por parámetro en la URL.
const fs = require("fs")



//Constante utilizada para conocer los tipos de archivo permitidos en la ruta upload
const extensionesPermitidas = []
//Constante para definir peso máximo del archivo a subir (Valor expresado en MB)
const maximoPermitido = 3

app.use(express.json())
app.use(fileupload({ createParentPath: true}))

app.listen(3000, () => console.log("Servidor en ejecución"))

app.post("/upload", async(request, response) => {
    console.log(request.files);
    if(!request.files) {
        return response.status(400).json({success: false, message: "Por favor subir un archivo"})
    }
    const datosArchivo = request.files.archivo

    //Añadir los mimetype permitidos en un array, y realizar la validación con un includes o función similar
    if(datosArchivo.mimetype !== 'image/png' && datosArchivo.mimetype !== 'image/jpeg') {
        return response.status(400).json({success: false, message: "Subir un archivo con formato válido"})
    }
    const nombre = datosArchivo.name
    // Obtener extensión del archivo.No fue necesario para este ejemplo pero si para futuras aplicaciones
    const { ext } = path.parse(nombre)
    console.log(ext);
    // Fin obtener extensión
    const marca = Date.now();
    const ruta = `${__dirname}/files/${marca}-${nombre}`
    await datosArchivo.mv(ruta)
    response.json({ success: true, message: "Ruta para subir archivo"})
})