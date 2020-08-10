'use strict';
const fs = require('fs');
const https = require('https');
const puppeteer = require('puppeteer');

const imageDirPath = './imgs';
const itemDataPath = './item_data.json';

const download = (url, destination) =>
  new Promise((resolve, reject) => {
    const destWithoutSpaces = destination.replace(/ /g, '');
    const file = fs.createWriteStream(destWithoutSpaces);

    https
      .get(url, (response) => {
        response.pipe(file);

        file.on('finish', () => {
          file.close(resolve(true));
        });
      })
      .on('error', (error) => {
        fs.unlink(destWithoutSpaces);

        reject(error.message);
      });
  });

const scrapeItems = (seed, single = false) =>
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
      if (!single) {
        await page.goto(seed);
        const nonSeedUrls = await page.$$eval('.navbox a', (links) =>
          links.map((linkNode) => linkNode.getAttribute('href')),
        );
        const itemUrls = Array.from(nonSeedUrls)
          .map((url) => `${baseUrl}${url}`)
          .concat(seed)
          .filter((url) => !ignoreList.includes(url));
        const itemData = {};
        for (const itemUrl of itemUrls) {
          const data = await visitItem(page, itemUrl);
          itemData[data.name] = data;
        }
        browser.close();
        return resolve(itemData);
      } else {
        const itemData = await visitItem(page, seed);
        browser.close();
        return resolve(itemData);
      }
    } catch (e) {
      return reject(e);
    }
  });

const visitItem = async (page, url) => {
  await page.goto(url);
  console.log(url);
  const evalCatchHandler = (err) => {
    if (!err.message.includes('failed to find element matching selector')) {
      throw err;
    }
  };
  const {url: imgUrl, name: imgName} = await page
    .$eval('img.pi-image-thumbnail', (el) => ({
      url: el.src,
      name: el.dataset.imageName,
    }))
    .catch(evalCatchHandler);
  const [
    description,
    rarity,
    category,
    id,
    name,
    stats,
    flavorText,
    _,
  ] = await Promise.all([
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
    page
      .$eval('[data-source="title"]', (el) => el.innerText)
      .catch(evalCatchHandler),
    page
      .$$eval('[data-source*="stat"]', (els) => {
        if (els.length === 0) return;
        const header = els[0];
        const traverser = (el) =>
          el.nextElementSibling
            ? [el.innerText, ...traverser(el.nextElementSibling)]
            : [el.innerText];
        const keyNames = traverser(header).map((s) =>
          s
            .toLocaleLowerCase()
            .split(' ')
            .map((w, i) =>
              i === 0 ? w : `${w[0].toLocaleUpperCase()}${w.slice(1)}`,
            )
            .join(''),
        );
        return els.slice(1).map((el) => {
          const values = traverser(el);
          return Object.fromEntries(keyNames.map((key, i) => [key, values[i]]));
        });
      })
      .catch(evalCatchHandler),
    page
      .$eval('figcaption.pi-item-spacing.pi-caption', (el) => el.innerText)
      .catch(evalCatchHandler),
    download(imgUrl, `${imageDirPath}/${imgName}`),
  ]);
  return {
    wikiUrl: url,
    description,
    rarity,
    category,
    id,
    name,
    stats,
    flavorText,
    imgUrl,
  };
};

const generateImageRequires = () => {
  // could improve by reading item_data.json to get name so name in gen'd code
  // doesn't have to have its spaces stripped
  const outputPath = `${imageDirPath}/images.js`;
  const imgFiles = fs.readdirSync(imageDirPath);
  const fileInfo = imgFiles
    .filter((filename) =>
      ['jpg', 'png'].includes(filename.split('.').slice(-1)[0]),
    )
    .map((filename) => ({
      name: filename.split('.')[0],
      path: `./${filename}`,
    }));
  const kvPairs = fileInfo.map(
    (file) =>
      `${JSON.stringify(file.name)}: require(${JSON.stringify(file.path)})`,
  );
  const code = `export default {${kvPairs.join(',\n')}}`;
  console.log(code);
  fs.writeFile(outputPath, code, (err) => {
    if (err) throw err;
    console.log(`written to ${outputPath}`);
  });
};

const main = () => {
  if (!fs.existsSync(imageDirPath)) {
    fs.mkdirSync(imageDirPath);
  }

  const args = process.argv.slice(2);
  const positionalArgs = args.filter((s) => !s.startsWith('-'));
  const flags = args.filter((s) => s.startsWith('-'));
  const action = positionalArgs[0];
  switch (action) {
    case 'items':
      const DEFAULT_SEED = 'https://riskofrain2.fandom.com/wiki/Focus_Crystal';
      scrapeItems(positionalArgs[1] || DEFAULT_SEED, flags.includes('--single'))
        .then((itemData) => {
          if (flags.includes('--single')) {
            console.log(itemData);
          } else {
            fs.writeFile(itemDataPath, JSON.stringify(itemData), (err) => {
              if (err) throw err;
              console.log(`written to ${itemDataPath}`);
            });
          }
        })
        .catch(console.error);
      break;
    case 'gencode':
      generateImageRequires();
      break;
    default:
      break;
  }
};

main();
