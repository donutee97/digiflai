const mongoose = require("mongoose");

async function connectMongo(){

await mongoose.connect(process.env.MONGO_URL);

console.log("Mongo conectado");

}

module.exports=connectMongo;
