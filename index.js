const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { request } = require("http");

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

// MongoDB setup
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.0cvs0uq.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let taskCollection; // 👈 declare properly

async function run() {
  try {
    await client.connect();
    const db = client.db("taskDB");
    taskCollection = db.collection("tasks");
    console.log("Connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

run().catch(console.dir);

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

//get
app.get("/allTask", async (req, res) => {
  try {
    const taskData = req.body;
    const result = await taskCollection.find().toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to get task" });
  }
});
//get
app.get("/todayTask", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const result = await taskCollection
      .find({
        date: today,
      })
      .toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to get task" });
  }
});
//get
app.get("/upcomingTask", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const result = await taskCollection
    .find({
      date: { $gt: today },
    })
    .toArray();

  res.send(result);
});

//post

app.post("/allTask", async (req, res) => {
  try {
    const taskData = req.body;
    const result = await taskCollection.insertOne(taskData);
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to insert task" });
  }
});
//patch

app.patch("/updateStatus/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const result = await taskCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: { status: status },
      },
    );
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to insert task" });
  }
});
//delete

app.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await taskCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    res.status(500).send({ error: "Failed to insert task" });
  }
});

// Start server
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });

module.exports = app;
