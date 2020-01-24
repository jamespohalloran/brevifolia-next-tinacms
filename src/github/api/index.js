const btoa = require("btoa");
const axios = require("axios");

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

module.exports = {
  createPR,
  saveContent,
  getContent
};
