// jest.setup.js
require('dotenv').config();
global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
