const express = require("express")
const fileupload = require("express-fileupload")
const path = require("path")
const app = express()

// Definir una ruta que reciba un parametro nombre de archivo para ser eliminado, deben usar el método delete.
// Recuerden que este método no admite body, deben enviar el nombre por parámetro en la URL.
const fs = require("fs")

app.use("/bootstrap", express.static(`${__dirname}/node_modules/bootstrap/dist`))
app.use("/jquery", express.static(`${__dirname}/node_modules/jquery/dist`))
app.use("/public", express.static(`${__dirname}/assets`))


//Constante utilizada para conocer los tipos de archivo permitidos en la ruta upload
const extensionesPermitidas = []
//Constante para definir peso máximo del archivo a subir (Valor expresado en MB)
const maximoPermitido = 3

const rutaFotos = "./assets/img/fotos"

const host = "http://localhost:3000"

app.use(express.json())
app.use(fileupload({ createParentPath: true}))

app.listen(3000, () => console.log("Servidor en ejecución"))

const rutaBase = `${__dirname}/files`

app.post("/upload", async(request, response) => {
    console.log(request.files);
    console.log(request.body);
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

// Ruta para listar archivos
app.get("/archivos", async(req, res) => {
    const archivos = fs.readdirSync(rutaBase)
    const respuesta = []
    for (const itemArchivo of archivos) {
        respuesta.push({
            nombre_archivo: itemArchivo,
            ruta: `files/${itemArchivo}`
        })
    }
    return res.json({ success: true, message: "Listado de archivos", data: respuesta})
})


//Ruta para descargar archivos
app.get("/archivos/:nombre", (request, response) => {
    const nombre = request.params.nombre
    response.download(`${rutaBase}/${nombre}`, nombre, (err) => {
        if(err) {
            response.status(500).json({
                success: false,
                message: "Ocurrió un problema descargando el archivo"
            })
        }
    })
})


// Ruta para eliminar archivos
app.delete("/archivos/:nombre_archivo", (request, response) => {
    const nombre = request.params.nombre_archivo
    try {
        fs.unlinkSync(`${rutaBase}/${nombre}`)
        response.json({ success: true, message: `Archivo ${nombre} eliminado con éxito` })
    } catch (error) {
        response.status(500).json({ success: false, message: `Error eliminando el archivo ${nombre}`})
    }
})

app.get("/registro", (request, response) => {
    response.sendFile(`${__dirname}/views/registro.html`)
})

app.post("/registro", async (request, response) => {
    console.log("Body",request.body);
    console.log("Files", request.files);

    const datosFoto = request.files.foto
    const nombreFoto = `${Date.now()}-${datosFoto.name.replace(" ","")}`
    await datosFoto.mv(`${rutaFotos}/${nombreFoto}`)

    const dataArchivo = fs.readFileSync(`${__dirname}/data/personas.txt`,"utf8")
    const arreglo = JSON.parse(dataArchivo)
    arreglo.push({
        ...request.body,
        foto: `public/img/fotos/${nombreFoto}`
    })
    const dataTexto = JSON.stringify(arreglo)
    fs.writeFileSync(`${__dirname}/data/personas.txt`, dataTexto, "utf8")
    response.json({ success: true, message: "Registro exitoso"})
})

app.get("/listado", (request, response) => {
    const dataArchivo = fs.readFileSync(`${__dirname}/data/personas.txt`,"utf8")
    const arreglo = JSON.parse(dataArchivo)
    arreglo.map(item => {
        item.foto = `${host}/${item.foto}`
        return item
    })
    response.json({ success: true, message: "Listado de personas", data: arreglo})
})


// Definir la estructura de un formulario que solicite RUT, nombre, apellido y Foto (utlizar para la foto un input de tipo file)
// Preferiblemente incluir Bootstrap.
// Definir un middleware para publicar archivos (archivos js y css)
