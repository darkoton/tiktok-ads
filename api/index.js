const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');


const app = express();
  console.log("tester log")
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../template')));

app.get('/api/data', async (req, res) => {
  try {
    // const data = await fs.readFileSync(path.join(__dirname, '../data.json'));
    const data = (await fetch("https://67586d4060576a194d107910.mockapi.io/data/1", {method:'GET'} )).json()[0]
    res.json(JSON.parse(data));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../template', 'index.html'));
// });

// app.get('/admin', (req, res) => {
//   res.sendFile(path.join(__dirname, '../template', 'admin.html'));
// });

app.put('/api/update', async (req, res) => {
  try {
    if (req.body) {
      // await fs.writeFileSync(path.join(__dirname, '../data.json'), JSON.stringify(req.body));
      await fetch("https://67586d4060576a194d107910.mockapi.io/data/1", {method:'PUT', body: JSON.stringify(req.body)} )
      res.json({ message: 'Data is updated' });
    } else {
      res.status(400).json({ message: 'Body is empty' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Экспорт приложения для использования как серверлесс-функции
module.exports = app;
