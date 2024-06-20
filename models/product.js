const mongoose = require('mongoose');

//membuat schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
	brand: {
        type: String,
        required: true
    },
	price: {
        type: Number,
        required: true,
        min: 0
    },
	color: {
        type: String,
        required: true
    },
	category: {
        type: String, 
        enum: ["Baju","Celana","Topi","Aksesoris","Jaket"],
        required: true,
    },
    garment: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Garment"
        }
    ] 
});

//membuat model dari productSchema
const Product = mongoose.model("Product", productSchema);

//exports supaya bisa dapat digunakan di halaman lain
module.exports = Product;