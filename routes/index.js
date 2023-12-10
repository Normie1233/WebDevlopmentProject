var express = require('express');
var router = express.Router();
const path = require('path');
const { MongoClient } = require('mongodb');

const pwd = 'hIUpF87GUDSssD1d';
const mongoURL = `mongodb+srv://snehap:${pwd}@cluster0.wd2eixr.mongodb.net/?retryWrites=true&w=majority`;
const dbName = 'users';

// Function to initialize the MongoDB client
async function initMongoClient() {
    const client = new MongoClient(mongoURL, { useNewUrlParser: true});
    await client.connect();
    return client.db(dbName);
}
/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  // res.sendFile(path.join(__dirname, '../index.html'));
  res.redirect("/login");
});

router.get('/submitSurvey', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../index.html'));
})

router.get('/login', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../login.html'));
})

router.post('/login', async function(req, res, next) {
  const { username, password } = req.body;
  try {
    const db = await initMongoClient();

    // Check if the user exists in the database
    const user = await db.collection('users').findOne({ username });

    if (user && user.password === password) {
      // res.redirect("/submitSurvey");
        res.status(200).send('Login successful!');
        
    } else {
        res.status(401).send('Login failed. Invalid credentials.');
    }
} catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
}
})

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
      const db = await initMongoClient();

      // Check if the user already exists in the database
      const existingUser = await db.collection('users').findOne({ username });

      if (existingUser) {
          res.status(400).send('Username already exists. Please choose another one.');
      } else {
          // If the user doesn't exist, create a new user in the database
          await db.collection('users').insertOne({ username, password });
          res.status(201).send('Signup successful!');
      }
  } catch (error) {
      console.error('Error during signup:', error);
      res.status(500).send('Internal Server Error');
  }
});

router.post('/submit', async (req, res) => {
  const { age, 
    favoritePlatform, 
    usageHours,
     impact, 
     privacyConcerns, 
     improvements} = req.body;

     try {
      const db = await initMongoClient();
      console.log(favoritePlatform)
          // If the user doesn't exist, create a new user in the database
          await db.collection('surveys').insertOne({ age, 
            favoritePlatform, 
            usageHours,
             impact, 
             privacyConcerns, 
             improvements});
          res.status(201).send('Submission successful!');
  } catch (error) {
      console.error('Error during submission:', error);
      res.status(500).send('Internal Server Error');
  } 
})

router.get('/surveys', async (req, res) => {
  try {
    const db = await initMongoClient();
    // Check if the user already exists in the database
    const surveys = await db.collection('surveys').find({}).toArray();
    
    if (surveys) {
      const surveysTable = generateTable(surveys);
      res.send(`<!DOCTYPE html>
      <body>
      <h2>Survey results</h2>
      ${surveysTable}
      </body>
      </html>`)
    }
    else {
      res.json([]);
    }
  } catch (error) {
      console.error(error)
      res.status(500);
    }
});

function generateTable(data) {
  if (data.length === 0) {
      return '<p>No data available.</p>';
  }

  const keys = Object.keys(data[0]);

  const tableHeader = `
      <thead>
          <tr>
              ${keys.map(key => `<th>${key}</th>`).join('')}
          </tr>
      </thead>
  `;

  const tableBody = `
      <tbody>
          ${data.map(row => `
              <tr>
                  ${keys.map(key => `<td>${row[key]}</td>`).join('')}
              </tr>
          `).join('')}
      </tbody>
  `;

  return `<table>${tableHeader}${tableBody}</table>`;
}
module.exports = router;
