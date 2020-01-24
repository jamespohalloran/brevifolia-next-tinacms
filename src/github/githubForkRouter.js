const express = require("express");
const qs = require("qs");
const path = require("path");
const { createFork } = require("./api");

const GITHUB_FORK_COOKIE_KEY = "tina-github-fork-name";
const NO_COOKIES_ERROR = `@tinacms/teams \`authenticate\` middleware could not find cookies on the request.

Try adding the \`cookie-parser\` middleware to your express app.

https://github.com/expressjs/cookie-parser
`;

function githubForkRouter() {
  const router = express.Router();

  router.get("/github/fork", async (req, res) => {
    createFork(process.env.REPO_FULL_NAME, req.cookies["tina-github-auth"])
      .then(forkResp => {
        const { full_name } = qs.parse(forkResp.data);
        res.cookie(GITHUB_FORK_COOKIE_KEY, full_name);
        res.redirect(`/`);
      })
      .catch(e => {
        console.error(e);
      });
  });

  function requestForking(req, res, next) {
    if (!req.cookies) {
      throw new Error(NO_COOKIES_ERROR);
    }
    const forkUrl = req.cookies[GITHUB_FORK_COOKIE_KEY];

    if (!forkUrl) {
      const unauthorizedView = path.join(__dirname, "/request-fork.html");
      res.sendFile(unauthorizedView);
      return;
    }

    next();
  }

  router.use(requestForking);

  return router;
}

module.exports = githubForkRouter;
