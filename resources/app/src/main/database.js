const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const DATA_DIR = path.join(app.getPath('userData'), 'data');
const DATA_FILE = path.join(DATA_DIR, 'goods.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getDefaultGoods() {
  return [
    {
      id: '1001', name: 'Organic Apples', purchase_price: 3.5, original_sell_price: 5.0,
      discount: 0.8, discounted_sell_price: 4.0, profit: 50.0, quantity: 100,
      import_time: Math.floor(Date.now() / 1000) - 86400 * 13,
      import_time_text: formatTimestamp(Math.floor(Date.now() / 1000) - 86400 * 13)
    },
    {
      id: '1002', name: 'Premium Coffee Beans', purchase_price: 12.0, original_sell_price: 25.0,
      discount: 0.9, discounted_sell_price: 22.5, profit: 315.0, quantity: 30,
      import_time: Math.floor(Date.now() / 1000) - 86400 * 11,
      import_time_text: formatTimestamp(Math.floor(Date.now() / 1000) - 86400 * 11)
    },
    {
      id: '1003', name: 'Whole Milk 1L', purchase_price: 1.2, original_sell_price: 2.0,
      discount: 1.0, discounted_sell_price: 2.0, profit: 40.0, quantity: 50,
      import_time: Math.floor(Date.now() / 1000) - 86400 * 12,
      import_time_text: formatTimestamp(Math.floor(Date.now() / 1000) - 86400 * 12)
    },
    {
      id: '1004', name: 'Artisan Bread', purchase_price: 2.0, original_sell_price: 4.5,
      discount: 1.0, discounted_sell_price: 4.5, profit: 50.0, quantity: 20,
      import_time: Math.floor(Date.now() / 1000) - 86400 * 7,
      import_time_text: formatTimestamp(Math.floor(Date.now() / 1000) - 86400 * 7)
    },
    {
      id: '1005', name: 'Imported Olive Oil', purchase_price: 8.0, original_sell_price: 15.0,
      discount: 0.85, discounted_sell_price: 12.75, profit: 71.25, quantity: 15,
      import_time: Math.floor(Date.now() / 1000) - 86400 * 4,
      import_time_text: formatTimestamp(Math.floor(Date.now() / 1000) - 86400 * 4)
    }
  ];
}

function formatTimestamp(ts) {
  const d = new Date(ts * 1000);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function calculateDerivedFields(item) {
  const discounted = item.original_sell_price * item.discount;
  const profit = (discounted - item.purchase_price) * item.quantity;

  const importTime = item.import_time || Math.floor(Date.now() / 1000);
  const d = new Date(importTime * 1000);
  const pad = (n) => n.toString().padStart(2, '0');
  const timeText = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

  return {
    ...item,
    discounted_sell_price: Number(discounted.toFixed(2)),
    profit: Number(profit.toFixed(2)),
    import_time: importTime,
    import_time_text: item.import_time_text || timeText
  };
}

function loadAll() {
  ensureDataDir();

  if (!fs.existsSync(DATA_FILE)) {
    const defaults = getDefaultGoods();
    saveAll(defaults);
    return defaults;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data;
    }
    return getDefaultGoods();
  } catch (e) {
    console.error('Failed to load data file, using defaults:', e.message);
    return getDefaultGoods();
  }
}

function saveAll(goods) {
  ensureDataDir();

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(goods, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to save data:', e.message);
    return false;
  }
}

function listGoods(params) {
  let goods = loadAll();
  const { keyword, startDate, endDate, sortBy, order } = params || {};

  if (keyword) {
    const lower = keyword.toLowerCase();
    goods = goods.filter(g =>
      g.name.toLowerCase().includes(lower) || g.id.toLowerCase().includes(lower)
    );
  }

  if (startDate && endDate) {
    const startT = new Date(startDate).getTime() / 1000;
    const endT = new Date(endDate).getTime() / 1000 + 86400;
    goods = goods.filter(g => g.import_time >= startT && g.import_time < endT);
  }

  const sortField = sortBy || 'import_time';
  const sortDir = order === 'asc' ? 1 : -1;

  goods.sort((a, b) => {
    let va = a[sortField];
    let vb = b[sortField];
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return -1 * sortDir;
    if (va > vb) return 1 * sortDir;
    return 0;
  });

  return goods;
}

function addGood(data) {
  const goods = loadAll();

  if (goods.find(g => g.id === data.id)) {
    return { success: false, message: 'Goods ID already exists, please use a unique ID' };
  }

  const newItem = calculateDerivedFields({
    ...data,
    import_time: Math.floor(Date.now() / 1000)
  });

  goods.unshift(newItem);
  const saved = saveAll(goods);
  if (!saved) {
    return { success: false, message: 'Failed to save data to disk' };
  }
  return { success: true, message: 'Goods added successfully', data: newItem };
}

function updateGood(id, data) {
  const goods = loadAll();
  const index = goods.findIndex(g => g.id === id);

  if (index === -1) {
    return { success: false, message: 'Goods not found' };
  }

  const updatedItem = calculateDerivedFields({
    ...goods[index],
    ...data,
    id: id,
    import_time: goods[index].import_time
  });

  goods[index] = updatedItem;
  const saved = saveAll(goods);
  if (!saved) {
    return { success: false, message: 'Failed to save data to disk' };
  }
  return { success: true, message: 'Goods updated successfully', data: updatedItem };
}

function deleteGood(id) {
  const goods = loadAll();
  const index = goods.findIndex(g => g.id === id);

  if (index === -1) {
    return { success: false, message: 'Goods not found' };
  }

  const deletedItem = goods[index];
  goods.splice(index, 1);
  const saved = saveAll(goods);
  if (!saved) {
    return { success: false, message: 'Failed to save data to disk' };
  }
  return { success: true, message: 'Goods deleted successfully', data: deletedItem };
}

function getGoodById(id) {
  const goods = loadAll();
  const item = goods.find(g => g.id === id);
  return item || null;
}

function getAvailableDateSegments() {
  const goods = loadAll();
  if (goods.length === 0) return [];

  const dates = goods.map(g => {
    const d = new Date(g.import_time * 1000);
    return Math.floor(d.getTime() / 86400000);
  });

  dates.sort((a, b) => a - b);
  const unique = [...new Set(dates)];

  const segments = [];
  let start = unique[0];
  let end = unique[0];

  for (let i = 1; i < unique.length; i++) {
    if (unique[i] === end + 1) {
      end = unique[i];
    } else {
      const toDate = (day) => {
        const d = new Date(day * 86400000);
        return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
      };
      segments.push({
        start_date: toDate(start),
        end_date: toDate(end),
        days: end - start + 1
      });
      start = unique[i];
      end = unique[i];
    }
  }

  const toDate = (day) => {
    const d = new Date(day * 86400000);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  };
  segments.push({
    start_date: toDate(start),
    end_date: toDate(end),
    days: end - start + 1
  });

  return segments;
}

module.exports = {
  listGoods,
  addGood,
  updateGood,
  deleteGood,
  getGoodById,
  getAvailableDateSegments,
};
