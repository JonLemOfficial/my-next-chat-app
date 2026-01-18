import { NextApiRequest, NextApiResponse } from 'next';
import { Sequelize, QueryTypes } from 'sequelize';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Para un chat global, quizás no necesitemos 'from' obligatoriamente para la query,
    // pero lo mantenemos si quieres identificar quién solicita.
    
    const DB_URI = process.env.NODE_ENV === 'production'
      ? process.env.DB_PROD_URI
      : process.env.DB_LOCAL_URI;

    const connection = new Sequelize(DB_URI || '', {
      dialect: 'mysql',
      protocol: 'mysql',
      logging: false
    });

    // 1. Obtenemos TODOS los mensajes
    const data: any[] = await connection.query(
      'SELECT * FROM Messages ORDER BY sent_at ASC',
      { type: QueryTypes.SELECT }
    );

    // 2. Obtenemos TODOS los usuarios para tener un mapa de referencia rápido
    // Esto es mucho más eficiente que hacer queries dentro de un map o adivinar quién es quién
    const allUsers: any[] = await connection.query(
      'SELECT id, username FROM Users',
      { type: QueryTypes.SELECT }
    );

    // Creamos un mapa: { "1": { id: 1, username: "jon" }, "2": { ... } }
    const usersMap = allUsers.reduce((map, user) => {
      map[String(user.id)] = user;
      return map;
    }, {});

    if (data.length >= 0) {
      const messages = data.map((msg: any) => {
        const senderInfo = usersMap[String(msg.sender)];
        
        // Si por alguna razón el usuario no existe en la BD (huérfano)
        const sender = senderInfo 
          ? { key: senderInfo.id, username: senderInfo.username }
          : { key: msg.sender, username: 'Usuario Eliminado' };

        return {
          id: msg.id,
          sender: sender,
          // En un chat grupal, el receiver puede ser un objeto genérico o nulo
          receiver: { key: 0, username: 'GlobalGroup' },
          text: msg.message,
          sent_at: msg.sent_at,
        };
      });

      return res.status(200).json({ messages });
    }

    return res.status(200).json({ messages: [] });
    
  } catch (ex: any) {
    console.error(ex);
    // Cambiamos a 500 porque suele ser un error de servidor (DB o lógica)
    return res.status(500).json({ 
      msg: 'An error has ocurred', 
      error: ex.message 
    });
  }
}