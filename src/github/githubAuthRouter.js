const express = require("express");
const axios = require("axios");
const qs = require("qs");
const { createAccessToken } = require("./api");

const GITHUB_AUTH_COOKIE_KEY = "tina-github-auth";

const NO_COOKIES_ERROR = `@tinacms/teams \`authenticate\` middleware could not find cookies on the request.

Try adding the \`cookie-parser\` middleware to your express app.

https://github.com/expressjs/cookie-parser
`;

function checkForAuthToken(req, res, next) {
  if (!req.cookies) {
    throw new Error(NO_COOKIES_ERROR);
  }
  const token = req.cookies[GITHUB_AUTH_COOKIE_KEY];

  if (!token) {
    res.redirect(
      `https://github.com/login/oauth/authorize?${qs.stringify({
        scope: "public_repo",
        client_id: process.env.GITHUB_CLIENT_ID
      })}`
    );
    return;
  }

  next();
}

function githubAuthRouter() {
  const router = express.Router();

  router.get("/github/authorized", async (req, res) => {
    createAccessToken(
      process.env.GITHUB_CLIENT_ID,
      process.env.GITHUB_CLIENT_SECRET,
      req.query.code
    ).then(tokenResp => {
      const { access_token } = qs.parse(tokenResp.data);
      res.cookie(GITHUB_AUTH_COOKIE_KEY, access_token);
      res.redirect(`/`);
    });
  });

  router.use(checkForAuthToken);

  return router;
}
module.exports = githubAuthRouter;
