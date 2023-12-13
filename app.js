import fs from 'fs';
import express from 'express';
import path from 'path';
import multer from 'multer';
import {getAnimals, getDetail, db } from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const __dirname = path.resolve();
const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, 'static/images'));
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.resolve(__dirname, 'static')));


app.get('/login', (req, res) => {
  
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
    const { login, password, name} = req.body;
    
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user details in the database
    await db.none('INSERT INTO clients(name, login, password) VALUES($1, $2, $3)', [name, login, hashedPassword]);

    res.redirect('/login');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    const user = await db.oneOrNone('SELECT * FROM clients WHERE login = $1', login);

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ login: user.login, isAdmin: user.isAdmin }, 'your-secret-key');

      res.redirect(`/?isAdmin=${user.isAdmin}&login=${user.login}`);
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', async (req, res) => {
  try {
    const isAdmin = req.query.isAdmin === 'true';
    const login = req.query.login;
    const animals = await getAnimals();
    res.render('index', { animals, isAdmin, login});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/dog/:id', async (req, res) => {
  try {
      const dogId = req.params.id;
      const [dog] = await getDetail(dogId);
      const isAdmin = req.query.isAdmin === 'true';
      const login = req.query.login;
      if (dog) {
          res.render('dog', { dog, isAdmin, login});
      } else {
          res.status(404).json({ error: 'Dog not found' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/addAnimal', upload.single('image'), async (req, res) => {
  try {
      const { name, age, breed, color, coat_type, gender } = req.body;
      const image = req.file;

      const imagePath = image ? `/images/${image.originalname}` : null;
        const result = await db.none(
            'INSERT INTO Animals(name, age, breed, color, coat_type, gender, image_path) VALUES($1, $2, $3, $4, $5, $6, $7)',
            [name, age, breed, color, coat_type, gender, imagePath]
        );

        res.json({ message: 'Dog add successfully' });
  } catch (error) {
      console.error('Error adding dog:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/buyDog/:id', upload.single('image'), async (req, res) =>{
  try{
    const login = req.query.login;
    const dogId = parseInt(req.params.id, 10);
    const client = await db.oneOrNone('SELECT * FROM clients WHERE login = $1', login);

    await db.none('INSERT INTO applications(client_id, animal_id) VALUES($1,$2)',[client.client_id, dogId]);
    res.json({ message: 'application create successfully' });
  }
  catch (error) {
    console.error('Error buying dog:', error);
    res.status(500).json({ error: 'Internal Server Error'});
  }
});

app.delete('/deleteDog/:id', async (req, res) => {
  try {
      const dogId = req.params.id;

      const imagePathResult = await db.oneOrNone('SELECT image_path FROM Animals WHERE animal_id = $1', dogId);
      const imagePath = imagePathResult && imagePathResult.image_path;

      await db.none('DELETE FROM Animals WHERE animal_id = $1', dogId);

      if (imagePath) {
          const imagePathOnDisk = path.join(__dirname, 'static', imagePath);
          fs.unlinkSync(imagePathOnDisk);
      }

      res.json({ message: 'Dog deleted successfully' });
  } catch (error) {
      console.error('Error deleting dog:', error);
      res.sendStatus(500);
  }
});

app.put('/updateDog/:id', upload.single('image'), async (req, res) => {
  try {
      const dogId = req.params.id;
      const { name, age, breed, color, coat_type, gender, owner} = req.body;
      console.log('Updated values:', { name, age, breed, color, coat_type, gender, owner });
      await db.none(
            'UPDATE Animals SET name=$1, age=$2, breed=$3, color=$4, coat_type=$5, gender=$6, owner=$7 WHERE animal_id=$8',
            [name, age, breed, color, coat_type, gender, owner, dogId]
        );

      res.json({ message: 'Dog updated successfully' });
  } catch (error) {
      console.error('Error updating dog:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
