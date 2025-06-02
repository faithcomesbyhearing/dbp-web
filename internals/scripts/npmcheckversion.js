const { exec } = require('child_process');

exec('npm -v', (error, stdout) => {
	if (error) {
		console.error(`npm -v command failed: ${error.message}`);
		process.exit(1);
	}

	const npmVersion = parseFloat(stdout.trim());

	if (npmVersion < 9) {
		console.error('[ERROR: Bible.Is] You need npm version @>=9');
		process.exit(1);
	}

	console.log(`npm version: ${npmVersion}`);
});
