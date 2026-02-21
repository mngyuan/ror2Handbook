'use strict';
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const CLI_DOC = `scraper.js

Usage
node scraper.js [artifacts|survivors|items|challenges|equipment|gencode] [--single URL]

Examples
  node scraper.js survivors
  node scraper.js survivors --single https://riskofrain2.wiki.gg/wiki/Engineer
  node scraper.js items
  node scraper.js items --single https://riskofrain2.wiki.gg/wiki/Focus_Crystal`;

const imageDirPath = './imgs';
const itemDataPath = './item_data.json';
const eqpDataPath = './eqp_data.json';
const survivorDataPath = './survivor_data.json';
const challengeDataPath = './challenge_data.json';
const artifactDataPath = './artifact_data.json';
const rootUrl = 'https://riskofrain2.wiki.gg';

let FLAG_VERBOSE = false;
const logInfo = (...args) => (FLAG_VERBOSE ? console.info(...args) : null);

const toCamelCase = s =>
  s
    .toLocaleLowerCase()
    .split(' ')
    .map((w, i) => (i === 0 ? w : `${w[0].toLocaleUpperCase()}${w.slice(1)}`))
    .join('');

const windowSet = (page, name, value) =>
  page.evaluateOnNewDocument(`
    Object.defineProperty(window, '${name}', {
      get() {
        return ${JSON.stringify(value)};
      }
    })
  `);

const CHALLENGE_TABLE_CATEGORY = [
  'survivors',
  'items',
  'equipment',
  'skills',
  'skins',
  'artifacts',
];

// Download an image using a puppeteer page to bypass Cloudflare
const download = async (page, url, destination) => {
  if (!url || !url.startsWith('https')) {
    return false;
  }
  // Ensure file has an extension, extracted from URL if missing
  let destWithExt = destination;
  const hasExt = /\.\w+$/.test(destination);
  if (!hasExt) {
    const urlPath = new URL(url).pathname;
    const extMatch = urlPath.match(/\.(\w+)/);
    if (extMatch) destWithExt = `${destination}.${extMatch[1]}`;
  }
  const destWithoutSpaces = destWithExt.replace(/ /g, '');

  logInfo(`Downloading ${url} to ${destWithoutSpaces}`);
  const response = await page.goto(url);
  const buffer = await response.buffer();
  fs.writeFileSync(destWithoutSpaces, buffer);
  return true;
};

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

const genUrlsToFollow = async (page, navboxSelector = '.navbox') =>
  await page.$$eval(navboxSelector, navboxes =>
    Array.from(navboxes[0].querySelectorAll('.notitle > a:not(.selflink)')).map(
      linkNode => linkNode.getAttribute('href'),
    ),
  );

const scrape = ({
  seed,
  visitCallback,
  ignoreList,
  single = false,
  genUrls = genUrlsToFollow,
  skipSeed = false,
}) =>
  new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--fast-start', '--disable-extensions', '--no-sandbox'],
        ignoreHTTPSErrors: true,
      });
      const page = await browser.newPage();
      await page.exposeFunction('toCamelCase', toCamelCase);
      await windowSet(
        page,
        'CHALLENGE_TABLE_CATEGORY',
        CHALLENGE_TABLE_CATEGORY,
      );
      await page.setDefaultNavigationTimeout(0);
      if (!single) {
        logInfo(`Navigating to seed URL: ${seed}`);
        await page.goto(seed);
        const nonSeedUrls = await genUrls(page);
        const itemUrls = new Set(
          Array.from(nonSeedUrls)
            .map(url => `${rootUrl}${url}`)
            .concat(skipSeed ? [] : seed)
            .filter(url => !ignoreList.includes(url)),
        );
        const data = {};
        for (const url of itemUrls) {
          const result = await visitCallback(page, url);
          data[result.name] = result;
        }
        browser.close();
        return resolve(data);
      } else {
        const data = await visitCallback(page, seed);
        browser.close();
        return resolve(data);
      }
    } catch (e) {
      return reject(e);
    }
  });

const resolveImgUrl = src => {
  if (!src) return null;
  if (src.startsWith('https://') || src.startsWith('http://')) return src;
  return `${rootUrl}${src}`;
};

const evalCatchHandler = err => {
  if (!err.message.includes('failed to find element matching selector')) {
    throw err;
  }
};

// ----- Items -----

const visitItem = async (page, url) => {
  await page.goto(url, {waitUntil: 'networkidle0'});
  await autoScroll(page);
  console.log(url);

  // Handle pages with multiple infoboxes (e.g. Item Scrap has 4 on one page)
  // Find which infobox matches the URL
  const infoboxes = await page.$$('table.portable-infobox');
  let infobox = infoboxes[0];
  if (infoboxes.length > 1) {
    const urlName = decodeURIComponent(url.split('/wiki/')[1]).replace(
      /_/g,
      ' ',
    );
    for (const box of infoboxes) {
      const boxName = await box.$eval('th.infoboxname', el => {
        const clone = el.cloneNode(true);
        clone.querySelectorAll('span').forEach(s => s.remove());
        return clone.textContent.trim();
      });
      if (urlName.includes(boxName) || boxName.includes(urlName)) {
        infobox = box;
        break;
      }
    }
  }

  const {url: rawImgUrl, name: imgName} = await infobox
    .$eval('td[colspan] img', el => ({
      url: el.getAttribute('src'),
      // Strip extension from path
      name: (el.alt || el.getAttribute('src').split('/').pop().split('?')[0])
        .replace(/\.\w+$/, '')
        .replace(/é/g, 'e'),
    }))
    .catch(evalCatchHandler);
  const imgUrl = resolveImgUrl(rawImgUrl);

  const [description, keyInfo, name, stats, flavorText] = await Promise.all([
    infobox.$eval('td.infoboxdesc', el => el.innerText).catch(evalCatchHandler),
    infobox
      .$$eval('tr', els =>
        els.reduce((agg, cur) => {
          const label = cur.querySelector('td')?.innerText.toLocaleLowerCase();
          const value = cur.querySelectorAll('td')[1]?.innerText;
          return ['rarity', 'category', 'id', 'unlock'].includes(label) &&
            // overwrite if nullish, handles cases where rarity might be listed twice
            // (see Shipping Request Form)
            !agg[label]
            ? {...agg, [label]: value}
            : agg;
        }, {}),
      )
      .catch(evalCatchHandler),
    infobox
      .$eval('th.infoboxname', el => {
        const clone = el.cloneNode(true);
        clone.querySelectorAll('span').forEach(s => s.remove());
        return clone.textContent.trim();
      })
      .catch(evalCatchHandler),
    infobox
      .$$eval('tr', async els => {
        const statRowIndex = els.findIndex(row =>
          row.querySelector('th:not(.infoboxname)'),
        );
        const statRows = els.slice(statRowIndex);
        if (statRows.length === 0) return;
        const header = statRows[0];
        const keyNames = await Promise.all(
          Array.from(header.querySelectorAll('th'))
            .map(el => el.innerText)
            .map(window.toCamelCase),
        );
        return statRows
          .slice(1)
          .filter(row => {
            const tds = row.querySelectorAll('td');
            return (
              tds.length >= keyNames.length &&
              !row.querySelector('.infoboxname')
            );
          })
          .map(row => {
            const values = Array.from(row.querySelectorAll('td')).map(
              el => el.innerText,
            );
            return Object.fromEntries(
              keyNames.map((key, i) => [key, values[i]]),
            );
          })
          .filter(stat => Object.values(stat).some(v => v));
      })
      .catch(evalCatchHandler),
    infobox
      .$eval('td.infoboxcaption', el => el.innerText)
      .catch(evalCatchHandler),
  ]);

  const browser = page.browser();
  const dlPage = await browser.newPage();
  try {
    await download(dlPage, imgUrl, `${imageDirPath}/${imgName}`);
  } finally {
    await dlPage.close();
  }

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

// ----- Equipment -----

const visitEqp = async (page, url) => {
  await page.goto(url, {waitUntil: 'networkidle0'});
  await autoScroll(page);
  console.log(url);

  const {url: rawImgUrl, name: imgName} = await page
    .$eval('table.portable-infobox:first-of-type td[colspan] img', el => ({
      url: el.getAttribute('src'),
      // Strip extension from path
      name: (el.alt || el.getAttribute('src').split('/').pop().split('?')[0])
        .replace(/\.\w+$/, '')
        .replace(/é/g, 'e'),
    }))
    .catch(evalCatchHandler);
  const imgUrl = resolveImgUrl(rawImgUrl);

  const [description, name, flavorText, keyInfo] = await Promise.all([
    page.$eval('td.infoboxdesc', el => el.innerText).catch(evalCatchHandler),
    page
      .$eval('th.infoboxname', el => {
        const clone = el.cloneNode(true);
        clone.querySelectorAll('span').forEach(s => s.remove());
        return clone.textContent.trim();
      })
      .catch(evalCatchHandler),
    page.$eval('td.infoboxcaption', el => el.innerText).catch(evalCatchHandler),
    page
      .$$eval('table.portable-infobox:first-of-type tr', els =>
        els.reduce((agg, cur) => {
          const label = cur.querySelector('td')?.innerText.toLocaleLowerCase();
          return ['rarity', 'cooldown', 'unlock', 'id'].includes(label)
            ? {...agg, [label]: cur.querySelectorAll('td')[1].innerText}
            : agg;
        }, {}),
      )
      .catch(evalCatchHandler),
  ]);

  const browser = page.browser();
  const dlPage = await browser.newPage();
  try {
    await download(dlPage, imgUrl, `${imageDirPath}/${imgName}`);
  } finally {
    await dlPage.close();
  }

  return {
    ...keyInfo,
    wikiUrl: url,
    description,
    name,
    flavorText,
    imgUrl,
  };
};

// ----- Survivors -----

const visitSurvivor = async (page, url) => {
  logInfo(`Visiting survivor page: ${url}`);
  await page.goto(url, {waitUntil: 'networkidle0'});
  await autoScroll(page);
  console.log(url);

  // Name: get text from .infoboxname, excluding DLC tooltip spans
  const name = await page
    .$eval('th.infoboxname', el => {
      const clone = el.cloneNode(true);
      clone.querySelectorAll('span').forEach(s => s.remove());
      return clone.textContent.trim();
    })
    .catch(evalCatchHandler);

  // Portrait image
  const {url: rawImgUrl, name: imgName} = await page
    .$eval('table.portable-infobox td[colspan] img', el => ({
      url: el.getAttribute('src'),
      // Strip extension from path
      name: (el.alt || el.getAttribute('src').split('/').pop().split('?')[0])
        .replace(/\.\w+$/, '')
        .replace(/é/g, 'e'),
    }))
    .catch(evalCatchHandler);
  const imgUrl = resolveImgUrl(rawImgUrl);

  // Description
  const description = await page
    .$eval('td.infoboxdesc', el => el.innerText.trim())
    .catch(evalCatchHandler);

  // Stats from infobox rows
  const stats = await page.$$eval('table.portable-infobox tr', rows => {
    const statKeys = [
      'Health',
      'Health Regen',
      'Damage',
      'Speed',
      'Armor',
      'Unlock',
    ];
    const result = {};
    for (const row of rows) {
      const tds = row.querySelectorAll('td');
      if (tds.length >= 2) {
        const key = tds[0].innerText.trim();
        if (statKeys.includes(key)) {
          let value = tds[1].innerText.trim();
          if (key === 'Armor') {
            value = value.replace('(', '(Max');
          }
          result[key] = value;
        }
      }
    }
    return result;
  });

  // Skills from table.article-table.skill
  const skills = await page
    .$$eval('table.article-table.skill', tables =>
      tables.map(table => {
        const rows = Array.from(table.querySelectorAll('tr'));

        const headlineEl = table.querySelector('h3 .mw-headline');
        const name = headlineEl
          ? headlineEl.innerText.trim()
          : rows[0]?.innerText.trim();

        const imgEl = table.querySelector('th.skillimage img');
        const imgUrl = imgEl ? imgEl.getAttribute('src') : null;
        // Strip extension from path
        const imgName = imgEl
          ? (
              imgEl.alt ||
              imgEl.getAttribute('src').split('/').pop().split('?')[0]
            )
              .replace(/\.\w+$/, '')
              .replace(/é/g, 'e')
          : null;

        const data = {};
        for (const row of rows) {
          const th = row.querySelector('th.skillrow');
          const td = row.querySelector('td');
          if (th && td) {
            data[th.innerText.trim()] = td.innerText.trim();
          }
        }

        for (const [i, row] of rows.entries()) {
          const th = row.querySelector('th');
          if (th && th.innerText.trim() === 'Notes' && rows[i + 1]) {
            const notesTd = rows[i + 1].querySelector('td');
            if (notesTd) {
              data['Notes'] = notesTd.innerText.trim();
            }
            break;
          }
        }

        return {name, imgUrl, imgName, ...data};
      }),
    )
    .catch(evalCatchHandler);

  // Resolve skill image URLs before downloading
  if (skills) {
    for (const skill of skills) {
      skill.imgUrl = resolveImgUrl(skill.imgUrl);
    }
  }

  // Download images using a separate page to avoid losing current page state
  const browser = page.browser();
  const dlPage = await browser.newPage();
  try {
    await download(dlPage, imgUrl, `${imageDirPath}/${imgName}`);
    if (skills) {
      for (const skill of skills.filter(skill => skill.imgUrl)) {
        await download(
          dlPage,
          skill.imgUrl,
          `${imageDirPath}/${skill.imgName}`,
        );
      }
    }
  } finally {
    await dlPage.close();
  }

  return {
    wikiUrl: url,
    description,
    stats,
    name,
    skills,
    imgUrl,
  };
};

// ----- Challenges -----

const visitChallenge = async (page, url) => {
  await page.goto(url, {waitUntil: 'networkidle0'});
  await autoScroll(page);
  console.log(url);
  const challenges = await page.$$eval('.wikitable.floatheader', tables =>
    tables
      .map((table, i) => {
        const tableRows = Array.from(table.querySelectorAll('tbody tr'));
        return tableRows
          .map(tableRow => {
            const tableDatas = tableRow.querySelectorAll('td');
            if (tableDatas.length < 3) return null;
            const unlockTd = tableDatas[2];
            const img = unlockTd.querySelector('img');
            if (!img) return null;
            return {
              name: tableDatas[0].innerText,
              description: tableDatas[1].innerText,
              unlock: unlockTd.innerText,
              category: CHALLENGE_TABLE_CATEGORY[i],
              imgUrl: img.getAttribute('src'),
              // Strip extension from path
              imgName: img.alt.replace(/\.\w+$/, '').replace(/é/g, 'e'),
            };
          })
          .filter(Boolean);
      })
      .flat(),
  );

  // Resolve image URLs
  for (const challenge of challenges) {
    challenge.imgUrl = resolveImgUrl(challenge.imgUrl);
  }

  const browser = page.browser();
  const dlPage = await browser.newPage();
  try {
    for (const challenge of challenges) {
      const outputPath = `${imageDirPath}/${challenge.imgName.replace(/ /g, '')}`;
      try {
        fs.accessSync(outputPath, fs.constants.F_OK);
        console.log(`${outputPath} exists`);
      } catch {
        await download(dlPage, challenge.imgUrl, outputPath);
      }
    }
  } finally {
    await dlPage.close();
  }

  return challenges.reduce((agg, cur) => ({...agg, [cur.name]: cur}), {});
};

// ----- Artifacts -----

const visitArtifact = async (page, url) => {
  await page.goto(url, {waitUntil: 'networkidle0'});
  await autoScroll(page);
  console.log(url);
  const artifacts = await page.$$eval('.wikitable.floatheader', tables =>
    tables
      .map(table => {
        const tableRows = Array.from(table.querySelectorAll('tbody tr'));
        return tableRows
          .map(tableRow => {
            const tableDatas = tableRow.querySelectorAll('td');
            if (tableDatas.length === 0) return null;
            const img = tableDatas[0].querySelector('img');
            if (!img || !img.alt.startsWith('Artifact')) return null;
            // Strip extension from path
            const name = img.alt.replace(/\.\w+$/, '').replace(/é/g, 'e');
            return {
              name,
              description: tableDatas[1].innerText,
              code: tableDatas[2].textContent.replace(/[ \n]/g, ''),
              imgUrl: img.getAttribute('src'),
              imgName: name,
            };
          })
          .filter(artifact => !!artifact);
      })
      .flat(),
  );

  // Resolve image URLs
  for (const artifact of artifacts) {
    artifact.imgUrl = resolveImgUrl(artifact.imgUrl);
  }

  const browser = page.browser();
  const dlPage = await browser.newPage();
  try {
    for (const artifact of artifacts) {
      await download(
        dlPage,
        artifact.imgUrl,
        `${imageDirPath}/${artifact.imgName}`,
      );
    }
  } finally {
    await dlPage.close();
  }

  return artifacts.reduce((agg, cur) => ({...agg, [cur.name]: cur}), {});
};

// ----- Code generation -----

const generateImageRequires = () => {
  // could improve by reading item_data.json to get name so name in gen'd code
  // doesn't have to have its spaces stripped
  const outputPath = `${imageDirPath}/images.js`;
  const imgFiles = fs.readdirSync(imageDirPath);
  const [getFilenameWithoutExt, getFileExt] = [
    filename => filename.split('.').slice(0, -1).join('.'),
    filename => filename.split('.').slice(-1)[0],
  ];
  const fileInfo = imgFiles
    .filter(filename => ['jpg', 'png'].includes(getFileExt(filename)))
    .map(filename => ({
      name: getFilenameWithoutExt(filename),
      path: `./${filename}`,
    }));
  const kvPairs = fileInfo.map(
    file =>
      `${JSON.stringify(file.name === 'SauteedWorms' ? 'SautéedWorms' : file.name)}: require(${JSON.stringify(file.path)})`,
  );
  const code = `export default {${kvPairs.join(',\n')}}`;
  console.log(code);
  fs.writeFile(outputPath, code, err => {
    if (err) throw err;
    console.log(`written to ${outputPath}`);
  });
};

// ----- Main -----

const main = () => {
  if (!fs.existsSync(imageDirPath)) {
    fs.mkdirSync(imageDirPath);
  }

  const args = process.argv.slice(2);
  const positionalArgs = args.filter(s => !s.startsWith('-'));
  const flags = args.filter(s => s.startsWith('-'));
  FLAG_VERBOSE = flags.includes('--verbose');
  const action = positionalArgs[0];
  const baseUrl = `${rootUrl}/wiki`;

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
        visitCallback: visitItem,
        ignoreList: ITEM_IGNORE_LIST,
        single: flags.includes('--single'),
      })
        .then(itemData => {
          if (flags.includes('--single')) {
            console.log(JSON.stringify(itemData, null, 2));
          } else {
            const outputPath = itemDataPath;
            fs.writeFile(outputPath, JSON.stringify(itemData), err => {
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
        single: flags.includes('--single'),
      })
        .then(eqpData => {
          if (flags.includes('--single')) {
            console.log(JSON.stringify(eqpData, null, 2));
          } else {
            const outputPath = eqpDataPath;
            fs.writeFile(outputPath, JSON.stringify(eqpData), err => {
              if (err) throw err;
              console.log(`written to ${outputPath}`);
            });
          }
        })
        .catch(console.error);
      break;
    case 'survivors':
      const SURVIVOR_SEED = `${rootUrl}/wiki/Survivors`;
      const SURVIVOR_IGNORE_LIST = [];
      scrape({
        seed: positionalArgs[1] || SURVIVOR_SEED,
        visitCallback: visitSurvivor,
        ignoreList: SURVIVOR_IGNORE_LIST,
        single: flags.includes('--single'),
        genUrls: async page =>
          await page.$$eval('.gallerybox .thumb a', links =>
            links.map(l => l.getAttribute('href')),
          ),
        skipSeed: true,
      })
        .then(survivorData => {
          if (flags.includes('--single')) {
            console.log(JSON.stringify(survivorData, null, 2));
          } else {
            const outputPath = survivorDataPath;
            fs.writeFile(outputPath, JSON.stringify(survivorData), err => {
              if (err) throw err;
              console.log(`written to ${outputPath}`);
            });
          }
        })
        .catch(console.error);
      break;
    case 'challenges':
      const CHALLENGE_SEED = `${baseUrl}/Challenges`;
      scrape({
        seed: positionalArgs[1] || CHALLENGE_SEED,
        visitCallback: visitChallenge,
        single: true,
        ignoreList: [],
      })
        .then(challengeData => {
          if (flags.includes('--single')) {
            console.log(JSON.stringify(challengeData, null, 2));
          } else {
            fs.writeFile(
              challengeDataPath,
              JSON.stringify(challengeData),
              err => {
                if (err) throw err;
                console.log(`written to ${challengeDataPath}`);
              },
            );
          }
        })
        .catch(console.error);
      break;
    case 'artifacts':
      const ARTIFACT_SEED = `${baseUrl}/Artifacts`;
      scrape({
        seed: positionalArgs[1] || ARTIFACT_SEED,
        visitCallback: visitArtifact,
        single: true,
        ignoreList: [],
      })
        .then(artifactData => {
          if (flags.includes('--single')) {
            console.log(JSON.stringify(artifactData, null, 2));
          } else {
            fs.writeFile(
              artifactDataPath,
              JSON.stringify(artifactData),
              err => {
                if (err) throw err;
                console.log(`written to ${artifactDataPath}`);
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
      console.log(CLI_DOC);
      break;
  }
};

main();
