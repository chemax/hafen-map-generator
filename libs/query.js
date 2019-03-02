require('dotenv').config();

const lg = require('./log');
const db = require('./db');

class Query{
  constructor(props) {

  }
  getLayoutName(id){
    return db('layouts').select().where('id', id);
  }
  async checkGrids(grids){
    let sql = db.select().from('titles').whereIn('grid_id', grids);
    // lg.debug(sql.toString());
    let result = await sql;
    // lg.debug(result);
    return result;
  }
  addCoords(ids){
    // for (let i in ids) {
    //   // await db('titles').insert(ids[i]).then(i => i).catch(err => err)
    // }
  }
}

let q = new Query();

module.exports = q;