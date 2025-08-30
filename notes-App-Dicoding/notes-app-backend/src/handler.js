import {nanoid} from 'nanoid'
import notes from './notes.js'
import pool from './database.js';
import convertToString from './func.js';

const c = await pool.getConnection()
export const addNoteHandler = async(request, h) => {
  try{
    const noteId = nanoid(16);
    const {title, tags, body} = request.payload
    await c.beginTransaction();

    const [result] = await c.query(
      'INSERT INTO NOTES (id, title, body) values (?,?,?)',
      [noteId, title, body]
    )

    for(const tagName of tags){
      const [rows] = await c.query(
        'SELECT id FROM tags WHERE name = ?',
        [tagName]
      )

      let tagId;
      if(rows.length === 0){
        tagId = nanoid(16);
        await c.query(
          'INSERT INTO tags(id, name) VALUES (?,?)',
          [tagId, tagName]
        )
      }else{
        tagId = rows[0].id
      }

      await c.query(
        'INSERT INTO note_tags(note_id, tag_id) VALUES (?,?)',
        [noteId, tagId]
      )
    }
    const response = h.response({
      status: 'succes',
      message: 'Note berhasil ditambahkan',
      data: {
        noteId
      }

    })
    await c.commit()
    response.code(201)
    return response

  }catch(err){
    await c.rollback()
    console.log(err)
    return h.response({
      status: 'fail',
      message: 'Note gagal ditambahkan'
    }).code(500)
  }
};

export const readNoteHandler = async(request, h) => {
  try{
    await c.beginTransaction()
    const [rows] = await c.query(
    `SELECT n.id, n.title, n.body, JSON_ARRAYAGG(t.name) AS tags, n.createdAt, n.updatedAt FROM notes AS n
      LEFT JOIN note_tags as nt ON n.id = nt.note_id
      LEFT JOIN tags as t ON nt.tag_id = t.id
      GROUP BY n.id;`
    );
    const notes = convertToString(rows)
    await c.commit()
    return h.response({
      status: 'succes',
      data: {
        notes
      },
      rows
  })
  }catch(err){
    await c.rollback()
    console.log(err);
    return h.response({
      status: 'fail',
    }).code(500)
  }
}

export const getNoteByIdHandler = async(request, h) => {

  try{
    const { id } = request.params;
    await c.beginTransaction();

    const [rows] = await c.query(
      `SELECT n.id, n.title, n.body, JSON_ARRAYAGG(t.name) AS tags, n.createdAt, n.updatedAt FROM notes AS n
        LEFT JOIN note_tags as nt ON n.id = nt.note_id
        LEFT JOIN tags as t ON nt.tag_id = t.id
        WHERE n.id = ?
        GROUP BY n.id`,
        [id]
    )

    const notes = convertToString(rows)

    const note = notes.filter((note) => note.id == id)[0];

    if (note !== undefined){
      const response = h.response({
        status: 'success',
        data: {
          note
        }
      });
      c.commit()
      response.code(200);
      return response;
    }
    throw TypeError('Id tidak ditemukan')
  }catch(err){
      console.log(err)
      c.rollback()
      const response = h.response({
        status: 'fail',
        message: 'Catatan tidak ditemukan'
      });
      response.code(404);
      return response;
  }
};

export const editNoteByIdhandler = async(request, h) => {
  try{
    await c.beginTransaction();
    const {id} = request.params;
    const {title, tags, body} = request.payload;


    //Mengambil tags di database
    const [oldTags] = await c.query(
      `SELECT t.id, t.name as name 
      FROM tags AS t
      JOIN note_tags as nt on t.id = nt.tag_id
      where nt.note_id = ?`,
      [id]
    )
    //Disamakan apakah length dari tags baru dan lama sama
    //Jika sama
    let tagId;
    await c.query(
      `DELETE FROM note_tags
       WHERE note_id = ?`,
      [id]
    )
    // const tagForDelete = oldTags.slice(tags.length)
    for(const tagName of tags){
       const [rows] = await c.query(
        `SELECT id FROM tags WHERE name = ?`,
        [tagName]
      )
      if(rows.length == 0){
        tagId = nanoid(16)
        await c.query(`INSERT INTO tags (id, name)
          VALUES (?,?)`,
          [tagId, tagName]
        )
      }else{
        tagId = rows[0].id
      }
      await c.query(
        `INSERT INTO note_tags (note_id, tag_id)
        VALUES (?, ?)`,
        [id, tagId]
      )
    }
      // for(const [i, tagName] of tags.entries()){
        
      //   if(tagForDelete.length !== 0){
      //           for(const tag of tagForDelete){
      //             await c.query(
      //               `DELETE FROM note_tags
      //               WHERE tag_id = ? AND note_id = ?`,
      //               [tag.id, id]
      //             )
      //           }   
      //     if(rows.length == 0){
              
      //     }else{
      //       tagId = nanoid(16)
      //       await c.query(`INSERT INTO tags (id, name)
      //       VALUES (?,?)`,
      //       [tagId, tagName]
      //       )
      //       await c.query(
      //         `INSERT INTO note_tags (note_id, tag_id)
      //         VALUES (?, ?)`,
      //         [id, tagId]
      //       )
      //     }    
      //   }else{
      //     if(oldTags.length > tags.length){
      //       const tagForDelete = oldTags.slice(tags.length)
      //         for(const tag of tagForDelete){
      //           await c.query(
      //             `DELETE FROM note_tags
      //             WHERE tag_id = ? AND note_id = ?`,
      //             [tag.id, id]
      //           )
      //         }
      //     }else if(!oldTags.some(tag => tag.name === tagName)){
      //       tagId = rows[0].id
      //       await c.query(
      //         `INSERT INTO note_tags(note_id,tag_id)
      //         VALUES (?,?)`,
      //         [id, tagId]
      //       )
      //     }else if(oldTags.some(tag => tag.name === tagName)){
      //       continue;
      //     }else{
      //       const tagForDelete = oldTags.slice(tags.length)
      //         for(const tag of tagForDelete){
      //           await c.query(
      //             `DELETE FROM note_tags
      //             WHERE tag_id = ? AND note_id = ?`,
      //             [tag.id, id]
      //           )
      //         }
      //     }
      //   }
      // }
    
    c.commit()
    return h.response({
      status: 'succes',
      message: 'Note berhasil di update'
    }).code(201)

  }catch(err){
    c.rollback();
    console.log(err)
    return h.response({
      status: 'fail',
      message: 'Gagal mengedit Note'
    })
  }
};

export const deleteNoteByIdHandler = async(request, h) => {
  try{
    await c.beginTransaction()
    const { id } = request.params;
    const [rows] = await c.query(
      'SELECT * FROM notes WHERE id = ?',
      [id]
    );
    if(rows.length !== 0){
      await c.query(
        'DELETE FROM notes WHERE id = ?',
      [id]
      )
      c.commit();
      return h.response({
        status: 'success',
        message:'Note berhasil dihapus',
      }).code(200)
    }

    c.rollback()
    return h.response({
      status: 'fail',
      message: `Catatan dengan id ${id} tidak ditemukan`
    })
    
  }catch(err){
    c.rollback();
    console.log(err)
    return h.response({
      status: 'fail',
      message: 'Note gagal dihapus'
    }).code(404)
  }
};
