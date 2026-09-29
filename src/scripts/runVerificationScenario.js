const { runTestScenario } = require('../../dist/scripts/testScenario');

runTestScenario()
  .then((success) => {
    if (success) {
      console.log('Test Scenario finished cleanly.');
      process.exit(0);
    } else {
      console.error('Test Scenario failed.');
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Execution error:', err);
    process.exit(1);
  });
