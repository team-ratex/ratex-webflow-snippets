// On document ready
$(function () {
  // Configurations
  const CONTRACT_PROVIDER = 'https://mainnet.infura.io/';
  const CONTRACT_ADDRESS = '0x1474943300E182B35211E9Ee9B6a00Cd71584451';
  const CONTRACT_ABI = [
    {
      "constant": true,
      "inputs": [],
      "name": "allTokensSold",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ];
  const CONTRACT_TOKEN_CAP = 96000000;

  // -- DOM elements
  const PROGRESS_ELEMENT_ID = 'progress-bar';

  // -- Helper functions
  function convertToNumbersFromEthContractResult(result) {
    return parseInt((result / (10 ** 18)).toFixed(0), 10);
  }
  function roundToMaxDecimalPlaces(value, decimalPlaces) {
    return (Math.round(value * (10 ** decimalPlaces)) / (10 ** decimalPlaces));
  }

  if (Web3) {
    const web3 = new Web3(new Web3.providers.HttpProvider(CONTRACT_PROVIDER));
    const contractInstance = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    contractInstance.methods.allTokensSold().call(function (error, result) {
      if (!error) {
        const allTokensSold = convertToNumbersFromEthContractResult(result);
        const progressPercentage = roundToMaxDecimalPlaces((allTokensSold / CONTRACT_TOKEN_CAP), 3);

        // Set progress bar percentage
        const progressElement = document.getElementById(PROGRESS_ELEMENT_ID);
        progressElement.style.width = progressPercentage + '%';
      }
    });
  }
});
