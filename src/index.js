import puppeteer from "puppeteer";

async function openWebPage() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 400,
  });
  const page = await browser.newPage();
  await page.goto("https://www.sicop.go.cr/");
  await browser.close();
}

openWebPage();
