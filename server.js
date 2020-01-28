const express = require("express");
const next = require("next");
const cors = require("cors");
const gitApi = require("@tinacms/api-git");
const cookieParser = require("cookie-parser");
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";

const githubForkRouter = require("./src/github/githubForkRouter");
const githubAuthRouter = require("./src/github/githubAuthRouter");
const { USE_CONTENT_API } = require("./src/constants");

const app = next({
  dev,
  dir: "./src"
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(cookieParser());
  if (USE_CONTENT_API) {
    server.use(githubAuthRouter());
    server.use(githubForkRouter());
  }

  server.use("/___tina", gitApi.router());
  server.use(cors());
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
