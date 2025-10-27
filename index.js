const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();


app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true, cookie: { secure: false }}))

app.use("/customer/auth/*", function auth(req,res,next){
//Write the authenication mechanism here
if (req.session && req.session.authorization && req.session.authorization.accessToken) {
    const token = req.session.authorization.accessToken;

    const JWT_SECRET = "mySuperSecretKey";
    const jwt = require('jsonwebtoken');

jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
        return res.status(403).json({ message: "Invaild or expired token"});
    }
    req.user = decoded;
    next();
})
} else {
    return res.status(401).json({message: "User not logged in or missing access token "})
}
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
