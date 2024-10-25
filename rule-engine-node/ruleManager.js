const Node = require("./models/node");
const acorn = require("acorn");
const ATTRIBUTE_CATALOG = ["age", "department", "salary", "experience"];
class RuleManager {
  createRule(ruleString) {
    if (!ruleString || typeof ruleString !== "string") {
      throw new Error("Invalid rule string");
    }
    try {
      const root = this.parseRuleString(ruleString);
      return root.toDict(); // Convert to storable dictionary
    } catch (err) {
      throw new Error(`Error parsing rule: ${err.message}`);
    }
  }
  combineRules(ruleAsts) {
    // Use 'AND' as the default operator to combine rules
    let combinedAst = ruleAsts[0];
    for (let i = 1; i < ruleAsts.length; i++) {
      combinedAst = new Node("operator", "AND", combinedAst, ruleAsts[i]);
    }
    return combinedAst;
  }
  modifyRule(ruleAst, modifications) {
    // Apply modifications to the rule AST
    for (let mod of modifications) {
      if (mod.action === "update") {
        // Example: Update a node's value
        let node = this.findNode(ruleAst, mod.path);
        if (node) node.value = mod.newValue;
      }
      // Add more actions like 'add', 'remove', etc.
    }
    return ruleAst;
  }

  findNode(node, path) {
    // Utility function to find a node in the AST based on a path
    if (path.length === 0) return node;
    const [next, ...rest] = path;
    if (next === "left") return this.findNode(node.left, rest);
    if (next === "right") return this.findNode(node.right, rest);
    return null;
  }
  parseRuleString(ruleString) {
    // Set ecmaVersion explicitly
    const tree = acorn.parseExpressionAt(ruleString, 0, { ecmaVersion: 2020 });
    return this.buildAst(tree);
}

  buildAst(node) {
    if (node.type === "LogicalExpression") {
      const op = node.operator === "&&" ? "AND" : "OR";
      return new Node(
        "operator",
        op,
        this.buildAst(node.left),
        this.buildAst(node.right)
      );
    } else if (node.type === "BinaryExpression") {
      const field = node.left.name;
      const op = this.getOperator(node.operator);
      const value = node.right.value;
      return new Node("operand", `${field} ${op} ${value}`);
    } else {
      throw new Error("Unsupported operation in rule");
    }
  }

  getOperator(operator) {
    switch (operator) {
      case ">":
        return "Gt";
      case "<":
        return "Lt";
      case "===":
        return "Eq";
      default:
        throw new Error("Unsupported operator");
    }
  }

  isValidAttribute(attribute) {
    return ATTRIBUTE_CATALOG.includes(attribute);
  }

  evaluateRule(ruleAst, data) {
    const isValid = this.validateAttributes(ruleAst);
    if (!isValid) {
      throw new Error("Invalid attributes in rule");
    }
    return this.evaluateNode(Node.fromDict(ruleAst), data);
  }
  validateAttributes(node) {
    if (node.type === 'operand') {
        const [field] = node.value.split(' ');
        return this.isValidAttribute(field);
    }
    const leftValid = node.left ? this.validateAttributes(node.left) : true;
    const rightValid = node.right ? this.validateAttributes(node.right) : true;
    return leftValid && rightValid;
}
  evaluateNode(node, data) {
    if (node.type === "operator") {
      const leftResult = this.evaluateNode(node.left, data);
      const rightResult = this.evaluateNode(node.right, data);
      return node.value === "AND"
        ? leftResult && rightResult
        : leftResult || rightResult;
    } else if (node.type === "operand") {
      const [field, op, value] = node.value.split(" ");
      const fieldValue = data[field];
      switch (op) {
        case "Gt":
          return fieldValue > parseInt(value);
        case "Lt":
          return fieldValue < parseInt(value);
        case "Eq":
          return fieldValue === value;
        default:
          return false;
      }
    }
    return false;
  }
}

module.exports = { RuleManager };
