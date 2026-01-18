import type { NextApiRequest, NextApiResponse } from 'next';
import { Sequelize, QueryTypes } from 'sequelize';

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { username } = req.body;
    const DB_URI = process.env.NODE_ENV === 'production'
      ? process.env.DB_PROD_URI
      : process.env.DB_LOCAL_URI;
  
    const connection = new Sequelize(DB_URI || '', {
      dialect: 'mysql',
      protocol: 'mysql',
      logging: false
    });
  
    const data = await connection.query(
      'SELECT * FROM Users WHERE username = ?;',
      { replacements: [ username ], type: QueryTypes.SELECT }
    );
  
    if ( ! ( data.length > 0 ) ) {
      const [ user ] = await connection.query(
        'INSERT INTO Users (username) VALUES (?);',
        { replacements: [ username ], type: QueryTypes.INSERT }
      );

      if ( user ) return res.status(200).json({ msg: `User ${username} added successfully.` });
      else return res.status(400).json({ msg: 'Failed to add user to the database.' });
    }

    return res.status(200).json({ msg: `User ${username} is already registered.` });
  } catch (err) {
    return res.status(400).json({ msg: 'An error has ocurred', err });   
  }
}