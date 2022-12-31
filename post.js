var mongoose = require('mongoose')
var schema = mongoose.Schema

var postSchema = new schema({
    Titulo:String,
    imagem:String,
    categoria:String,
    conteudo:String,
    slug:String,
    autor:String,
    views:Number
}, {collection: 'post'})

var Posts = mongoose.model('Posts', postSchema)

module.exports = Posts