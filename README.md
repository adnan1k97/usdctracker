# USDC Dashboard - Web3 Analytics

A modern, responsive dashboard for tracking USDC (USD Coin) balance on the Ethereum blockchain using the Etherscan API.

## Features

- 📊 **Real-time USDC Balance Tracking** - Fetches live data from Ethereum blockchain
- 📈 **Interactive Chart** - Visual representation of balance history
- 📋 **Raw Data Table** - Detailed information display
- 🔄 **Auto-refresh** - Updates every 15 seconds
- 🎨 **Modern Dark Theme** - Clean and responsive design
- ⚡ **Smooth Animations** - Loading states and transitions

## Technologies

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript
- Chart.js for data visualization
- Etherscan API

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd arcflow
```

2. Open `index.html` in your web browser

That's it! No build process or dependencies required.

## API Configuration

The dashboard uses the Etherscan API to fetch USDC balance. The contract address and API key are configured in `script.js`.

**Contract Address:** `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` (USDC)

## Project Structure

```
arcflow/
├── index.html      # Main HTML structure
├── styles.css      # Styling and responsive design
├── script.js       # API integration and dashboard logic
└── README.md       # Project documentation
```

## License

MIT License

