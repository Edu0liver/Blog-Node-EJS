const { request, response } = require('express');
const express = require('express');
const slugify = require('slugify');
const Category = require('./Category');
const router = express.Router();
const adminAuth = require("../middlewares/adminAuth")

router.get("/admin/categories", adminAuth, (request, response)=>{
    Category.findAll().then(categories=>{
        response.render("admin/categories/index", {categories: categories});
    })
});

router.get("/admin/categories/new", adminAuth, (request, response)=>{
    response.render("admin/categories/new");
});

router.post("/categories/save", adminAuth, (request, response)=>{
    const title = request.body.title;

    if(title != undefined){
        Category.create({
            title: title,
            slug: slugify(title)
        }).then(()=>{
            response.redirect("/admin/categories")
        })
    }
    else{
        response.redirect("/admin/categories/new")
    }
});

router.get("/admin/categories/edit/:id", adminAuth, (request, response)=>{
    const id = request.params.id;

    if(isNaN(id)){
        response.redirect("/admin/categories")
    }

    Category.findByPk(id).then(category => {
        if(category != undefined){
            response.render("admin/categories/edit", {category: category})
        }
        else{
            response.redirect("/admin/categories")
        }
    }).catch(e=>{
        response.redirect("/admin/categories")
    })
})

router.post("/categories/update", adminAuth, (request, response)=>{
    const id = request.body.id;
    const title = request.body.title

    Category.update({title: title, slug: slugify(title)},{
        where: {
            id: id
        }}
    ).then(()=>{
        response.redirect("/admin/categories")
    })
})

router.post("/categories/delete", adminAuth, (request, response)=>{
    const id = request.body.id;
    
    if(id != undefined){
        if(!isNaN(id)){
            Category.destroy({
                where: {
                    id: id
                }
            }).then(()=>{
                response.redirect("/admin/categories")
            })
        }
        else{
            response.redirect("/admin/categories")
        }
    }
    else{
        response.redirect("/admin/categories")
    }
})

module.exports = router;