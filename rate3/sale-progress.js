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
  const PROGRESS_TEXT_ID = 'progress-percent';
  const PROGRESS_ELEMENT_ID = 'progress-bar';
  const PROGRESS_ELEMENT_ID_MOBILE = 'progress-bar-m';

  // -- Helper functions
  function convertToNumbersFromEthContractResult(result) {
    return parseInt((result / (10 ** 18)).toFixed(0), 10);
  }
  function roundToMaxDecimalPlaces(value, decimalPlaces) {
    return (Math.round(value * (10 ** decimalPlaces)) / (10 ** decimalPlaces));
  }
  function truncateToMaxDecimalPlaces(value, decimalPlaces) {
    return (Math.trunc(value * (10 ** decimalPlaces)) / (10 ** decimalPlaces));
  }

  if (Web3) {
    const web3 = new Web3(new Web3.providers.HttpProvider(CONTRACT_PROVIDER));
    const contractInstance = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    contractInstance.methods.allTokensSold().call(function (error, result) {
      if (!error) {
        const allTokensSold = convertToNumbersFromEthContractResult(result);
        let progressPercentage = (allTokensSold * 100) / CONTRACT_TOKEN_CAP;
        if (progressPercentage > 100) {
          progressPercentage = 100;
        }

        // Set progress bar percentage
        const barProgressPercentage = roundToMaxDecimalPlaces(progressPercentage, 3);
        const progressElement = document.getElementById(PROGRESS_ELEMENT_ID);
        if (progressElement) {
          progressElement.style.width = barProgressPercentage + '%';
        }
        const progressElementMobile = document.getElementById(PROGRESS_ELEMENT_ID_MOBILE);
        if (progressElementMobile) {
          progressElementMobile.style.width = barProgressPercentage + '%';
        }

        // Set progress text
        const ALL_TOKEN_CAP = 400000000;
        const PRIVATE_SALE_TOKEN_CAP = 224000000;
        const LEEKICO_TOKEN_CAP = 80000000;
        const textProgressPercentage = truncateToMaxDecimalPlaces(((PRIVATE_SALE_TOKEN_CAP + LEEKICO_TOKEN_CAP + allTokensSold) * 100) / ALL_TOKEN_CAP, 1);
        const progressTextElement = document.getElementById(PROGRESS_TEXT_ID);
        if (progressTextElement) {
          progressTextElement.innerText = textProgressPercentage + '% RTE tokens sold';
        }
      }
    });
  }
});
