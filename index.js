const { rwClient, octokit } = require("./twitterClient.js");
const RaySo = require("rayso.js");

const CronJob = require("cron").CronJob;
let lastDate = new Date();
let commit_message = "";

const commit = async () => {
  try {
    const result = await octokit.request("GET /repos/{owner}/{repo}/commits", {
      owner: "zvizzct",
      repo: "codewars",
    });
    const { data } = result;
    processData(data[0]);
  } catch (e) {
    console.error(e);
  }
};
const getData = async (url) => {
  const response = await fetch(url);

  return response.json();
};
const processData = async (data) => {
  const { commit, url } = data;
  const { message } = commit;
  commit_message = message;

  const { files } = await getData(url);
  const { raw_url } = files[0];

  getCode(message, raw_url);
  let newDate = new Date(commit.committer.date);
  lastDate = new Date(newDate);
  console.log(lastDate, newDate);
  if (checkDate(newDate)) {
    getCode(message, raw_url);
  }
};

const getCode = async (message, raw_url) => {
  fetch(raw_url).then(function (response) {
    response.text().then(function (text) {
      storedText = text;
      codeToImg(message, storedText);
    });
  });
};

const checkDate = (newDate) => {
  if (newDate >= lastDate) return true;
  console.log("No updates found");
  return false;
};

commit();

const codeToImg = async (message, code) => {
  const raySo = new RaySo({
    title: message,
    padding: 32,
    language: "javascript",
    localPreview: true,
    browserPath: "/usr/bin/google-chrome-stable",
  });
  raySo
    .cook(code)
    .then((response) => {})
    .catch((err) => {
      console.error(err);
    });
};

const tweet = async () => {
  try {
    const mediaId = await rwClient.v1.uploadMedia("example.png");
    await rwClient.v2.tweet("storedText", { mediaId: mediaId });
  } catch (e) {
    console.error(e);
  }
};

tweet();

/* const job = new CronJob("* * * * *", () => {
  console.log("hi");
  tweet();
});

job.start(); */
