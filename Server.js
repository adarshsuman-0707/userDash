const express = require("express");
const dotenv = require("dotenv");
require("./database/db.js")
const User=require("./Model/userdata.js")
dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.set("view engine","ejs")
app.use(express.static('public'))

// More specific route FIRST
app.get("/search", (req, res) => {
  let { Name,last } = req.query;
  console.log(req.query);
  res.send(Name +" "+last);
});
app.get('/userDash',(req,res)=>{
  res.render('index');
})
// Param route LAST (catch-all)
app.get("/para/:param", (req, res) => {
  let par = req.params.param;
  console.log(par);
  res.send(par);
});
// Add new user
app.post("/user/api/addUser", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const findEmail = await User.findOne({ email });
    if (findEmail) {
      return res.status(400).render("getuser", { 
        error: "User already exists", 
        users: await User.find() // so page still loads with users
      });
    }

    // Create new user
    const newUser = new User({ name, email, password });
    await newUser.save();
    const users = await User.find();
    return res.status(201).render("getuser", { 
      message: "User created successfully", 
      users 
    });

  } catch (err) {
    return res.status(500).render("getuser", { 
      error: "Error creating user", 
      details: err.message 
    });
  }
});


// Get all users
app.get("/user/api/data", async (req, res) => {
  try {
    const data = await User.find();
    if (!data.length) {
      return res.status(404).json({ message: "No users found" });
    }
    res.json(data); // 👈 only users
  } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
});
// Show edit form with existing user data
app.get("/user/api/edit/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).render("getuser", { error: "User not found", users: await User.find() });
    }
    res.render("edituser", { user }); // render edituser.ejs with user data
  } catch (err) {
    res.status(500).render("getuser", { error: "Error fetching user", details: err.message });
  }
});

app.post("/user/api/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // await lagana zaruri hai
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, password },
      { new: true, runValidators: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const users=await User.find();
    res.render("getuser",{users});
  } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
});
app.get("/user/api/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    const users = await User.find();
    res.render("getuser", { message: "User deleted successfully", users });
  } catch (err) {
    res.status(500).render("getuser", { error: "Error deleting user", details: err.message });
  }
});

// app.delete("/user/api/delete/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
  

//     // await lagana zaruri hai
//     const deltedUser = await User.findByIdAndDelete(id);

//     if (!deltedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({ message: "User deleted successfully", user: deltedUser });
//   } catch (err) {
//     res.status(500).json({ error: "Something went wrong", details: err.message });
//   }
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
