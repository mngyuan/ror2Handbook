const puppeteer = require('puppeteer');
const run = (seed) =>
  new Promise(async (resolve, reject) => {
    try {
      const baseUrl = 'https://riskofrain2.fandom.com';
      const ignoreList = [
        'https://riskofrain2.fandom.com/wiki/Items',
        'https://riskofrain2.fandom.com/wiki/Items#Common',
        'https://riskofrain2.fandom.com/wiki/Items#Uncommon',
        'https://riskofrain2.fandom.com/wiki/Items#Legendary',
        'https://riskofrain2.fandom.com/wiki/Items#Boss',
        'https://riskofrain2.fandom.com/wiki/Items#Lunar',
      ];

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      // never timeout, but might hang
      await page.setDefaultNavigationTimeout(0);
      await page.goto(seed);
      const nonSeedUrls = await page.$$eval('.navbox a', (links) =>
        links.map((linkNode) => linkNode.getAttribute('href')),
      );
      const itemUrls = Array.from(nonSeedUrls)
        .map((url) => `${baseUrl}${url}`)
        .concat(seed)
        .filter((url) => !ignoreList.includes(url));
      const itemData = [];
      for (itemUrl of itemUrls) {
        await page.goto(itemUrl);
        console.log(itemUrl);
        const evalCatchHandler = (err) => {
          if (
            !err.message.includes('failed to find element matching selector')
          ) {
            throw err;
          }
        };
        const [description, rarity, category, id] = await Promise.all([
          page
            .$eval(
              '[data-source="desc"]',
              (el) => el.querySelector('.pi-data-value').innerText,
            )
            .catch(evalCatchHandler),
          page
            .$eval(
              '[data-source="rarity"]',
              (el) => el.querySelector('.pi-data-value').innerText,
            )
            .catch(evalCatchHandler),
          page
            .$eval(
              '[data-source="category"]',
              (el) => el.querySelector('.pi-data-value').innerText,
            )
            .catch(evalCatchHandler),
          page
            .$eval(
              '[data-source="ID"]',
              (el) => el.querySelector('.pi-data-value').innerText,
            )
            .catch(evalCatchHandler),
        ]);
        itemData.push({
          wikiUrl: itemUrl,
          description,
          rarity,
          category,
          id,
        });
      }
      browser.close();
      return resolve(itemData);
    } catch (e) {
      return reject(e);
    }
  });
run('https://riskofrain2.fandom.com/wiki/Focus_Crystal')
  .then(console.log)
  .catch(console.error);
