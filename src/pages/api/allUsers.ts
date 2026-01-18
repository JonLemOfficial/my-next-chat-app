import type { NextApiRequest, NextApiResponse } from 'next';
import { Sequelize, QueryTypes } from 'sequelize';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const DB_URI = process.env.NODE_ENV === 'production'
      ? process.env.DB_PROD_URI
      : process.env.DB_LOCAL_URI;
  
    const connection = new Sequelize(DB_URI || '', {
      dialect: 'mysql',
      protocol: 'mysql',
      logging: false
    });
  
    const data = await connection.query(
      'SELECT * FROM Users',
      { type: QueryTypes.SELECT }
    );
  
    if (  data.length > 0 ) {
      return res.status(200).json({ users: data });
    }
    
    return res.status(200).json({ users: [] });
  } catch (err) {
    return res.status(400).json({ msg: 'An error has ocurred', err });   
  }
}