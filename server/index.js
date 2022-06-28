const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 8080;

// =============
// EJS
// =============
//* set the view engine to ejs
app.set("view engine", "ejs");
//* set custom path for /views dir
const viewsDirPath = path.join(__dirname, "templates", "views");
app.set("views", viewsDirPath);
//* styles.css located in the /public folder
//* process.cwd() returns the current working dir
// app.use("/public", express.static(process.cwd() + "/public"));

// =============
// Puppeteer
// =============
app.get("/pdf", async (req, res) => {
  const url = req.query.target;

  //* puppeteer.launch() creates a browser instance
  const browser = await puppeteer.launch({
    headless: true,
  });

  //* creates new page instance
  const page = await browser.newPage();

  const navigationPromise = page.waitForNavigation();

  const templateHeader = fs.readFileSync("template-header.html", "utf-8");
  const templateFooter = fs.readFileSync("template-footer.html", "utf-8");

  await page.emulateMediaType("screen");

  //* set viewport size before crawling
  await page.setViewport({ width: 595, height: 842 });

  await page.goto(url, {
    waitUntil: "networkidle0",
  });

  await navigationPromise;

  //* create the PDF from the crawled page content and save it to our device
  const pdf = await page.pdf({
    path: "page.pdf",
    format: "Letter",
    displayHeaderFooter: true,
    headerTemplate: templateHeader,
    footerTemplate: templateFooter,
    margin: {
      top: "100px",
      bottom: "40px",
    },
    printBackground: true,
  });

  //* returns screenshot (800x600, unless setViewport() has been specified) in local dir
  // await page.screenshot({ path: "screenshot.png" });

  //* whend the PDF creation is over, close the browser connection with browser.close();
  await browser.close();

  res.contentType("application/pdf");
  res.send(pdf);
});

app.get("/", (req, res) => {
  res.render("../views");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
