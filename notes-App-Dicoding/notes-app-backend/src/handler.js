const { nanoid } = require('nanoid');
const notes = require('./notes.js');

const addNoteHandler = (request, h) => {
  const { title, tags, body } = request.payload;
  const id = nanoid(16);
  const createdAT = new Date().toISOString();
  const updatedAt = createdAT;

  const newNote = {
    title, tags, body, id, createdAT, updatedAt
  };
  notes.push(newNote);

  const isSuccess = notes.filter((note) => note.id == id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: {
        noteId: id,
      }
    });
    response.header('Content-Type', 'application/json');
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Catatan gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const readNoteHandler = () => ({
  status: 'success',
  data: {
    notes
  }
});

const getNoteByIdHandler = (request, h) => {
  const { id } = request.params;

  const note = notes.filter((note) => note.id == id)[0];

  if (note !== undefined){
    const response = h.response({
      status: 'success',
      data: {
        note
      }
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Catatan tidak ditemukan'
  });
  response.code(404);
  return response;

};

const editNoteByIdhandler = (request, h) => {
  const { id } = request.params;

  const { title, tags, body } = request.payload;
  const updatedAt = new Date().toISOString();

  const index = notes.findIndex((note) => note.id === id);
  console.log(index);

  if (index !== -1){
    notes[index] = {
      ...notes[index],
      title,
      tags,
      body,
      updatedAt
    };

    const response = h.response({
      status: 'success',
      message: 'Catatan berhasil di edit',
    });

    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal mengedit catatan'
  });

  response.code(404);
  return response;
};

const deleteNoteByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = notes.findIndex((note) => note.id === id);

  if (index != -1) {
    notes.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Berhasil menghapus catatan',
    });
    response.code(200);
    return response;
  };

  const response = h.response({
    status: 'fail',
    message: 'Gagal menghapus catatan'
  });
  response.code(404);
  return response;
};


module.exports = { addNoteHandler, readNoteHandler, getNoteByIdHandler, editNoteByIdhandler, deleteNoteByIdHandler };