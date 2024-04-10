
const mongoose = require('mongoose')

//mongodb+srv://alumni:<password>@cluster0.tqky1az.mongodb.net/?retryWrites=true&w=majority

mongoose.connect('mongodb+srv://technologyIO:wpEIP3ictaMz91fy@cluster0.fdpqeih.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

module.exports = db