import path from 'path';
import fs from 'fs';

class Store {

  constructor(props) {

  }

  parseDataFile = (filePath) => {
    try {
      return JSON.parse(fs.readFileSync(filePath));
    } catch(error) {
        console.error(error);
    }
  }

}

export default Store;
