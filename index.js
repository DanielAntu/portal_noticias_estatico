const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const fileupload = require('express-fileupload')
const bodyParser = require('body-parser')
const fs = require('fs')

const app = express()

var session = require('express-session')

const Posts = require('./post.js')

mongoose.connect('mongodb+srv://root:5DGJvOk5tVYaCOJ4@cluster0.kkancrl.mongodb.net/dankicode?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true}).then(function(){
    console.log('conectado com sucesso')
}).catch(function(err){
    console.log(err.message)
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(fileupload({
    useTempFiles:true,
    tempFileDir:path.join(__dirname, 'temp')
}))

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.use('/public', express.static(path.join(__dirname, '/public')))
app.set('views', path.join(__dirname, '/pages'))

app.get('/', (req,res) => {
    if(req.query.busca == null) {
        Posts.find({}).sort({'_id':-1}).exec(function(err, posts) {
            //console.log(posts[0])
            posts = posts.map(function(val) {
                return {
                    Titulo:val.Titulo,
                    conteudo:val.conteudo,
                    descricaoCurta:val.conteudo.substring(0,100),
                    imagem:val.imagem,
                    slug:val.slug,
                    categoria:val.categoria
                }
            })

            Posts.find({}).sort({'views':-1}).exec(function(err, postsTop) {
                //console.log(posts[0])
                postsTop = postsTop.map(function(val) {
                    return {
                        Titulo:val.Titulo,
                        conteudo:val.conteudo,
                        descricaoCurta:val.conteudo.substring(0,100),
                        imagem:val.imagem,
                        slug:val.slug,
                        categoria:val.categoria,
                        views:val.views
                    }
                })
            res.render('home', {posts:posts, postsTop:postsTop})
        })
    })
    } else {
        Posts.find({Titulo: {$regex: req.query.busca, $options:"i"}}, function(err,posts){
            //console.log(posts)
            posts = posts.map(function(val) {
                return {
                    Titulo:val.Titulo,
                    conteudo:val.conteudo,
                    descricaoCurta:val.conteudo.substring(0,100),
                    imagem:val.imagem,
                    slug:val.slug,
                    categoria:val.categoria,
                    views:val.views
                }
            })
            res.render('busca', {posts:posts, contagem:posts.length})
        })
    }
})

app.get('/:slug', (req,res) => {
    Posts.findOneAndUpdate({slug:req.params.slug}, {$inc:{views:1}}, {new: true}, function(err, resposta){
        if (resposta != null) {
            Posts.find({}).sort({'views':-1}).exec(function(err, postsTop) {
                //console.log(posts[0])
                postsTop = postsTop.map(function(val) {
                    return {
                        Titulo:val.Titulo,
                        conteudo:val.conteudo,
                        descricaoCurta:val.conteudo.substring(0,100),
                        imagem:val.imagem,
                        slug:val.slug,
                        categoria:val.categoria,
                        views:val.views
                    }
                })

                res.render('single', {noticia:resposta, postsTop:postsTop})

            })
        }
    })
})

var usuarios = [
    {
        login: 'Daniel',
        senha: '1234'
    }
]

app.post('/admin/login', (req, res) => {
    usuarios.map(function(val){
        if (val.login == req.body.login && val.senha == req.body.senha) {
            req.session.login = 'guilherme'
        }
    })
    res.redirect('/admin/login')
})

app.post('/admin/cadastro', (req, res) => {
    
    let formato = req.files.arquivo.name.split('.')
    var imagem = ''

    if (formato[formato.length - 1] == "jpg") {
        imagem = new Date().getTime()+'.jpg'
        req.files.arquivo.mv(__dirname+'/public/imagens/'+imagem)
    } else {
        fs.unlinkSync(req.files.arquivo.tempFilePath)
    }

    Posts.create({
        Titulo:req.body.titulo_noticia,
        imagem:'http://localhost:5000/public/imagens'+imagem,
        categoria:'Nenhuma',
        conteudo:req.body.noticia,
        slug:req.body.slug,
        autor:'Admin',
        views:0
    })

    res.send('Cadastrado com sucesso!')
})

app.get('/admin/deletar/:id', (req, res) => {
    Posts.deleteOne({_id:req.params.id}).then(function(){
        res.redirect('/admin/login')
    })
})

app.get('/admin/login', (req, res) => {
    if (req.session.login == null) {
        res.render('admin-login')
    } else {
        Posts.find({}).sort({'views':-1}).exec(function(err, posts) {
            //console.log(posts[0])
            posts = posts.map(function(val) {
                return {
                    id: val._id,
                    Titulo:val.Titulo,
                    conteudo:val.conteudo,
                    descricaoCurta:val.conteudo.substring(0,100),
                    imagem:val.imagem,
                    slug:val.slug,
                    categoria:val.categoria,
                    views:val.views
                }
            })
        res.render('admin-painel', {posts:posts, posts:posts})
    })
    }
})

app.listen(5000, ()=>{
    console.log('server rodando!')
})