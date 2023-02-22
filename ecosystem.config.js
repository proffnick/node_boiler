module.exports = {
    apps : [{
      name   : "psa-logistics",
      script : "/home/ec2-user/apps/psa/index.js",
      watch: ["/home/ec2-user/apps/psa/package.json", "/home/ec2-user/apps/psa/middleware", "/home/ec2-user/apps/psa/model", "/home/ec2-user/apps/psa/routes", "/home/ec2-user/apps/psa/startup", "/home/ec2-user/apps/psa/db", "/home/ec2-user/apps/psa/config", "/home/ec2-user/apps/psa/index.js"],
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }, 
    {
        name: "new_orders",
        script: "/home/ec2-user/apps/psa/bin/new_orders.js",
        env: {
          NODE_ENV: "development",
        },
        env_production: {
          NODE_ENV: "production",
        }
    }
    ]
  }