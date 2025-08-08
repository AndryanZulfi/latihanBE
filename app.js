const http = require('http')

const requestListener = (request, response) => {
  response.setHeader('Content-Type', 'text/html');

  response.statusCode = 200;

  const { url, method } = request

  if(url == '/'){
    if(method == "GET"){
      response.end(JSON.stringify({
        message: 'Ini adalah homepage'
      }))
    }else{
      response.statusCode = 400
      response.end(JSON.stringify({
        message: `Halaman tidak dapat di akses menggunakan method ${method}`
      }))
    }
  } else if( url == '/about'){
    if(method == 'GET'){
      response.end(JSON.stringify({
        message: "Ini adalah halaman about"
      }))
    }else if(method == 'POST'){
      let body = []
      request.on('data', (chunk) =>{
        body.push(chunk)
      })
      request.on('end', () => {
        body = Buffer.concat(body).toString()
        let {name} = JSON.parse(body)
        response.end(JSON.stringify({
          message: `Hai ${name}, ini adalah halaman about`
        }))
      })
    }else{
      response.statusCode = 400
      response.end(JSON.stringify({
        message: `Halaman tidak dapat di akses dengan ${method} request`
      }))
    }
  }else{
    response.statusCode = 404
    response.end(JSON.stringify({
      message: "Halaman tidak ditemukan"
    }))
  }


}

const server = http.createServer(requestListener)
server.listen(4000, () => {
  console.log('Server berjalan di http://localhost:4000')
})