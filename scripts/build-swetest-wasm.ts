import { execSync } from "node:child_process";
import { unlinkSync } from "node:fs";

try {
	console.log("[1/7]  🔨  Building Docker image for swetest...");
	// Build the Docker image.
	execSync("docker build -t swetest-latest -f ./docker/swetest-build/Dockerfile .");

	console.log("[2/7]  🐳  Creating Docker container to extract swetest.wasm...");
	// The `:` at the end of the command is just a "dummy command" and is necessary
	// to avoid an error when the container is created without a `CMD`.
	// Using `docker create` to grab the ID from the container without starting it.
  const containerId = execSync("docker create swetest-latest :").toString().trim();

	console.log("[3/7]  🔄  Copying swetest.wasm binary from Docker container...");
	// Copy the swetest tarball from the container to the host machine.
  execSync(`docker cp ${containerId}:/swetest.wasm.tar.gz ./swetest.wasm.tar.gz`);

	console.log("[4/7]  📤  Extracting swetest.wasm binary from Docker container...");
	// Extracting the swetest.wasm binary from the tarball.
	// This assumes that the tarball contain two files.
	// (swetest-latest.wasm and swetest-<commit-hash>.wasm)
	// Using -v flag to show the location of extracted files.
	const output = execSync("tar -xzvf swetest.wasm.tar.gz --overwrite");

	// The output of the tar command will contain the file names.
	// We will format the output to show the full path of the files.
	const fileLocations = output.toString()
		.split('\n')
		.filter(file => Boolean(file))
		.map(file => `✅  ${process.cwd()}/${file}`)
		.join('\n');

	console.log("[5/7]  📤  Extracting swetest.wasm binary from Docker container...");
	// Removing the tarball after extraction.
	unlinkSync("swetest.wasm.tar.gz");

	console.log("[6/7]  🧹  Removing no longer needed Docker container...");
	// Removing the container after extraction.
	execSync(`docker rm ${containerId}`);

  console.log("[7/7]  ✅  All done!\n");
  console.log("The swetest.wasm binary has been extracted successfully in the following locations: ");
	console.log(fileLocations);
} catch (err) {
  console.error("❌  Failed to extract swetest.wasm\n", err);
  process.exit(1);
}
