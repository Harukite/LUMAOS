import chalk from "chalk";
function generateTechStyle(name = "/") {
  return chalk.green(`
=========== Running WEB3 CLI ===========

  PROJECT: ${name} 🚀           

========================================      
  ⚡ CREATOR INFO ⚡                                                                 
  📍Author  : amzHaruki                               
  🐦Twitter : @amzHaruki
  💫GitHub  : https://github.com/amzHaruki
========================================

`);
}

export default generateTechStyle;
