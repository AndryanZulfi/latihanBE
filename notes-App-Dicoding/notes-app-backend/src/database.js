import mysql from 'mysql2/promise'

const pool = mysql.createPool({
    host: 'localhost',
    user: 'notes_app_user',
    password: 'notesapp',
    database: 'notes_app'
})

export default pool