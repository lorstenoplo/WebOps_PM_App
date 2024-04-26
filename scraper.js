const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapeBlogs(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const posts = [];

  // Extract blog titles and URLs'

  await page.waitForSelector(".post-card.post");

  const links = await page.$$(".post-card.post");

  for (const link of links) {
    let title = "Null";
    let tag = "Null";
    let img = "Null";
    let date = "Null";
    let readTime = "Null";
    let text = "Null";

    try {
      title = await page.evaluate(
        (el) => el.querySelector(".post-card-title").textContent,
        link
      );
    } catch (error) {}
    try {
      tag = await page.evaluate(
        (el) => el.querySelector(".post-card-primary-tag").textContent,
        link
      );
    } catch (error) {}
    try {
      img = await page.evaluate(
        (el) => el.querySelector(".post-card-image").src,
        link
      );
    } catch (error) {}
    try {
      date = await page.evaluate(
        (el) => el.querySelector(".post-card-byline-date>time").textContent,
        link
      );
    } catch (error) {}
    try {
      readTime = await page.evaluate(
        (el) => el.querySelector(".post-card-byline-date").textContent,
        link
      );
    } catch (error) {}
    try {
      text = await page.evaluate(
        (el) => el.querySelector(".post-card-excerpt>p").textContent,
        link
      );
    } catch (error) {}

    posts.push({ title, tag, img, date, readTime, text });

    fs.appendFile(
      "blogs.csv",
      `${title},${tag},${img},${date},${readTime},${text}\n`,
      "utf8",
      (err) => {
        if (err) throw err;
      }
    );
  }

  await browser.close();
  return posts;
}

// async function saveToCSV(data) {
//   const csv = new ObjectsToCsv(data);
//   await csv.toDisk("./blogs.csv");
// }

async function main() {
  const url = "https://blog.ankitsanghvi.in/";
  const blogs = await scrapeBlogs(url);
  console.log("Data saved to blogs.csv", blogs);
}

main();
