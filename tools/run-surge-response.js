#!/usr/bin/env node

/**
 * Minimal Surge/Quantumult X response-script harness for local testing.
 *
 * Usage:
 *   node tools/run-surge-response.js path/to/script.js path/to/input.json [--output path/to/output.json]
 *
 * The script emulates the $response/$done contract, runs the given Surge
 * response script, then prints the resulting body or writes it to the output
 * file when requested.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function printUsageAndExit(message, exitCode = 1) {
  if (message) {
    console.error(message);
  }
  console.error('Usage: node tools/run-surge-response.js <script.js> <input.json> [--output <output.json>]');
  process.exit(exitCode);
}

function resolveExistingFile(targetPath, label) {
  const abs = path.resolve(process.cwd(), targetPath);
  if (!fs.existsSync(abs)) {
    printUsageAndExit(`Cannot find ${label} file: ${targetPath}`);
  }
  return abs;
}

const argv = process.argv.slice(2);
if (argv.length < 2) {
  printUsageAndExit();
}

const outputFlagIndex = argv.indexOf('--output');
let outputPath = null;
if (outputFlagIndex !== -1) {
  if (outputFlagIndex === argv.length - 1) {
    printUsageAndExit('Expected a file path after --output');
  }
  outputPath = path.resolve(process.cwd(), argv[outputFlagIndex + 1]);
  argv.splice(outputFlagIndex, 2);
}

const [scriptPath, inputJsonPath] = argv;
const scriptFile = resolveExistingFile(scriptPath, 'script');
const jsonFile = resolveExistingFile(inputJsonPath, 'input JSON');

const scriptCode = fs.readFileSync(scriptFile, 'utf8');
const inputBody = fs.readFileSync(jsonFile, 'utf8');

let resultBody = null;
let doneCalled = false;

const context = {
  console,
  $environment: 'node',
  $response: { body: inputBody },
  $done: function done(payload) {
    doneCalled = true;
    if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'body')) {
      resultBody = String(payload.body);
    } else {
      resultBody = inputBody;
    }
  },
  $notify: function notify(title, subtitle, message) {
    const parts = [title, subtitle, message].filter(Boolean);
    if (parts.length) {
      console.log('[notify]', parts.join(' - '));
    }
  },
  $prefs: {
    valueForKey() { return null; },
    setValueForKey() { return false; },
  },
  $persistentStore: {
    read() { return null; },
    write() { return false; },
  },
  $task: {
    fetch() {
      throw new Error('$task.fetch is not implemented in the local harness');
    },
  },
};

const sandbox = vm.createContext(context);

const wrappedCode = `(async function () {\n${scriptCode}\n}).call(this);`;

try {
  vm.runInContext(wrappedCode, sandbox, { filename: scriptFile });
  if (!doneCalled) {
    console.error('Warning: script did not call $done(). Using original body.');
    resultBody = inputBody;
  }
  if (outputPath) {
    fs.writeFileSync(outputPath, resultBody, 'utf8');
    console.log(`Modified body written to ${outputPath}`);
  } else {
    process.stdout.write(resultBody);
  }
} catch (err) {
  console.error(`Error executing script: ${err.message}`);
  process.exit(1);
}
