import {nanoid} from 'nanoid'
import notes from './notes.js'
import pool from './database.js';
import convertToString from './func.js';

const c = await pool.getConnection()
export const addNoteHandler = async(request, h) => {
  try{
    const noteId = nanoid(16);
    const {title, tags, body} = request.payload
    console.log(tags);
    await c.beginTransaction();

    const [result] = await c.query(
      'INSERT INTO NOTES (id, title, body) values (?,?,?)',
      [noteId, title, body]
    )

    console.log(result);
    for(const [index, tagName] of tags.entries()){
      console.log(typeof(tagName))
      const [rows] = await c.query(
        'SELECT id FROM tags WHERE name = ?',
        [tagName]
      )

      console.log(rows)
      let tagId;
      if(rows.length === 0){
        tagId = nanoid(16);
        console.log(tagId)
        await c.query(
          'INSERT INTO tags(id, name, position) VALUES (?,?,?)',
          [tagId, tagName, index+1]
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
    console.log(notes)
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

    const [rows] = await c.query(
      `select nt.note_id t.id, t.name 
      from note_tags as nt
      join tags on nt.note_id = t.id
      where note_id = ?`,
      [id]
    );


    //Mengambil tags baru yang belum ada di database



    //Menambahkan tags baru ke database dan juga relasinya




    //Mengambil tags di database yang tidak ada di tags baru



    //Update tags sesuai id



    console.log(rows)
    rows.forEach(async(nt,index) => {
      console.log(nt.tag_id)
      await c.query(
        `UPDATE tags
        set name = ?
        WHERE id = ?`,
        [tags[index], nt.tag_id]
      )
    })
    // console.log(rows)
    const [note] = await c.query(
        `UPDATE notes
        SET title = ?,
            body = ?,
            WHERE id = ?`,
          [title,body,id]
    );
    c.commit()
    return h.response({
      status: 'success',
      message: 'Note berhasil diedit'
    })
  }catch(err){
    c.rollback();
    console.log(err)
    return h.response({
      status: 'fail',
      message: 'Gagal mengedit Note'
    })
  }


  // const { id } = request.params;

  // const { title, tags, body } = request.payload;
  // const updatedAt = new Date().toISOString();

  // const index = notes.findIndex((note) => note.id === id);
  // console.log(index);

  // if (index !== -1){
  //   notes[index] = {
  //     ...notes[index],
  //     title,
  //     tags,
  //     body,
  //     updatedAt
  //   };

  //   const response = h.response({
  //     status: 'success',
  //     message: 'Catatan berhasil di edit',
  //   });

  //   response.code(200);
  //   return response;
  // }

  // const response = h.response({
  //   status: 'fail',
  //   message: 'Gagal mengedit catatan'
  // });

  // response.code(404);
  // return response;
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
