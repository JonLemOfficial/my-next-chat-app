import { NextApiRequest, NextApiResponse } from 'next';
import { Sequelize, QueryTypes } from 'sequelize';
import { User } from '@/types/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { from, to } = req.query;
    const DB_URI = process.env.NODE_ENV === 'production'
      ? process.env.DB_PROD_URI
      : process.env.DB_LOCAL_URI;

    const connection = new Sequelize(DB_URI || '', {
      dialect: 'mysql',
      protocol: 'mysql',
      logging: false
    });

    const data = await connection.query(
      'SELECT * FROM Messages WHERE (sender = ? OR sender = ?) AND (receiver = ? OR receiver = ?) ORDER BY id ASC',
      { replacements: [ from, to, from, to ], type: QueryTypes.SELECT }
    );

    if ( data.length > 0 ) {
      const sender = await connection.query(
        'SELECT * FROM Users WHERE id = ?',
        { replacements: [ from ], type: QueryTypes.SELECT }
      );
      const receiver = await connection.query(
        'SELECT * FROM Users WHERE id = ?',
        { replacements: [ to ], type: QueryTypes.SELECT }
      );

      if ( ! sender.length || ! receiver.length ) {
        return res.status(404).json({ msg: 'Users not found' });
      }

      const userFrom: User = sender[0] as User;
      const userTo: User = receiver[0] as User;

      const messages = data.map((msg: any) => {
        // Verificamos: ¿El ID 'sender' en la tabla Message coincide con el ID de 'from'?
        // Usamos String() para asegurar que la comparación no falle por tipos (número vs string)
        const isMeSender = String(msg.sender) === String(userFrom.id);

        return {
          id: msg.id,
          // Si el mensaje lo envió 'from', asignamos userFrom, si no, userTo
          sender: isMeSender 
            ? { key: userFrom.id, username: userFrom.username }
            : { key: userTo.id, username: userTo.username },
          
          // El receptor es el opuesto
          receiver: isMeSender
            ? { key: userTo.id, username: userTo.username }
            : { key: userFrom.id, username: userFrom.username },

          text: msg.message,
          sent_at: msg.sent_at,
        };
      });

      return res.status(200).json({ messages });
    }

    if ( data ) return res.status(200).json({ messages: data });
    else return res.status(400).json({ msg: 'Failed to get messages from the database' });
  } catch (ex) {
    // console.log(ex);
    return res.status(400).json({ msg: 'An error has ocurred', ex });
  }
}
