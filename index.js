const express = require('express');
const app = express();
 
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const axios = require('axios');
 
const io = new Server(server);
 
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
 
io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('on-chat', (data) => {
        io.emit('user-chat', data);
    });
});
 
server.listen(3000, () => {
    console.log('Listening on port 3000');
});
 
async function fetchBitcoinPrice() {
    try {
        // Call API to get Bitcoin price (CoinGecko API example)
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const price = response.data.bitcoin.usd; // Extract the price from API response
        return price;
    } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
        return null;
    }
}
 
async function broadcastBitcoinPrice() {
    let lastPrice = 0;
    while (true) {
        const price = await fetchBitcoinPrice();
        if (price !== null) {
            io.emit('bitcoin-price', { price });
            lastPrice = price;
        }
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Delay 10 second
    }
}
 
broadcastBitcoinPrice();