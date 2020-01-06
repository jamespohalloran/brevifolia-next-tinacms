const express = require("express");
const next = require("next");
const cors = require("cors");
const gitApi = require("@tinacms/api-git");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = true; //process.env.NODE_ENV !== 'production'
const app = next({
  dev,
  dir: "./src"
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(cors());
  server.use("/___tina", gitApi.router());

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
