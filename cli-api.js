#!/usr/bin/env node

'use strict';

const axios = require('axios');
const fs = require('fs');

const args = process.argv.slice(2);

if (args.length < 2) {
    console.error('Usage: node cliTester.js <method> <url> [data] [--output <filename>]');
    process.exit(1);
}

const method = args[0].toUpperCase();
const url = args[1];
let data = args[2] && !args[2].startsWith('--') ? JSON.parse(args[2]) : null;
let outputFile = null;

// Check for output file argument
const outputIndex = args.indexOf('--output');
if (outputIndex !== -1 && args[outputIndex + 1]) {
    outputFile = args[outputIndex + 1];
}

async function makeRequest(method, url, data) {
    try {
        const response = await axios({
            method,
            url,
            data,
        });

        console.log('Status:', response.status);
        console.log('Data:', response.data);

        if (outputFile) {
            fs.writeFileSync(outputFile, JSON.stringify(response.data, null, 2));
            console.log(`Response data saved to ${outputFile}`);
        }
    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

makeRequest(method, url, data);
