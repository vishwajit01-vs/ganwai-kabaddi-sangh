require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const membershipRoutes = require("./routes/membershipRoutes");
const accountRoutes = require("./routes/accountRoutes");
const adminRoutes = require("./routes/adminRoutes");
const tournamentRoutes = require("./routes/tournamentRoutes");
const teamRoutes = require("./routes/teamRoutes");
const matchRoutes = require("./routes/matchRoutes");

const app = express();

const PORT = process.env.PORT || 5000;




// ================= MIDDLEWARE =================

app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/tournaments",tournamentRoutes);
app.use("/api/teams",teamRoutes);
app.use("/api/matches", matchRoutes);







// ================= CHECK FRONTEND FILE =================

console.log(
    "Membership file exists:",
    fs.existsSync(path.join(__dirname, "..", "membership-form.html"))
);


// ================= FRONTEND =================

app.use(express.static(path.join(__dirname, "..")));

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


// ================= MONGODB CONNECTION =================

connectDB();


// ================= MEMBERSHIP ROUTES =================

app.use("/api/membership", membershipRoutes);
app.use("/api/account", accountRoutes);


// ================= BASIC ROUTE =================

app.get("/", (req, res) => {
    res.send("Ganwai Kabaddi Sangh Backend is Running!");
});


// ================= MEMBERSHIP FORM =================

app.get("/membership-form.html", (req, res) => {
    console.log("MEMBERSHIP ROUTE HIT");
    res.send("Membership route is working!");
});

// ================= START SERVER =================

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});