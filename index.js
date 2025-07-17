const express = require("express")
const app = express()
const path = require("path")
const fs = require("fs")
const PORT = 5000

const users = require("./users.json")
const usersPath = path.join(__dirname, "users.json")
app.use(express.json())

// get users from users.json
app.get("/users", (req, res , next) => {
    return res.status(200).json(users)
})


// add a new user 
app.post ("/user" , (req, res , next) => {
    const {name , age , email} = req.body
    if(!name || !age || !email){
        return res.status(400).json({message : "Please provide name , age and email"})
    }
    // check if user already exists
    const userExists = users.find(user => user.email === email);
    if(userExists){
        return res.status(400).json({message : "User already exists"})
    }
    else {
        const newUser = {
            id: users.length + 1,
            name,
            age,
            email
        }
        users.push(newUser)
        // write the new user to users.json
        fs.writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
            if(err) {
                return res.status(500).json({message: "Error writing to file"})
            }
            return res.status(201).json({message: "User added successfully"})
        })
    }
})

// update a user by id
app.patch("/user/:id", (req, res, next) => {
    const { id } = req.params;
    const { name, age, email } = req.body;

    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if(userIndex === -1) {
        return res.status(404).json({message: "User ID not found"});
    }

    if (name) users[userIndex].name = name;
    if (age) users[userIndex].age = age;
    if (email) users[userIndex].email = email;
    
    fs.writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
        if(err) {
            return res.status(500).json({message: "Error writing to file"});
        }
        if (name){
            return res.status(200).json({message: "User name updated successfully"});
        }
        if (age){
            return res.status(200).json({message: "User age updated successfully"});
        }
        if (email){
            return res.status(200).json({message: "User email updated successfully"});
        }
        if ((name && age && email) || (name && age) || (name && email) || (age && email)) {
            return res.status(200).json({message: "User updated successfully"});
        }
    });
});

// delete a user by id with request body or optional query params
app.delete("/user/:id", (req, res, next) => {
    const id = req.params.id || req.body.id;
    console.log(id);
    
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if(userIndex === -1) {
        return res.status(404).json({message: "User ID not found"});
    }
    
    users.splice(userIndex, 1);
    
    fs.writeFile(usersPath, JSON.stringify(users, null, 2), (err) => {
        if(err) {
            return res.status(500).json({message: "Error writing to file"});
        }
        return res.status(200).json({message: "User deleted successfully"});
    });
});

// get user by name from query params
app.get("/user/getByName", (req, res, next) => {
    const { name } = req.query;
    if (!name) {
        return res.status(400).json({message: "Please provide a name"});
    }
    const user = users.find(user => user.name === name );
    if (!user) {
        return res.status(404).json({message: "User name not found"});
    }
    return res.status(200).json(user);
});

// filter users by minimum age
app.get("/user/filter", (req, res, next) => {
    const { minAge } = req.query;
    if (!minAge) {
        return res.status(400).json({message: "Please provide a minimum age"});
    }
    const filteredUsers = users.filter(user => user.age >= parseInt(minAge));
    if (filteredUsers.length === 0) {
        return res.status(404).json({message: "No users found with the specified minimum age"});
    }
    return res.status(200).json(filteredUsers);
});

// get user by id
app.get("/user/:id", (req, res, next) => {
    const { id } = req.params;
    const user = users.find(user => user.id === parseInt(id));
    if (!user) {
        return res.status(404).json({message: "User ID not found"});
    }
    return res.status(200).json(user);
});


app.use((req , res , next)=>{
    return res.status(404).json({message : `URL ${req.originalUrl} not found `})
})
app.listen(PORT , ()=>{
    console.log(`server is running on port ${PORT} `);
})

