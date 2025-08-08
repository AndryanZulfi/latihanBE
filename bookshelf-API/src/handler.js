import {nanoid} from 'nanoid';
import { books } from './books.js';

export const addBookhandler = (request, h) => {
  const { 
    name, year, author, summary, publisher, pageCount, readPage, reading
  } = request.payload;

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt
  };

  if(!name){
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku'
    });
    response.code(400);
    return response;
  }else if(readPage > pageCount){
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });

    response.code(400);
    return response;
  }
  
  books.push(newBook);
  const isSuccess = books.filter((book) => book.id == id).length > 0;
  if(isSuccess){
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id
      }
    });
    response.code(201);
    return response;
  }
  
};

export const getBooksHandler = (request, h) => {

  const { reading, finished, name } = request.query;

  if(reading == 1){
    const response = h.response({
      status: 'success',
      message: 'Berhasil mendapatkan buku yang sedang dibaca',
      data: {
        books: books.filter((book) => book.reading == true).map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher
        }))
      }
    });
    response.code(200);
    return response;
  }else if(reading == 0){
    const response = h.response({
      status: 'success',
      message: 'Berhasil mendapatkan buku yang sedang tidak dibaca',
      data: {
        books: books.filter((book) => book.reading == false).map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher
        }))
      }
    });
    response.code(200);
    return response;
  }else if(finished == 1){
    const response = h.response({
      status: 'success',
      message: 'Berhasil mendapatkan buku yang selesai dibaca',
      data: {
        books: books.filter((book) => book.finished == true).map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher
        }))
      }
    });
    response.code(200);
    return response;
  }else if(finished == 0){
    const response = h.response({
      status: 'success',
      message: 'Berhasil mendapatkan buku yang belum selesai dibaca',
      data: {
        books: books.filter((book) => book.finished == false).map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher
        }))
      }
    });
    response.code(200);
    return response;
  }else if(name){
    const response = h.response({
      status: 'success',
      message: `Berhasil mendapatkan buku dengan name ${name}`,
      data: {
        books: books.filter((book) => book.name.toLowerCase().includes(name.toLowerCase())).map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher
        }))
      }
    });
    response.code(200);
    return response;
  }
  

  const response = h.response({
    status: 'success', 
    data: {
      books: books.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher
      }))
    }
  });
  response.code(200);
  return response;
};

export const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  
  const index = books.findIndex((book) => book.id === bookId);

  if(index != -1){
    const book = books[index];
    const response = h.response({
      status: 'success',
      message: 'Buku ditemukan',
      data: {
        book
      }
    });
    response.code(200);
    return response;
  }
 
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan'
  });

  response.code(404);
  return response; 
};

export const updateBookByIdHandler = (request, h) => {
  const { 
    name, year, author, summary, publisher, pageCount, readPage, reading
  } = request.payload;
  const { bookId } = request.params;
  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id == bookId);

  if(!name){
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku'
    });

    response.code(400);
    return response;
  }else if(readPage > pageCount){
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
    });
    
    response.code(400);
    return response;
  }else if(index === -1){
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;
  }

  books[index] = {
    ...books[index],
    name, 
    year, 
    author, 
    summary, 
    publisher, 
    pageCount, 
    readPage, 
    reading,
    updatedAt
  };
  const response = h.response({
    status: 'success',
    message: 'Buku berhasil diperbarui',
  });
  response.code(200);
  return response;
};

export const removeBookByIdHandler = (request, h) => {
  const {bookId} = request.params;

  const index = books.findIndex((book) => book.id == bookId);

  if(index != -1){
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus'
    });

    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan'
  });

  response.code(404);
  return response;
};

