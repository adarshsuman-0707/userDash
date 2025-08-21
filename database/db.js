const mongoose=require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/users' ,{
   useNewUrlParser: true,
  useUnifiedTopology: true,}
)
  .then(() => console.log('Connected!')).catch(()=>{
    Console.log("Not CFonnected with database")
  });