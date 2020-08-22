'use strict';
const fs = require('fs');
const https = require('https');
const puppeteer = require('puppeteer');

const imageDirPath = './imgs';
const itemDataPath = './item_data.json';
const gamepediaItemDataPath = './gamepedia_item_data.json';
const eqpDataPath = './eqp_data.json';
const survivorDataPath = './survivor_data.json';

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

const toCamelCase = (s) =>
  s
    .toLocaleLowerCase()
    .split(' ')
    .map((w, i) => (i === 0 ? w : `${w[0].toLocaleUpperCase()}${w.slice(1)}`))
    .join('');

const scrape = ({
  seed,
  visitCallback,
  ignoreList,
  baseUrl,
  single = false,
  linkSeedSelector = '.navbox a:not(.selflink)',
  skipSeed = false,
}) =>
  new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.exposeFunction('toCamelCase', toCamelCase);
      // never timeout, but might hang
      await page.setDefaultNavigationTimeout(0);
      if (!single) {
        await page.goto(seed);
        const nonSeedUrls = await page.$$eval(linkSeedSelector, (links) =>
          links.map((linkNode) => linkNode.getAttribute('href')),
        );
        const itemUrls = Array.from(nonSeedUrls)
          .map((url) => `${baseUrl}${url}`)
          .concat(skipSeed ? [] : seed)
          .filter((url) => !ignoreList.includes(url));
        const itemData = {};
        for (const itemUrl of itemUrls) {
          const data = await visitCallback(page, itemUrl);
          itemData[data.name] = data;
        }
        browser.close();
        return resolve(itemData);
      } else {
        const itemData = await visitCallback(page, seed);
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
    unlock,
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
        '[data-source="unlock"]',
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
        const keyNames = traverser(header).map(window.toCamelCase);
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
    unlock,
    category,
    id,
    name,
    stats,
    flavorText,
    imgUrl,
  };
};

const visitItemGamepedia = async (page, url) => {
  await page.goto(url);
  console.log(url);
  const evalCatchHandler = (err) => {
    if (!err.message.includes('failed to find element matching selector')) {
      throw err;
    }
  };
  const {url: imgUrl, name: imgName} = await page
    .$eval('.infoboxtable img', (el) => ({
      url: el.src,
      name: el.alt,
    }))
    .catch(evalCatchHandler);
  const [description, keyInfo, name, stats, flavorText, _] = await Promise.all([
    page.$eval('.infoboxdesc', (el) => el.innerText).catch(evalCatchHandler),
    page
      .$$eval('.infoboxtable tr', (els) =>
        els.reduce((agg, cur) => {
          const label = cur.querySelector('td')?.innerText.toLocaleLowerCase();
          return ['rarity', 'category', 'id', 'unlock'].includes(label)
            ? {...agg, [label]: cur.querySelectorAll('td')[1].innerText}
            : agg;
        }),
      )
      .catch(evalCatchHandler),
    page.$eval('.infoboxname', (el) => el.innerText).catch(evalCatchHandler),
    page
      .$$eval('.infoboxtable:first-of-type tr', async (els) => {
        const statRowIndex = els.findIndex((row) =>
          row.querySelector('th:not(.infoboxname)'),
        );
        const statRows = els.slice(statRowIndex);
        if (statRows.length === 0) return;
        const header = statRows[0];
        const keyNames = await Promise.all(
          Array.from(header.querySelectorAll('th'))
            .map((el) => el.innerText)
            .map(window.toCamelCase),
        );
        return statRows.slice(1).map((row) => {
          const values = Array.from(row.querySelectorAll('td')).map(
            (el) => el.innerText,
          );
          return Object.fromEntries(keyNames.map((key, i) => [key, values[i]]));
        });
      })
      .catch(evalCatchHandler),
    page.$eval('.infoboxcaption', (el) => el.innerText).catch(evalCatchHandler),
    download(imgUrl, `${imageDirPath}/${imgName}`),
  ]);
  return {
    ...keyInfo,
    wikiUrl: url,
    description,
    name,
    stats,
    flavorText,
    imgUrl,
  };
};

const visitEqp = async (page, url) => {
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
    unlock,
    cooldown,
    name,
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
        '[data-source="unlock"]',
        (el) => el.querySelector('.pi-data-value').innerText,
      )
      .catch(evalCatchHandler),
    page
      .$eval(
        '[data-source="cooldown"]',
        (el) => el.querySelector('.pi-data-value').innerText,
      )
      .catch(evalCatchHandler),
    page
      .$eval('[data-source="title"]', (el) => el.innerText)
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
    unlock,
    cooldown,
    name,
    flavorText,
    imgUrl,
  };
};

const visitSurvivor = async (page, url) => {
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
  const [description, unlock, name, skills, _] = await Promise.all([
    page
      .$eval(
        '[data-source="desc"]',
        (el) => el.querySelector('.pi-data-value').innerText,
      )
      .catch(evalCatchHandler),
    page
      .$eval(
        '[data-source="unlock"]',
        (el) => el.querySelector('.pi-data-value').innerText,
      )
      .catch(evalCatchHandler),
    page
      .$eval('[data-source="title"]', (el) => el.innerText)
      .catch(evalCatchHandler),
    page
      .$$eval('table.wikitable', (els) =>
        els.map((table) => {
          const tableRows = Array.from(table.querySelectorAll('tr'));
          const name = tableRows[0].innerText;
          const imgUrl =
            tableRows[1].querySelector('img').getAttribute('data-src') ||
            tableRows[1].querySelector('img').getAttribute('src');
          const data = {};
          for (const [i, row] of tableRows.slice(2).entries()) {
            if (row.querySelector('th').innerText === 'Notes') {
              data['Notes'] = tableRows
                .slice(2)
                [i + 1].querySelector('td').innerText;
              break;
            }
            data[row.querySelector('th').innerText] = row.querySelector(
              'td',
            ).innerText;
          }
          return {name, imgUrl, ...data};
        }),
      )
      .catch(evalCatchHandler),
    download(imgUrl, `${imageDirPath}/${imgName}`),
  ]);
  return {
    wikiUrl: url,
    description,
    unlock,
    name,
    skills,
    imgUrl,
  };
};

const generateImageRequires = () => {
  // could improve by reading item_data.json to get name so name in gen'd code
  // doesn't have to have its spaces stripped
  const outputPath = `${imageDirPath}/images.js`;
  const imgFiles = fs.readdirSync(imageDirPath);
  const [getFilenameWithouExt, getFileExt] = [
    (filename) => filename.split('.').slice(0, -1).join('.'),
    (filename) => filename.split('.').slice(-1)[0],
  ];
  const fileInfo = imgFiles
    .filter((filename) => ['jpg', 'png'].includes(getFileExt(filename)))
    .map((filename) => ({
      name: getFilenameWithouExt(filename),
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
  const baseUrl = flags.includes('--gamepedia')
    ? 'https://riskofrain2.gamepedia.com'
    : 'https://riskofrain2.fandom.com/wiki';

  switch (action) {
    case 'items':
      const ITEM_SEED = `${baseUrl}/Focus_Crystal`;
      const ITEM_IGNORE_LIST = [
        `${baseUrl}/Items`,
        `${baseUrl}/Items#Common`,
        `${baseUrl}/Items#Uncommon`,
        `${baseUrl}/Items#Legendary`,
        `${baseUrl}/Items#Boss`,
        `${baseUrl}/Items#Lunar`,
      ];
      scrape({
        seed: positionalArgs[1] || ITEM_SEED,
        visitCallback: flags.includes('--gamepedia')
          ? visitItemGamepedia
          : visitItem,
        ignoreList: ITEM_IGNORE_LIST,
        baseUrl: baseUrl,
        single: flags.includes('--single'),
      })
        .then((itemData) => {
          if (flags.includes('--single')) {
            console.log(itemData);
          } else {
            const outputPath = flags.includes('--gamepedia')
              ? gamepediaItemDataPath
              : itemDataPath;
            fs.writeFile(outputPath, JSON.stringify(itemData), (err) => {
              if (err) throw err;
              console.log(`written to ${outputPath}`);
            });
          }
        })
        .catch(console.error);
      break;
    case 'equipment':
      const EQP_SEED = `${baseUrl}/Spinel_Tonic`;
      const EQP_IGNORE_LIST = [
        `${baseUrl}/Items#Active_Items`,
        `${baseUrl}/Items#Equipment`,
        `${baseUrl}/Items#Lunar_Equipment`,
        `${baseUrl}/Items#Elite_Equipment`,
      ];
      scrape({
        seed: positionalArgs[1] || EQP_SEED,
        visitCallback: visitEqp,
        ignoreList: EQP_IGNORE_LIST,
        baseUrl: baseUrl,
        single: flags.includes('--single'),
      })
        .then((eqpData) => {
          if (flags.includes('--single')) {
            console.log(eqpData);
          } else {
            fs.writeFile(eqpDataPath, JSON.stringify(eqpData), (err) => {
              if (err) throw err;
              console.log(`written to ${eqpDataPath}`);
            });
          }
        })
        .catch(console.error);
      break;
    case 'survivors':
      const SURVIVOR_SEED = `${baseUrl}/Survivors`;
      const SURVIVOR_IGNORE_LIST = [];
      scrape({
        seed: positionalArgs[1] || SURVIVOR_SEED,
        visitCallback: visitSurvivor,
        ignoreList: SURVIVOR_IGNORE_LIST,
        baseUrl: baseUrl,
        single: flags.includes('--single'),
        linkSeedSelector: '.wikia-gallery a.link-internal',
        skipSeed: true,
      })
        .then((survivorData) => {
          if (flags.includes('--single')) {
            console.log(survivorData);
          } else {
            fs.writeFile(
              survivorDataPath,
              JSON.stringify(survivorData),
              (err) => {
                if (err) throw err;
                console.log(`written to ${survivorDataPath}`);
              },
            );
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
