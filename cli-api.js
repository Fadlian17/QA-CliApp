#!/usr/bin/env node

'use strict';

const axios = require('axios');
const fs = require('fs');
const figlet = require('figlet');
const inquirer = require('inquirer');
const urlValidator = require('valid-url');

// Function to display help information
function displayHelp() {
    console.log(`
Usage: node cliTester.js [options]

Options:
  --help, -h       Show help information
  --method, -m     Specify the HTTP method (GET, POST, PUT, DELETE)
  --url, -u        Specify the URL for the request
  --data, -d       Specify the JSON data for POST/PUT requests
  --output, -o     Specify the output filename to save the response

Example:
  node cliTester.js --method GET --url https://api.example.com --output response.json
`);
    process.exit(0);
}

// Check for help argument
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    displayHelp();
}

/**
 * Prompts the user for input using inquirer.
 * @returns {Promise<Object>} A promise that resolves to an object containing user input.
 */
async function promptUser() {
    try {
        return await inquirer.prompt([
            {
                type: 'list',
                name: 'method',
                message: 'Choose the HTTP method:',
                choices: ['GET', 'POST', 'PUT', 'DELETE'],
            },
            {
                type: 'input',
                name: 'url',
                message: 'Enter the URL:',
                validate: (input) => {
                    // URL validation check
                    if (!urlValidator.isUri(input)) {
                        return 'Please enter a valid URL.';
                    }
                    return true;
                },
            },
            {
                type: 'input',
                name: 'data',
                message: 'Enter the JSON data (leave empty if not applicable):',
                validate: (input) => {
                    if (input.trim() === '') return true;
                    try {
                        JSON.parse(input); // Check if the input is valid JSON
                        return true;
                    } catch (e) {
                        return 'Invalid JSON format.';
                    }
                },
            },
            {
                type: 'input',
                name: 'outputFile',
                message: 'Enter the output filename (leave empty if not applicable):',
                default: '', // Default to an empty string if the user does not specify a file.
            },
        ]);
    } catch (error) {
        console.error('Error during user prompt:', error);
        process.exit(1);
    }
}

/**
 * Makes an HTTP request using the specified method, URL, and data.
 *
 * @param {string} method - The HTTP method (GET, POST, PUT, DELETE).
 * @param {string} url - The URL to send the request to.
 * @param {Object|null} data - The data to send with the request (for POST/PUT).
 * @param {string|null} outputFile - The filename to save the response data.
 */
async function makeRequest(method, url, data, outputFile) {
    try {
        // Make the HTTP request using axios
        const response = await axios({
            method,
            url,
            data: data ? JSON.parse(data) : null, // Only parse if data is provided
        });

        // Log the response status and data
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));

        // Save response data to a file if outputFile is specified
        if (outputFile) {
            fs.writeFileSync(outputFile, JSON.stringify(response.data, null, 2));
            console.log(`Response data saved to ${outputFile}`);
        }
    } catch (error) {
        // Handle errors and log appropriate messages
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Display a welcome message using figlet
figlet('CLI API Tester', async (err, data) => {
    if (err) {
        console.error('Something went wrong with figlet...');
        console.dir(err);
        return;
    }
    console.log(data);

    // Prompt the user for input
    const userInput = await promptUser();

    // Ensure URL and method are not empty
    if (!userInput.url || !userInput.method) {
        console.error('Both URL and HTTP method are required.');
        return;
    }

    // Execute the request with user input
    await makeRequest(userInput.method, userInput.url, userInput.data, userInput.outputFile);
});
