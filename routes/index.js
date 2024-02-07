const express = require('express');
const Router = express.Router();
const Book = require('../models/book')

Router.get('/',async (req,res)=>{
    let books = [];
    try {
        books = await Book.find().sort({createAt:'desc'}).limit(10).exec()
    } catch (error) {
        books = [];
    }
    res.render('index',{books:books});
})

module.exports = Router;
