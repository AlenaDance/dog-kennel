import pgPromise from 'pg-promise';
const pgp = pgPromise();

const db = pgp({
    host: 'localhost',
    port: 5432,
    database: 'Dogs',
    user: 'postgres',
    password: '0451',
  });

  async function getAnimals() {
    try {
        const animals = await db.any('SELECT name, image_path, animal_id FROM Animals');
        return animals;
    } catch (error) {
        console.error('Error fetching animals:', error);
        throw error;
    }
}
async function getDetail(id){
  try {
    const detail = await db.any(`SELECT * FROM Animals WHERE animal_id = ${id}`);
    return detail;
} catch (error) {
    console.error('Error fetching animals:', error);
    throw error;
}
}

export { db, getAnimals, getDetail};