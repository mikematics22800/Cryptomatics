# Cryptomatics

## Table of Contents
- [Description](#description)
- [Installation](#installation)
- [Node Packages](#node-packages)
- [License](#license)

## Description
A React app that displays real time data on the cryptocurrency exchange, including detailed information on the top 100 ranking coins in the market.

[![](./public/screenshot.png)](https://mikematics22800.github.io/Cryptomatics)

## Installation
Before you begin, you'll need an API key from [Coin Ranking](https://rapidapi.com/Coinranking/api/coinranking1/playground/apiendpoint_8e827dc1-e69a-4b92-af4a-654138659eba)

```bash
# Navigate to your desired directory
cd path/to/your/desired/directory
# Clone the repository
git clone https://github.com/mikematics22800/Cryptomatics
# Enter the project directory
cd Cryptomatics
# Install dependencies
npm i
# Create a .env file and add your API key
echo VITE_COIN_RANKING_API_KEY="$key" > .env
# Start the development server
npm run dev
```
After starting the development server, open http://localhost:5174/Cryptomatics in your browser to view the application.

## Node Packages
React | React Router | Vite | Tailwind CSS | Material UI | Chart.js 

## License
[![alt text](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
