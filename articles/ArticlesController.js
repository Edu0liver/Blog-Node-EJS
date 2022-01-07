const { request, response } = require('express');
const express = require('express');
const router = express.Router();
const Category = require("../categories/Category")
const Article = require("./Article");
const slugify = require('slugify')
const adminAuth = require("../middlewares/adminAuth")

router.get("/admin/articles", adminAuth, (request, response)=>{
    Article.findAll({
        include: [{model: Category}]
    }).then(articles=>{
        response.render("admin/articles/index", {articles: articles})
    })
})

router.get("/admin/articles/new", adminAuth, (request, response)=>{
    Category.findAll().then((categories)=>{
        response.render("admin/articles/new", {categories:categories})
    })
})

router.post("/articles/save", adminAuth, (request, response)=>{
    const title = request.body.title;
    const body = request.body.body;
    const category = request.body.category;

    Article.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId: category
    }).then(()=>{
        response.redirect('/admin/articles')
    })
})

router.get("/admin/articles/edit/:id", adminAuth, (request, response)=>{
    const id = request.params.id;

    if(isNaN(id)){
        response.redirect("/admin/articles")
    }

    Article.findByPk(id).then(article => {
        if(article != undefined){
            Category.findAll().then(categories=>{
                response.render("admin/articles/edit", {categories: categories, article: article})
            })
        }
        else{
            response.redirect("/admin/articles")
        }
    }).catch(e=>{
        response.redirect("/admin/articles")
    })
})

router.post("/articles/update", adminAuth, (request, response)=>{
    const id = request.body.id;
    const title = request.body.title;
    const body = request.body.body;
    const category = request.body.category;

    Article.update({title: title, slug: slugify(title), body: body, categoryId: category},{
        where: {
            id: id
        }}
    ).then(()=>{
        response.redirect("/admin/articles")
    }).catch(e=>{
        response.redirect("/")
    })
})

router.post("/articles/delete", adminAuth, (request, response)=>{
    const id = request.body.id;
    
    if(id != undefined){
        if(!isNaN(id)){
            Article.destroy({
                where: {
                    id: id
                }
            }).then(()=>{
                response.redirect("/admin/articles")
            })
        }
        else{
            response.redirect("/admin/articles")
        }
    }
    else{
        response.redirect("/admin/articles")
    }
})

router.get("/articles/page/:num", (request, response)=>{
    const page = request.params.num;
    let offset = 0;

    if(isNaN(page) || page == 1){
        offset = 0;
    }
    else{
        offset = (parseInt(page) - 1) * 4 ;
    }

    Article.findAndCountAll({
        limit: 4,
        offset: offset,
        order: [
            ["id","DESC"]
        ]

    }).then(articles=>{
        let next;

        if(offset + 4 >= articles.count){
            next = false;
        }
        else{
            next = true;
        }

        const result = {
            page: parseInt(page),
            next: next,
            articles: articles
        }

        Category.findAll().then(categories=>{
            response.render("admin/articles/page", {result: result, categories: categories})
        })
    })
})

module.exports = router;