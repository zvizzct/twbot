const RaySo = require("rayso.js");
const { TwitterApi } = require("twitter-api-v2");
const { Octokit } = require("octokit");

const CronJob = require("cron").CronJob;
let lastDate = null;
let commit_message = "";

const client = new TwitterApi({
  appKey: process.env.APPKEY,
  appSecret: process.env.APPSECRET,
  accessToken: process.env.ACCESSTOKEN,
  accessSecret: process.env.ACESSSECRET,
});

const octokit = new Octokit({
  auth: process.env.AUTHGIT,
});

const rwClient = client.readWrite;

const commit = async () => {
  try {
    const result = await octokit.request("GET /repos/{owner}/{repo}/commits", {
      owner: "zvizzct",
      repo: "Codewars",
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

  let newDate = new Date(commit.committer.date);
  if (checkDate(newDate)) {
    lastDate = new Date(newDate);
    console.log("Commit found!");
    getCode(raw_url);
  }
};

const getCode = async (raw_url) => {
  fetch(raw_url).then(function (response) {
    response.text().then(function (text) {
      storedText = text;
      codeToImg(storedText);
    });
  });
};

const checkDate = (newDate) => {
  if (newDate > lastDate) return true;
  console.log("No updates found");
  return false;
};

const codeToImg = async (code) => {
  const raySo = new RaySo({
    title: commit_message,
    padding: 32,
    language: "javascript",
    localPreview: true,
    browserPath: "/usr/bin/google-chrome-stable",
  });
  raySo
    .cook(code)
    .then((response) => {
      tweet();
    })
    .catch((err) => {
      console.error(err);
    });
};

const tweet = async () => {
  try {
    const mediaId = await rwClient.v1.uploadMedia("example.png");
    await rwClient.v1.tweet(
      `${commit_message} #100DaysOfCode #Codewars #javascript`,
      { media_ids: mediaId }
    );
  } catch (e) {
    console.error(e);
  }
};

const job = new CronJob("0 */12 * * *", () => {
  commit();
});

//commit();
job.start();
