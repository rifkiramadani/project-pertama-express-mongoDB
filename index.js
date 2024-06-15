const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/shop_db').then((result) => {
    console.log("Connected to ShopApp Database");
}).catch((err) => {
    console.log(err)
})

app.set("view engine", "ejs");

//ROUTE
app.get('/', (req,res) => {
    res.send("Terhubung cik");
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})