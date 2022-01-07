const { request, response } = require('express');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session')
const connection = require("./database/database.js");

const categoriesController = require("./categories/CategoriesController.js");
const articlesController = require("./articles/ArticlesController.js");
const usersController = require("./user/UsersController.js");

const Category = require("./categories/Category.js")
const Article = require("./articles/Article.js")
const User = require("./user/User.js")

const adminAuth = require("./middlewares/adminAuth")

//View Engine
app.set("view engine","ejs");

//Session
app.use(session({
    secret: "qualquercoisa",
    cookie: {
        maxAge: 30000000
    }
}))

//Static
app.use(express.static('public'));

//Body Parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Database
connection.authenticate()

//Routes
app.use("/", categoriesController);

app.use("/", articlesController);

app.use("/", usersController);

app.get("/", (request,response)=>{
    Article.findAll({
        order: [
            ["id","DESC"]
        ],
        limit: 4
    }).then(articles =>{
        Category.findAll().then(categories=>{
            response.render("index", {articles: articles, categories: categories})
        })
    })
})

app.get("/:slug", (request, response)=>{
    const slug = request.params.slug

    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article =>{
        if( article != undefined ){
            Category.findAll().then(categories=>{
                response.render("article", {article: article, categories: categories})
            })
            }
        else{
            response.redirect("/")
        }
    }).catch(e =>{
        response.redirect("/")
    })
})

app.get("/category/:slug", (request,response)=>{
    const slug = request.params.slug;

    Category.findOne({
        where: {
            slug: slug
        },
        include: [{model: Article}]
    }).then(category=>{
        if(category != undefined){
            Category.findAll().then(categories=>{
                response.render("index", {articles: category.articles, categories: categories})
            })
        }
        else{
            response.redirect("/")
        }
    }).catch( e=>{
        response.redirect("/");
    })
})

app.listen(3333);