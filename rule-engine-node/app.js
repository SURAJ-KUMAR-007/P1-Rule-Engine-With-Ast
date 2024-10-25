// const express = require("express");
// const mongoose = require("mongoose");
// const { MongoClient, ServerApiVersion } = require("mongodb");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const { RuleManager } = require("./ruleManager");

// const app = express();
// app.use(bodyParser.json());
// app.use(cors());
// require("dotenv").config();
// // Connect to MongoDB

// const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ucxmd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//     connectTimeoutMS: 30000,

//     socketTimeoutMS: 30000, // 30 seconds
//   },
// });

// async function connectToMongoDB() {
//   try {
//     await client.connect();
//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } catch (err) {
//     console.error("Failed to connect to MongoDB:", err);
//   }
// }

// connectToMongoDB();
// //
// const testSchema = new mongoose.Schema({ name: String });
// const Test = mongoose.model('Test', testSchema);

// const testDocument = new Test({ name: 'Sample Test' });

// testDocument.save()
//   .then(doc => {
//     console.log('Test document saved:', doc);
//     mongoose.connection.close();
//   })
//   .catch(err => console.error('Save error:', err));
// //
// const ruleManager = new RuleManager();
// const Rule = mongoose.model(
//   "Rule",
//   new mongoose.Schema({
//     type: String,
//     value: String,
//     left: Object,
//     right: Object,
//   })
// );

// app.post("/api/create_rule", async (req, res) => {
//   console.log("Received request to create rule");

//   const ruleString = req.body.rule;
//   if (!ruleString) {
//     console.log("Rule string is missing");
//     return res.status(400).json({ error: "Rule string is required" });
//   }

//   try {
//     console.log("Creating AST for the rule");
//     const ruleAst = ruleManager.createRule(ruleString);
//     console.log("AST created:", ruleAst);

//     const rule = new Rule(ruleAst);
//     console.log("Saving rule to database");

//     const savedRule = await rule.save();
//     console.log("Rule saved:", savedRule);

//     return res
//       .status(201)
//       .json({ message: "Rule created successfully", rule_id: savedRule._id });
//   } catch (err) {
//     console.error("Error in create_rule:", err);
//     return res.status(500).json({ error: err.message });
//   }
// });

// app.post("/api/evaluate_rule", async (req, res) => {
//   const { rule_id, data } = req.body;
//   if (!rule_id || !data) {
//     return res.status(400).json({ error: "rule_id and data are required" });
//   }
//   try {
//     const ruleAst = await Rule.findById(rule_id);
//     if (!ruleAst) {
//       return res.status(404).json({ error: "Rule not found" });
//     }
//     const result = ruleManager.evaluateRule(ruleAst, data);
//     return res.status(200).json({ result });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// });
// app.post("/api/combine_rules", async (req, res) => {
//   const { rule_ids } = req.body;
//   if (!rule_ids || !Array.isArray(rule_ids)) {
//     return res.status(400).json({ error: "rule_ids must be an array" });
//   }
//   try {
//     // Fetch the rules from MongoDB based on rule IDs
//     const ruleAsts = await Rule.find({ _id: { $in: rule_ids } });
//     if (ruleAsts.length !== rule_ids.length) {
//       return res.status(404).json({ error: "One or more rules not found" });
//     }

//     // Combine the rules into a single AST
//     const combinedAst = ruleManager.combineRules(ruleAsts);
//     return res.status(200).json({ combined_rule: combinedAst });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// });

// const port = 3000;
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

/* ------------------------------------ x ----------------------------------- */
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { RuleManager } = require("./ruleManager");

const app = express();
app.use(bodyParser.json());
app.use(cors());
require("dotenv").config();

// Define MongoDB URI
const uri = `mongodb+srv://${encodeURIComponent(
  process.env.DB_USERNAME
)}:${encodeURIComponent(process.env.DB_PASSWORD)}@cluster0.ucxmd.mongodb.net/${
  process.env.DB_NAME
}?retryWrites=true&w=majority`;

// Connect to MongoDB using Mongoose
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000, // Set higher connection timeout
    socketTimeoutMS: 30000, // Set higher socket timeout
  })
  .then(() => {
    console.log("Successfully connected to MongoDB using Mongoose");

    // Start the server only after connection is established
  const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

// RuleManager and Rules Schema
const ruleManager = new RuleManager();
const Rule = mongoose.model(
  "Rule",
  new mongoose.Schema({
    type: String,
    value: String,
    left: Object,
    right: Object,
  })
);

// Create Rule Endpoint
app.post("/api/create_rule", async (req, res) => {
  console.log("Received request to create rule");

  const ruleString = req.body.rule;
  if (!ruleString) {
    console.log("Rule string is missing");
    return res.status(400).json({ error: "Rule string is required" });
  }

  try {
    console.log("Creating AST for the rule");
    const ruleAst = ruleManager.createRule(ruleString);
    console.log("AST created:", ruleAst);

    const rule = new Rule(ruleAst);
    console.log("Saving rule to database");

    const savedRule = await rule.save();
    console.log("Rule saved:", savedRule);

    return res
      .status(201)
      .json({ message: "Rule created successfully", rule_id: savedRule._id });
  } catch (err) {
    console.error("Error in create_rule:", err);
    return res.status(500).json({ error: err.message });
  }
});
app.get("/api/get_rules", async (req, res) => {
    try {
      const rules = await Rule.find();
      return res.status(200).json({ rules });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  
// Evaluate Rule Endpoint
app.post("/api/evaluate_rule", async (req, res) => {
  const { rule_id, data } = req.body;
  if (!rule_id || !data) {
    return res.status(400).json({ error: "rule_id and data are required" });
  }
  try {
    const ruleAst = await Rule.findById(rule_id);
    if (!ruleAst) {
      return res.status(404).json({ error: "Rule not found" });
    }
    const result = ruleManager.evaluateRule(ruleAst, data);
    return res.status(200).json({ result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Combine Rules Endpoint
app.post("/api/combine_rules", async (req, res) => {
  const { rule_ids } = req.body;
  if (!rule_ids || !Array.isArray(rule_ids)) {
    return res.status(400).json({ error: "rule_ids must be an array" });
  }
  try {
    const ruleAsts = await Rule.find({ _id: { $in: rule_ids } });
    if (ruleAsts.length !== rule_ids.length) {
      return res.status(404).json({ error: "One or more rules not found" });
    }

    const combinedAst = ruleManager.combineRules(ruleAsts);
    return res.status(200).json({ combined_rule: combinedAst });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
