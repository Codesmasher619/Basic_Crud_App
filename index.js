
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require('method-override')
const Product = require("./models/product");
const AppError = require('./AppError') 



mongoose
    .connect("mongodb://localhost:27017/farmStand")
    .then(() => {
        console.log("Mongo connection open!!");
    })
    .catch((err) => {
        console.log(" Mongo connection error!");
        console.log(err);
    });
 
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))

app.get("/products", async (req, res) => {
    const products = await Product.find({});
    //console.log(products);
    res.render("products/index", { products });
});
 
app.get("/products/new", (req,res) => {
  
    res.render("products/new");
});
 
app.get("/products/:id", async (req, res,next) => {
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    if(!foundProduct){
        next(new AppError('resource not found',404))
    }
    res.render("products/show", { foundProduct });
});

app.post('/products',async (req,res) =>{
    const newProduct = new Product(req.body)
    await(newProduct.save());
    console.log(newProduct.id)
    res.redirect(`/products/${newProduct._id}`)
})


app.get("/products/:id/edit",async (req,res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit',{product});
});
 

app.put('/products/:id', async(req,res)=>{
    const {id} = req.params;
    const newProduct= await Product.findByIdAndUpdate(id, req.body,{runValidators: true,new: true})
    
    res.redirect(`/products/${id}`)
})

app.delete('/products/:id',async(req,res)=>{
    const {id}=req.params
 
    await Product.findByIdAndDelete(id);
    res.redirect('/products');
})


app.use((err,req,res,next)=>{
    const {status=500 , message='something went wrong'}=err;
    res.status(status).send(message)
})

app.listen(3000, () => {
    console.log("Listening on port 3000!");
});