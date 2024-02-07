const mongoose = require('mongoose');
const book = require('./book');

const authorSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    }
})

authorSchema.pre('deleteOne',function(next){
    book.find({ author: this._conditions._id })
    .then(books=>{
        if(books.length>0){
            next(new Error("This author has books still"))
        }else{
            next();
        }   
    }).catch(err=>{
        next(err)
    })
})

module.exports = mongoose.model('Author',authorSchema);