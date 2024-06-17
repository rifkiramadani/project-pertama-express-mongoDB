const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const port = 3000;

//mengimport file errorHandler
const errorHandler = require('./errorHandler');

// MODELS //panggil model yang telah di exports
const Product = require("./models/product");

//Koneksi ke mongoDB dengan database shop_db
mongoose.connect('mongodb://127.0.0.1:27017/shop_db').then((result) => {
    console.log("Connected to ShopApp Database");
}).catch((err) => {
    console.log(err)
})

//mengaktifkan templating ejs
app.set("view engine", "ejs");

//mengaktifkan urlencoded agar body.request dapat di ambil oleh express
app.use(express.urlencoded({extended: true}));

//mengaktifkan method override
app.use(methodOverride("_method"));

//membuat blueprint untuk try and catch handling error
function wrapAsync(fn) {
    return function(req,res,next) {
        fn(req,res,next).catch(err => next(err))
    }
}

//ROUTE
app.get('/', (req,res) => {
    res.send("Terhubung cik");
})

//Route untuk menampilkan product
app.get('/product', async (req,res) => {
    //menampilkan category jika category ada atau benar
    const {category} = req.query;
    if(category) {
        const products = await Product.find({category})
        res.render("products/index.ejs", {
            products: products,
            category: category
        })
    } else {
        //Cara Pertama menggunakan functon async await
        const products = await Product.find({});
        res.render("products/index.ejs", {
            products: products,
            category: "All"
        });
    }
    
    //Cara Kedua menggunakan then and catch
    // Product.find({}).then((products) => {
    //     res.render("products/index.ejs", {
    //         products: products
    //     });
    // }).catch((err) => {
    //     console.log(err)
    // })
});

//Route untuk menampilkan form input atau create
app.get("/product/create", (req,res) => {
    throw new errorHandler("This is custom error", 503);
    // res.render("products/create.ejs");
})

//Route untuk simpan data yang telah di input
app.post("/product", async (req,res) => {
    const product = new Product(req.body);
    await product.save()
    res.redirect(`/product/${product.id}`);
})

//Route untuk menampilkan detail product cara pertama menggunakan function wrapAsync yang telah di buat di atas
app.get("/product/:id", wrapAsync(async (req,res,next) => {
        const {id} = req.params
        const product = await Product.findById(id);
        res.render("products/show.ejs", {
            product: product
        });
}));

//Route untuk menampilkan detail product cara kedua yang menggunakan try and catch secara langsung
// app.get("/product/:id", async (req,res,next) => {
//     //menggunakan try and catch untuk menampilkan error handler
//     //jikalau benar, lanjutkan proses
//     try {
//         const {id} = req.params
//         const product = await Product.findById(id);
//         res.render("products/show.ejs", {
//             product: product
//         });
//     //jikalau gagal lanjutkan atau next ke route errorHandler di paling bawah
//     } catch (error) {
//         next(new errorHandler("Produk tidak di temukan", 404))
//     }
// });

//Route untuk menampilkan halaman edit
app.get("/product/:id/edit", wrapAsync(async (req,res,next) => {
        const {id} = req.params
        const product = await Product.findById(id);
        res.render("products/edit.ejs", {
            product: product
        });
}));

//Route untuk update produk
app.put("/product/:id", wrapAsync(async (req,res,next) => {
        const {id} = req.params
        const product = await Product.findByIdAndUpdate(id, req.body, {runValidators: true});
        res.redirect(`/product/${product.id}`)
}))

//Route untuk delete produk
app.delete("/product/:id", wrapAsync(async (req,res) => {
    const {id} = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect("/product");
}))

app.use((err,req,res,next) => {
    console.dir(err)
    next(err);
})

//mengisi value dari class errorHandler
app.use((err,req,res,next) => {
    //value default
    const {status = 500, message = "Something went wrong"} = err;
    //ini yang akan di isi nantinya
    res.status(status).send(`Produk Tidak Di temukan : ${message}`);
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})