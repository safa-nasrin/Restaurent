//require('dotenv').config(); //npm i dotenv
// Load environment variables
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv=require('dotenv').config()

const app = express();
app.use(cors());
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({ limit: '50mb', extended: true })); 
// Parse JSON bodies

const PORT = process.env.PORT || 8080

//mongodb connection
console.log(process.env.MONGODB_URL)
mongoose.set('strictQuery',false)
 mongoose.connect(process.env.MONGODB_URL)
 .then(()=>console.log("Connect to Database"))
 .catch((err)=>console.log(err))

//schema
const userSchema=mongoose.Schema({
    firstName: String,
    lastName: String,
    email:{
        type:String,
        unique: true,
    },
    password: String,
    confirmPassword: String,
    image: String,
})

//Model
const userModel= mongoose.model("user",userSchema)

//api
app.get("/", (req, res) => {
    res.send("Server is running");
});

//signup
app.post("/signup", async (req, res) => {
    console.log(req.body);  // This should now print the form data
    const { email } = req.body; // to check it is available in the database

    try {
        const result = await userModel.findOne({ email: email });
        if (result) {
            res.send({ message: "Email id is already registered",alert:false });
        } else {
            const data = new userModel(req.body);
            await data.save();
            res.send({ message: "Successfully signed up" ,alert:true});
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
       
});    
 
//api login
app.post("/login", async (req, res) => {
    const { email,password } = req.body; //which is coming from front-end side  //taking email which user gave
    try {
        const result = await userModel.findOne({ email: email });  //it is searching email is there or not
        if (result) {
            if(result.password===password){
            const dataSend = {
                _id: result._id,
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
                image: result.image,
            };
            console.log(dataSend); //it is not mandatory line.Hey, I found this user! Here’s all their info.”
            res.send({
                message: "Login successfully",
                alert: true,
                data:dataSend, //there will be show data when u enter email and password 
            });
        }
           else{
            res.send({
                message:"Incorrect password",
                alert:false,
            })
          }
        } else {
            res.send({
                message: "Email is not available, please sign up",
                alert: false,
            });
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send({ message: "Internal Server Error" });
    }
});


//product section
const schemaProduct = mongoose.Schema({
    name:String,
    category:String,
    image:String,
    price:String,
    description:String,
})
const productModel= mongoose.model("product",schemaProduct)
   

//save product in data
//api
app.post("/uploadProduct",async(req,res)=>{
    console.log(req.body)

    const data=await productModel(req.body)
    const datasave=await data.save()  //to save this data in server mongodb
    console.log(datasave)
    res.send({message:"upload succesfully"})
}) 

//
app.get("/product",async(req,res)=>{
    try {
    const data= await productModel.find({}) //to get all products in product list from backend which we sent 
   res.send(JSON.stringify(data)) //it will display in the product list
    }catch(error){
        console.error("Error fetching products:", error);
        res.status(500).send({ message: "Error fetching products" });
    }
})

//server is running
app.listen(PORT, () => {
    console.log(`Server is running at port: ${PORT}`);
});
// "react-redux": "^9.1.2", it using to connect data with all components
 