import { addBookhandler, getBookByIdHandler, getBooksHandler, removeBookByIdHandler, updateBookByIdHandler } from './handler.js';

export const routes = [
  {
    method : 'POST',
    path: '/books',
    handler: addBookhandler
  },
  {
    method: 'GET',
    path: '/books',
    handler: getBooksHandler
  },
  {
    method: 'GET',
    path: '/books/{bookId}',
    handler: getBookByIdHandler
  },
  {
    method: 'PUT',
    path: '/books/{bookId}',
    handler: updateBookByIdHandler
  },
  {
    method: 'DELETE',
    path: '/books/{bookId}',
    handler: removeBookByIdHandler
  },
];