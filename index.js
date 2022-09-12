const rwClient = require("./twitterClient.js");
const octokit = require("./twitterClient.js");
const CronJob = require("cron").CronJob;
let lastDate = new Date();

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
  const { files } = await getData(url);
  const { raw_url } = files[0];

  console.log(raw_url);

  let newDate = new Date(commit.committer.date);
  if (checkDate(newDate)) {
    getCode();
  }
};

const getCode = () => {};

const checkDate = (newDate) => {
  if (newDate > lastDate) return true;
  console.log("No updates found");
  return false;
};

commit();

const tweet = async () => {
  try {
    await rwClient.v2.tweet("xd");
  } catch (e) {
    console.error(e);
  }
};

const job = new CronJob("* * * * *", () => {
  console.log("hi");
  //tweet();
});

//job.start();
