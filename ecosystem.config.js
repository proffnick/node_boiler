module.exports = {
    apps : [{
      name   : "psa-logistics",
      script : "index.js",
      watch: ["package.json", "middleware", "model", "routes", "startup", "db", "config", "index.js"]
    }, 
    {
      name: "new_orders",
      script: "bin/new_orders.js"
    }
    ]
  }