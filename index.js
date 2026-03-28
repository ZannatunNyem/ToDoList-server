const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB URI
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.0cvs0uq.mongodb.net/?appName=Cluster0`;

// ✅ Cached variables (VERY IMPORTANT for Vercel)
let client;
let taskCollection;

// ✅ Proper DB connection function
async function connectDB() {
  if (taskCollection) {
    return taskCollection; // reuse existing connection
  }

  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();

  const db = client.db("taskDB");
  taskCollection = db.collection("tasks");

  console.log("✅ MongoDB Connected");

  return taskCollection;
}

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ✅ GET all tasks
app.get("/allTask", async (req, res) => {
  try {
    const collection = await connectDB();
    const result = await collection.find().toArray();
    res.send(result);
  } catch (err) {
    console.error("🔥 ERROR:", err); // 👈 IMPORTANT
    res.status(500).send({ error: err.message }); // 👈 show real error
  }
});

// ✅ GET today tasks
app.get("/todayTask", async (req, res) => {
  try {
    const collection = await connectDB();
    const today = new Date().toISOString().split("T")[0];

    const result = await collection.find({ date: today }).toArray();

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to get task" });
  }
});

// ✅ GET upcoming tasks
app.get("/upcomingTask", async (req, res) => {
  try {
    const collection = await connectDB();
    const today = new Date().toISOString().split("T")[0];

    const result = await collection.find({ date: { $gt: today } }).toArray();

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to get task" });
  }
});

// ✅ POST new task
app.post("/allTask", async (req, res) => {
  try {
    const collection = await connectDB();
    const taskData = req.body;

    const result = await collection.insertOne(taskData);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to insert task" });
  }
});

// ✅ PATCH update status
app.patch("/updateStatus/:id", async (req, res) => {
  try {
    const collection = await connectDB();
    const id = req.params.id;
    const { status } = req.body;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } },
    );

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to update task" });
  }
});

// ✅ DELETE task
app.delete("/delete/:id", async (req, res) => {
  try {
    const collection = await connectDB();
    const id = req.params.id;

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to delete task" });
  }
});

// ❌ DO NOT use app.listen() in Vercel
module.exports = app;
