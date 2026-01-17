import { NextApiRequest, NextApiResponse } from 'next';
import { Sequelize, QueryTypes } from 'sequelize';

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { from, to, message } = req.body;
    const DB_URI = process.env.NODE_ENV === 'production'
      ? process.env.DB_PROD_URI
      : process.env.DB_LOCAL_URI;

    const connection = new Sequelize(DB_URI || '', {
      dialect: 'mysql',
      protocol: 'mysql',
      logging: false
    });

    const [ data ] = await connection.query(
      'INSERT INTO Messages (message, sender, receiver) VALUES (?, ?, ?)',
      { replacements: [ message, from, to ], type: QueryTypes.INSERT }
    );

    if ( data ) return res.status(200).json({ msg: 'Message added successfully.' });
    else return res.status(400).json({ msg: 'Failed to add message to the database' });
  } catch (ex) {
    return res.status(400).json({ msg: 'An error has ocurred', ex });
  }
}
