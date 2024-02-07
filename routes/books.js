const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author')


// const multer = require('multer')
const path = require('path')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
// const upload = multer({
//     dest:uploadPath,
//     fileFilter:(req,file,callback)=>{
//         callback(null,imageMimeTypes.includes(file.mimetype))
//     }
// })

router.get('/',async (req,res)=>{
    let query = Book.find();
    if(req.query.title!=null && req.query.title!=='')
    {
        query = query.regex('title',new RegExp(req.query.title),'i')
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore !== '') {
        query = query.where('publishDate').lte(new Date(req.query.publishedBefore));
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter !== '') {
        query = query.where('publishDate').gte(new Date(req.query.publishedAfter));
    }
    try {
        const books = await query.exec();
        res.render('books',{
            books: books,
            searchOptions: req.query
        })
    } catch (error) {
        res.redirect('/')
    }
})

router.get('/new', async (req,res)=>{
   renderNewPage(res,new Book())
})

router.post('/' ,async (req,res)=>{
    // const fileName = req.file!=null ? req.file.filename : null
   const book = new Book({
    title:req.body.title,
    author:req.body.author,
    publishDate:new Date(req.body.publishDate),
    pageCount:req.body.pageCount,
    description:req.body.description
   })

   saveCover(book,req.body.cover)
   try {
    const newBook =  await book.save();
    res.redirect('books')
   } catch (error) {
    // if(book.coverImageName!=null){
    //     removeBookCover(book.coverImageName);
    // }
    renderNewPage(res,book,true)
   }
})
router.put('/:id' ,async (req,res)=>{
   let book;
   try{
    book = await Book.findById(req.params.id)
    book.title = req.body.title;
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if(req.body.cove!=null && req.body.cover != ''){
        saveCover(book,req.body.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
   } catch (error) {
    console.log(error)
    if(book!=null){
        renderEditPage(res,book,true)
    }else{
        redirect('/')
    }
   }
})
router.delete('/:id' ,async (req,res)=>{
    let book;
    try {
        book = await Book.findById(req.params.id)
        await book.deleteOne()
        res.redirect('/books')
    } catch (error) {
        if(book!= null) res.redirect('/books/show',{
            book:book,
            errorMessage: 'Could not remove book'
        })
        else{
            res.redirect('/')
        }
    }
 })
// function removeBookCover(fileName){
//     fs.unlink(path.join(upload,fileName),err=>{
//         if(err) console.log(err);
//     })
// }

router.get('/:id',async (req,res)=>{
    try {
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show',{book:book})
    } catch (error) {
        res.redirect('/')
    }
})
router.get('/:id/edit',async (req,res)=>{
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res,book);
    } catch (error) {
        res.redirect('/')
    }
})
async function renderNewPage(res,book,hasError = false){
    renderFormPage(res,book,'new',hasError)
}
async function renderEditPage(res,book,hasError = false){
    renderFormPage(res,book,'edit',hasError)
}
async function renderFormPage(res,book,form,hasError = false){
    try {
        const authors = await Author.find({});
        const params = {
            authors:authors,
            book:book
        }
        if(hasError){
            if(form ==='edit'){
                params.errorMessage = 'Error updating Book'
            }else{
                params.errorMessage = 'Error creating Book'
            }
        }

        res.render(`books/${form}`,params)
    } catch (error) {
        res.redirect('/books');
    }
}
               
function saveCover(book,bookCover){
    if(bookCover== null) return;
    const cover = JSON.parse(bookCover);
    if(cover!=null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data,'base64')
        book.coverImageType = cover.type
    }
}
module.exports = router;