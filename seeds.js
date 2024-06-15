// CATATAN: Untuk membuat seed jangan lupa mengimport mongoose, model, dan koneksi ke database nya!!!
const mongoose = require('mongoose');

// MODELS //panggil model yang telah di exports
const Product = require("./models/product");

//Koneksi ke mongoDB dengan database shop_db
mongoose.connect('mongodb://127.0.0.1:27017/shop_db').then((result) => {
    console.log("Connected to ShopApp Database");
}).catch((err) => {
    console.log(err)
})

const seedProduct = ([
	{
		"name": "Kemeja Flanel",
		"brand": "Hollister",
		"price": 750000,
		"color": "biru muda",
		"category": "Baju",
	},
	{
		"name": "Celana Chino",
		"brand": "Levi's",
		"price": 900000,
		"color": "krem",
		"category": "Celana",
	},
	{
		"name": "Sweater",
		"brand": "Gap",
		"price": 650000,
		"color": "merah muda",
		"category": "Baju",
	},
	{
		"name": "Tas Ransel",
		"brand": "Herschel",
		"price": 1500000,
		"color": "biru",
		"category": "Aksesoris",
	},
	{
		"name": "Kacamata Aviator",
		"brand": "Ray-Ban",
		"price": 2000000,
		"color": "emas",
		"category": "Aksesoris",
	},
	{
		"name": "Baju Renang",
		"brand": "Speedo",
		"price": 500000,
		"color": "biru tua",
		"category": "Baju",
	},
	{
		"name": "Topi Baseball",
		"brand": "New Era",
		"price": 350000,
		"color": "hitam",
		"category": "Topi",
	},
	{
		"name": "Rompi",
		"brand": "Zara",
		"price": 850000,
		"color": "abu-abu",
		"category": "Baju",
	},
	{
		"name": "Jas",
		"brand": "Hugo Boss",
		"price": 4500000,
		"color": "hitam",
		"category": "Baju",
	},
])

//eksekusi seed di atas
Product.insertMany(seedProduct).then((result) => {
    console.log(result)
}).catch((err) => {
    console.log(err)
});

