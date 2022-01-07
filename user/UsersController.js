const { request, response } = require('express');
const express = require('express');
const router = express.Router();
const User = require("./User")
const bcrypt = require("bcryptjs")
const adminAuth = require("../middlewares/adminAuth")

router.get("/admin/users", adminAuth, (request,response)=>{
    User.findAll().then((users=>{
        response.render("admin/users/index", {users: users})
    }))
})

router.get("/admin/users/create", adminAuth, (request,response)=>{
    response.render("admin/users/create");
})

router.post("/users/create", adminAuth, (request,response)=>{
    const email = request.body.email;
    const password = request.body.password;
    
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    User.findOne({
        where: {
            email: email
        }
    }).then((user => {
        if(user === undefined){
            User.create({
                email: email,
                password: hash
            }).then(()=>{
                response.redirect("/login");
            }).catch((e)=>{
                response.redirect("/");
            })        
        }
        else{
            response.redirect("/admin/users/create")
        }
    }))

})

router.get("/login", adminAuth, (request,response)=>{
    response.render("admin/users/login")
})

router.post("/authenticate", (request,response)=>{
    const email = request.body.email;
    const password = request.body.password;

    User.findOne({
        where: {
            email: email
        }
    }).then((user)=>{
        if(user != undefined){
            const correct = bcrypt.compareSync(password, user.password);

            if(correct){
                request.session.user = {
                    id: user.id,
                    email: user.email
                }
                response.redirect("/admin/articles")
            }
            else{
                response.redirect("/login")
            }
        }
        else{
            response.redirect("/login")
        }
    })
})

router.get("/logout", (request, response)=>{
    request.session.user = undefined;
    response.redirect("/");
})


module.exports = router;