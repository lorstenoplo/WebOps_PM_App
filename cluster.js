const fs = require("fs");
const { Cluster } = require("puppeteer-cluster");
const puppeteer = require("puppeteer");

const getBlogUrls = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://blog.ankitsanghvi.in/");
  const urls = [];

  // Extract URLs
  await page.waitForSelector(".post-card.post");
  const links = await page.$$(".post-card.post");

  for (const link of links) {
    let url = "Null";

    try {
      url = await page.evaluate(
        (el) => el.querySelector(".post-card-image-link").href,
        link
      );
    } catch (error) {}

    urls.push(url);
  }

  await browser.close();

  return urls;
};

(async () => {
  const urls = await getBlogUrls();
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 10,
  });

  cluster.on("taskerror", (err, data) => {
    console.log(`Error crawling ${data}: ${err.message}`);
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url);
    await page.waitForSelector("body");
    const bodyHandle = await page.$("body");

    let title = "Null";
    let tag = "Null";
    let img = "Null";
    let date = "Null";
    let readTime = "Null";
    let excerpt = "Null";
    let content = "Null";

    try {
      title = await page.evaluate(
        (el) => el.querySelector(".post-full-title").textContent,
        bodyHandle
      );
    } catch (error) {}

    try {
      tag = await page.evaluate(
        (el) =>
          el.querySelector(".post-full-header > .post-full-tags").textContent,
        bodyHandle
      );
    } catch (error) {}

    try {
      img = await page.evaluate(
        (el) => el.querySelector(".post-full-image > img").src,
        bodyHandle
      );
    } catch (error) {}

    try {
      date = await page.evaluate(
        (el) => el.querySelector(".byline-meta-content > time").textContent,
        bodyHandle
      );
    } catch (error) {}

    try {
      readTime = await page.evaluate(
        (el) => el.querySelector(".byline-reading-time").textContent,
        bodyHandle
      );
    } catch (error) {}

    try {
      excerpt = await page.evaluate(
        (el) => el.querySelector(".post-full-custom-excerpt").textContent,
        bodyHandle
      );
    } catch (error) {}

    try {
      content = await page.evaluate(
        (el) =>
          el.querySelector(".post-full-content > .post-content").innerHTML,
        bodyHandle
      );
    } catch (error) {}

    fs.appendFile(
      "results.csv",
      `${title},${tag},${img},${date},${readTime},${excerpt},"${content}"\n`,
      "utf8",
      (err) => {
        if (err) throw err;
      }
    );

    await bodyHandle.dispose();
  });

  for (const url of urls) {
    await cluster.queue(url);
  }

  await cluster.idle();
  await cluster.close();
})();
