const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 6001;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")("sk_test_51P4iHfAQzwMLbnNtUmqWhkGCAseQW91GKz0KmI01xkQY4nY3KSYhjKPy4d2kC29SPYEJm44zeWFyJ5T4Ul7u4zoh00MuCqbPvO");
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

//mongodb configuration using mongoose
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@demo-foodi-client.xsy4pne.mongodb.net/demo-foodi-client?retryWrites=true&w=majority`
  )
  .then(console.log("MongoDB Connected Successfully"))
  .catch((error) => console.log("Error connecting to MongoDB", error));
  
// jwt authentication
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1hr",
  });
  res.send({ token });
});

//   import routes here
const menuRoutes = require("./api/routes/menuRoutes");
const cartRoutes = require("./api/routes/cartRoutes");
const userRoutes = require("./api/routes/userRoutes");
const paymentRoutes = require("./api/routes/paymentRoutes");
app.use("/menu", menuRoutes);
app.use("/carts", cartRoutes);
app.use("/users", userRoutes);
app.use("/payments", paymentRoutes);

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { price } = req.body;
    const amount = price * 100; // Convert price to cents

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).send({ error: "Failed to create payment intent" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello Foodi Client Server!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
