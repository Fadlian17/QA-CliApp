#!/usr/bin/env node

'use strict';

const axios = require('axios');
const fs = require('fs');
const figlet = require('figlet');

// Extract command-line arguments
const args = process.argv.slice(2);

// Validate the number of arguments
if (args.length < 2) {
    console.error('Usage: node cli-api.js <method> <url> [data] [--output <filename>]');
    process.exit(1);
}

// Extract method, URL, and optional data
const method = args[0].toUpperCase();
const url = args[1];
let data = args[2] && !args[2].startsWith('--') ? JSON.parse(args[2]) : null;
let outputFile = null;

// Check for output file argument
const outputIndex = args.indexOf('--output');
if (outputIndex !== -1 && args[outputIndex + 1]) {
    outputFile = args[outputIndex + 1];
}

/**
 * Makes an HTTP request using the specified method, URL, and data.
 *
 * @param {string} method - The HTTP method (GET, POST, PUT, DELETE).
 * @param {string} url - The URL to send the request to.
 * @param {Object|null} data - The data to send with the request (for POST/PUT).
 */
async function makeRequest(method, url, data) {
    try {
        // Make the HTTP request using axios
        const response = await axios({
            method,
            url,
            data,
        });

        // Log the response status and data
        console.log('Status:', response.status);
        console.log('Data:', response.data);

        // Save response data to a file if outputFile is specified
        if (outputFile) {
            fs.writeFileSync(outputFile, JSON.stringify(response.data, null, 2));
            console.log(`Response data saved to ${outputFile}`);
        }
    } catch (error) {
        // Handle errors and log appropriate messages
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Display a welcome message using figlet
figlet('CLI API Tester', (err, data) => {
    if (err) {
        console.error('Something went wrong with figlet...');
        console.dir(err);
        return;
    }
    console.log(data);
    // Execute the request after displaying the welcome message
    makeRequest(method, url, data);
});
