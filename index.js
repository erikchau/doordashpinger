"use strict";

const { exit } = require("process");
const AWS = require('aws-sdk');
const sns = new AWS.SNS()
const chromium = require("chrome-aws-lambda")
exports.handler = async () => {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page.goto(
    "https://www.doordash.com/store/donut-king-watsonville-956084/en-US"
  );
  await page.waitForSelector("#FieldWrapper-3", { timeout: 10000 });
  await page.type("#FieldWrapper-3", "84 kingfisher dr watsonville ca");
  await page.waitForSelector(
    `span[data-anchor-id='AddressAutocompleteSuggestion']`,
    { timeout: 5000 }
  );
    await page.type("#FieldWrapper-3", String.fromCharCode(25));
    await page.type("#FieldWrapper-3", String.fromCharCode(13));
    await page.waitForSelector(`button[data-anchor-id='AddressEditSave']`, {
      timeout: 5000,
    });
    await page.click(`button[data-anchor-id='AddressEditSave']`);
    await page.waitForSelector(`button[data-anchor-id='AddressEditSave']`, {hidden: true, timeout: 5000})
    const storeStatusElement = await page.$(
      "#root > div > div.sc-gzVnrw.ipJBfZ > div.sc-lhVmIH.hksPHh > div > div > header > div.sc-chAAoq.gqyxRS > div.sc-ivVeuv.jRIHjQ > div.sc-cCbXAZ.gOXekJ > div:nth-child(3) > span"
    );
    const storeStatus = await page.evaluate(
      (el) => el.textContent,
      storeStatusElement
    );

    if (storeStatus === 'Closed') {
        sns.publish({
            Message: 'Store on DoorDash is Closed',
            PhoneNumber: '+18313590041'
        }, () =>  exit())
    }
}
