require('dotenv').config();

const db = require('./libs/db');
const lg = require('./libs/log');
const fs = require('fs-extra');
const cron = require('node-cron');
const shell = require('shelljs');

function read(path) {
  lg.debug('Читаю список сессий');
  fs.readdir(path, (err, files) => {
    if (err) return lg.error(err);
    files.forEach((f) => {
      try {
        toMap(path, f)
      } catch (e) {
        lg.error(e);
      }
    })
  })
}

async function toMap(path2, f) {
  let path = `${path2}/${f}`;
  if (fs.existsSync(`${path}/ids.txt`)) {
    lg.debug(`путь ${path}`);
    // let ids = {};
    let ids = [];
    let layoutName;
    let grids = [];
    fs.readFileSync(`${path}/ids.txt`, 'utf8').split('\n').forEach(id => {
      let i = id.split(',');
      if (i.length < 3) {
      } else {
        grids.push(i[2]);
        ids.push({
          x: i[0],
          y: i[1],
          offset_x: i[0],
          offset_y: i[1],
          grid_id: i[2]
        })
      }

    });
    if(ids.length < 8) return lg.error('Слишком короткий массив данных');
    // return;
    let rightIds = [];
    let knownGrids = await checkGrids(grids);
    let layoutId;

    if (knownGrids.length === 0) {
      return //lg.debug('Нет известных тайтлов')
      // lg.debug('Создаю новый слой');
      // layoutId = await createNewLayout();
      // ids.forEach((i) => i.layout_id = layoutId[0]);
      // rightIds = ids;
    } else {
      lg.debug(knownGrids);
      let newCoord = await setCoord(ids, knownGrids);
      ids = newCoord.ids;
      layoutName = newCoord.layoutName;
      layoutId = newCoord.layoutId;
      lg.warn(layoutName);
    }
    try {
      fs.mkdirSync(`${process.env.MAP_FOLDER}${layoutName}/9`);
    } catch (e) {

    }

    ids.forEach((item) => {
      rightIds.push({grid_id: item.grid_id, x: item.x, y: item.y, layout_id: layoutId});
      let source = `${path}/tile_${item.offset_x}_${item.offset_y}.png`;
      let dest = `${process.env.MAP_FOLDER}${layoutName}/9/tile_${item.x}_${item.y}.png`;
      lg.debug(`Copy tyle from ${source} to ${dest}`);
      fs.copyFile(source, dest, (err) => {
        if (err) {
          lg.error(err);
          lg.error(layoutName);
        }
      })
    });

    try {
      // fs.moveSync(`${path}/`, `${process.env.SESSION_FOLDER}/`);
      // shell.cp('-f', `${path}/`, `${process.env.SESSION_FOLDER}/`)
      // shell.mv('-f', `${path}/`, `${process.env.SESSION_FOLDER}/`)
      // shell.mv('-f', `${path}/`, `${process.env.SESSION_FOLDER}/`)
      shell.exec(`find ${path2}/ -type d -empty -delete`);
      shell.mv('-f', `${path}/`, `${process.env.SESSION_FOLDER}/`);
      shell.mv('-f', `${path}/*`, `${process.env.SESSION_FOLDER}/${f}/`)

      // shell.exec(`mv ${path}/ ${process.env.SESSION_FOLDER}/ -r`)
    } catch (e) {
      lg.error(e);
      lg.error(`${path}/`);
      lg.error(`${process.env.SESSION_FOLDER}/`)
    }

    // .then().catch(e => lg.error(path, process.env.SESSION_FOLDER, e));
    await addCoords(rightIds);
  }
}

async function getLayoutName(id) {
  return db('layouts').select().where('id', id);
}

async function setCoord(ids, knownGrids) {
  let knownTitle = knownGrids[0];
  let knownTitleOffset = ids.find((curr, i, arr) => {
    return curr.grid_id === knownTitle.grid_id;
  });
  let zeroTitleX = knownTitle.x - knownTitleOffset.x;
  let zeroTitleY = knownTitle.y - knownTitleOffset.y;
  lg.debug('knownTitleOffset', knownTitleOffset);
  lg.debug('knownTitle', knownTitle);
  let layoutId = knownTitle.layout_id;
  let layoutName = await (getLayoutName(layoutId));
  layoutName = layoutName[0].name;
  let zeroTitle;
  ids.forEach((curr, i) => {
    if (curr.grid_id === knownTitle.grid_id) zeroTitle = i;
  });
  // lg.debug('zeroTitle', zeroTitle);
  ids[zeroTitle].x = zeroTitleX;
  ids[zeroTitle].y = zeroTitleY;
  ids.forEach((item, i) => {
    if (item.grid_id !== knownTitle.grid_id) {
      item.x = parseInt(zeroTitleX) + parseInt(item.x);
      item.y = parseInt(zeroTitleY) + parseInt(item.y);
      item.layout_id = layoutId;
    }
  });


  return {ids: ids, layoutName: layoutName, layoutId: layoutId}
  //   .filter((item) => {
  //   return gridsArr.indexOf(item.grid_id) === -1
  // });


  // lg.debug(zeroTitle);
  // ids.forEach()

}

async function addCoords(ids) {
  for (let i in ids) {
    db('titles').insert(ids[i]).then(i => i).catch(err => err)
  }
  // return
}

async function createNewLayout() {
  return db('layouts').insert({name: Date().toString()})
}

async function checkGrids(grids) {
  let sql = db.select().from('titles').whereIn('grid_id', grids);
  // lg.debug(sql.toString());
  let result = await sql;
  // lg.debug(result);
  return result;
}

let interval = setInterval(() => {
  lg.debug('generate time!');
  read(`${process.env.TMP_SESSION_FOLDER}`);
}, 10000);

// module.exports = cron.schedule('*/10 * * * * *', () => {
//   lg.debug('generate time!');
//   read(`${process.env.TMP_SESSION_FOLDER}`);
// });
// lg.debug('hi blyad');
// read(`${process.env.TMP_SESSION_FOLDER}`);
// read(`${process.env.TMP_SESSION_FOLDER}`);
