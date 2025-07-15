const puppeteer = require("puppeteer");

async function runPuppeteer() {
  try {
    const browser = await puppeteer.launch({
      headless: true, // Run in headless mode
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Required for some environments
    });

    const page = await browser.newPage();
    await page.goto("http://localhost:8080"); // Change to your target URL

    // Perform actions or take screenshots as needed
    await page.screenshot({ path: "screenshot.png" });

    await browser.close();
  } catch (error) {
    console.error("Error running Puppeteer:", error);
  }
}

runPuppeteer();
