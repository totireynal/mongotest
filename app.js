const express = require('express');
const { connectToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');

// init app & middleware

const  app = express();
app.use(express.json())

// db connection
let db;
 
connectToDb((err) => {
    if(!err) {
        app.listen(3000, () => {
            console.log('app listening on port 3000')
        })
        db = getDb()
    }
})


// routes

app.get('/books', (req, res) => {

    const page = req.query.p || 0;
    const booksPerPage = 1;

    let books = [];

    db.collection('books')
    .find()
    .sort({author:1})
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach(book => books.push(book))
    .then(() => {
        res.status(200).json(books)
    })
    .catch(() => {
        res.status(500).json({error: 'Could not fetch the documents'})
    })
})

app.get('/books/:id', (req, res) => {
    const { id } = req.params;

    if (ObjectId.isValid(id)) {
        db.collection('books')
        .findOne({_id: new ObjectId(id)})
        .then(doc => {
            res.status(200).json(doc)
        })
        .catch(() => {
            res.status(500).json({error: 'Could not fetch the document'})
        })
    } else {
        res.status(500).json({error: 'Not a valid doc id'})
    }

})


app.post('/books', (req, res) => {
    const book = req.body;

    db.collection('books')
    .insertOne(book)
    .then(result => {
        res.status(201).json(result)
    })
    .catch(() => {
        res.status(500).json({error: 'Could not create a new document'})
    })

})

app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    if (ObjectId.isValid(id)){
        db.collection('books')
        .deleteOne({_id: new ObjectId(id)})
        .then((result) => {
            res.status(200).json(result)
        })
        .catch(() => {
            res.status(500).json({error: 'Could not delete the document.'})
        })

    } else {
        res.status(500).json({error: 'Doc id is not valid.'})
    }
})

app.patch('/books/:id', (req, res) => {
    const updates = req.body;
    const { id } = req.params;

    if(ObjectId.isValid(id)){
        db.collection('books')
        .updateOne({_id: new ObjectId(id)}, {$set: updates})
        .then(result => {
            res.status(200).json(result)
        })
        .catch(() => {
            res.status(500).json({error: 'Could not update the document.'})
        })
    }else {
        res.status(500).json({error: 'Doc id is not valid.'})
    }
})

