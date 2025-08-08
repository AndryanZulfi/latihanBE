const routes = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return "Homepage"
    }
  },
  {
    method: '*',
    path: '/',
    handler: (request, h) => {
      return `Halaman ini tidak dapat diakses menggunakan method tersebut`
    }
  },
  {
    method: 'GET',
    path: '/about',
    handler: (request, h) => {
      return h.response('Ini halaman about')
      .type('text/plain')
      .header('Custom-Header', 'some-value');
    }
  },
  {
    method: '*',
    path: '/about',
    handler: (request, h) => {
      return 'Halaman ini tidak dapat di akses dengan method tersebut'
    }
  },
  {
    method: 'GET',
    path: '/hello/{name?}',
    handler: (request, h) => {
      const { name = 'guys'} = request.params
      const { lang } = request.query
      if(lang == 'id' ){
        return `Hellooooo ${name}`
      }
      return `Haii ${name}`
    }
  },
  {
    method: '*',
    path: '/{any*}',
    handler: (request, h) => {
      return 'Halaman tidak ditemukan'
    }
  }
]

module.exports = routes