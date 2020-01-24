const btoa = require("btoa");
const axios = require("axios");
const qs = require("qs");

const createPR = (baseRepoFullName, forkRepoFullName, branch, accessToken) => {
  return axios({
    method: "POST",
    url: `https://api.github.com/repos/${baseRepoFullName}/pulls?access_token=${accessToken}`,
    data: {
      title: "Update from TinaCMS",
      body: "Please pull these awesome changes in!",
      head: `${forkRepoFullName.split("/")[0]}:${branch}`,
      base: branch
    }
  });
};

const getContent = async (repoFullName, branch, path, accessToken) => {
  return axios({
    method: "GET",
    url: `https://api.github.com/repos/${repoFullName}/contents/${path}?access_token=${accessToken}&ref=${branch}`
  });
};

const saveContent = async (
  repoFullName,
  branch,
  path,
  accessToken,
  sha,
  content,
  message
) => {
  return axios({
    method: "PUT",
    url: `https://api.github.com/repos/${repoFullName}/contents/${path}?access_token=${accessToken}`,
    data: {
      message,
      content: btoa(content),
      sha,
      branch
    }
  });
};

const createAccessToken = (clientId, clientSecret, code) => {
  return axios.post(
    `https://github.com/login/oauth/access_token`,
    qs.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code
    })
  );
};

const createFork = (repoFullName, accessToken) => {
  return axios.post(
    `https://api.github.com/repos/${repoFullName}/forks?${qs.stringify({
      access_token: accessToken
    })}`
  );
};

module.exports = {
  createPR,
  saveContent,
  getContent,
  createAccessToken,
  createFork
};
