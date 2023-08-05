$(() => {
    $(document).on("submit", "#formulario-registro", async function(e) {
        e.preventDefault()

        const formData = new FormData()
        formData.append("rut", txtRut.value)
        formData.append("nombre", txtNombre.value)
        formData.append("apellido", txtApellido.value)
        formData.append("foto", fileFoto.files[0])

        await fetch("/registro", {
            method: "POST",
            body: formData
        })

        alert("Enviando")
    })
})