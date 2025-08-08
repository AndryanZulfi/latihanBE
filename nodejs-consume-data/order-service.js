const http = require('http');
const url = require('url');

const menus = ['Nasi goreng', 'Burger', 'Mie Gacoan', 'dimsum', 'pizza'];
const MISSING = 3;

const server = http.createServer((req, res) => {
  const { pathName } =  url.parse(req.url);
  let id = pathName.match(/^\/(\d+)$/);
  console.log(pathName);

  if (!id) {
    res.statusCode(400);
    return void res.end();
  };

  id = Number(id[1]);

  if (id === MISSING){
    res.statusCode(404);
    return void res.end();
  };

  res.setHeader('Content-Type', 'application/json');

  res.end(JSON.stringify({
    id,
    menu: menus[id % menus.length]
  }));
});

server.listen(process.env.PORT || 0, () => {
  const { port } = server.address();
  console.log(`Order service listening on localhost on port: ${port}`);
});