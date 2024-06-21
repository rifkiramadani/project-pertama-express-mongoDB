const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const port = 3000;

//mengimport session dan session flash
const session = require('express-session');
const flash = require('connect-flash');

//mengimport file errorHandler
const errorHandler = require('./errorHandler');

// MODELS //panggil model yang telah di exports
const Product = require("./models/product");
const Garment = require("./models/garment");

//Koneksi ke mongoDB dengan database shop_db
mongoose.connect('mongodb://127.0.0.1:27017/shop_db').then((result) => {
    console.log("Connected to ShopApp Database");
}).catch((err) => {
    console.log(err)
})

//DEFINE MIDDLEWARE
//mengaktifkan templating ejs
app.set("view engine", "ejs");
//mengaktifkan urlencoded agar body.request dapat di ambil oleh express
app.use(express.urlencoded({extended: true}));
//mengaktifkan method override
app.use(methodOverride("_method"));
//mengaktifkan session
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
}))
//mengaktifkan session flash atau connect flash
app.use(flash());
//membuat middleware untuk variable global yang dimana agar session flash bisa di gunakan di seluruh halaaman atau tidak perlu mendeklarasikan nya satu persatu
app.use((req,res,next) => {
    //menggunakan res.locals agar bisa digunakan di semua route atau halaman
    res.locals.flash_message = req.flash('flash_message');
    next();
})


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

//ROUTE GARMENT
//Route untuk menmapilkan data garmennt
app.get('/garment', wrapAsync(async (req,res) => {
    const garment = await Garment.find({});
    res.render("garment/index.ejs", {
        garments: garment
    });
}));

//Route untuk menampilkan form input atau create garment
app.get('/garment/create', (req,res) => {
    res.render('garment/create.ejs');
})

//Route untuk menyimpan data garment
app.post('/garment', wrapAsync(async (req,res) => {
    const garment = new Garment(req.body);
    await garment.save();
    req.flash('flash_message', 'Berhasil Menambahkan Data Pabrik!');
    res.redirect('/garment');
}));

//Route untuk show detail garment
app.get('/garment/:id', wrapAsync(async (req,res) => {
    const {id} = req.params;
    const garment = await Garment.findById(id).populate('products');
    res.render('garment/show.ejs', {
        garment: garment
    })
}))

//Route untuk menampilkan form input data produk ke garment
app.get('/garment/:garment_id/product/create', wrapAsync(async(req,res) => {
    const {garment_id} = req.params;
    res.render('products/create',{
        garment_id
    });
}));

//Route untuk menyimpan data produk ke dalam garment
app.post('/garment/:garment_id/product', wrapAsync(async(req,res) => {
    const {garment_id} = req.params;
    const garment = await Garment.findById(garment_id);
    const product = new Product(req.body);
    garment.products.push(product);
    product.garment = garment;
    await garment.save();
    await product.save();
    res.redirect(`/garment/${garment_id}`);
}))

//Route untuk menghapus data garment
app.delete('/garment/:garment_id', wrapAsync(async (req,res) => {
    const {garment_id} = req.params;
    await Garment.findOneAndDelete({_id: garment_id});
    res.redirect('/garment');
}))


//ROUTE PRODUCT
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
        const product = await Product.findById(id).populate('garment');
        res.render("products/show.ejs", {
            product: product
        });
        // res.send(product)
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
    res.status(status).send(`${message}`);
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})