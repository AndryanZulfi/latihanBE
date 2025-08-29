import dayjs from 'dayjs'

const convertToString = (notes) => {
    return notes.map(note => ({
          ...note,
          createdAt: dayjs(note.createdAt).format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: dayjs(note.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
        }))
}

export default convertToString