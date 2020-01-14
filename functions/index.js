const functions = require('firebase-functions');
const https = require('https');
const axios = require('axios');
const cors = require('cors')({origin: true});

/* --- --- OVERVIEW --- ---
   We are currently planning on using: https://financialmodelingprep.com/developer/docs/ for stock data
   This API is free and easy to ping.
*/

// This is a test function to verify usage and demonstrate basic usage of cloud functions.
exports.exampleFunction = functions.https.onRequest((request, response) => {

    // Anything that you log will go to the firebase log. This will be viewable on the dashboard when live, or on the command prompt when running locally
    console.log("This works");

    // This is needed to close the connection and tell the requesting device that the function is complete. Inside of the send, we can send any data! In this case, we are sending the data as json.
    response.status(200).json("Hello from Firebase!");
});

// This is a test function to demonstrate cloud functions with some sort of input.
exports.exampleFunctionWithInput = functions.https.onRequest((request, response) => {

    // Sometimes you want you functions to take input. This can be done with req.query.YOUR_VARIABLE_NAME
    // When doing so, it is very important to verify that the input is in whatever form you want it to be in.
    var userInput = String(request.query.someInput);

    // Anything that you log will go to the firebase log. This will be viewable on the dashboard when live, or on the command prompt when running locally
    console.log("This works, user input was:", userInput);

    // define userInput via -> /exampleFunctionWithInput?someInput=aa <= Note the query notation.
    if(userInput !== "undefined"){
    // This is needed to close the connection and tell the requesting device that the function is complete. Inside of the send, we can send any data! In this case, we are sending the data as json.
        response.status(200).json({
                                    hello:"Hello from Firebase!",
                                    input:userInput
                                });
    
    }
    else{
        response.status(400).json("Hello from Firebase! User input was not defined :(");
    }
});


// This is a function to get the past week's return data via the API.
exports.getPastWeekReturns = functions.https.onCall((data, context) => {

    return axios.get(
        'https://financialmodelingprep.com/api/company/historical-price/'+ data.ticker +'?serietype=line&serieformat=array&datatype=json'
    ).then((result) => {
        //console.log(result.data);
        return result.data.historical.splice(result.data.historical.length - 7);
    })

});

// This is a function to get the past month's return data via the API.
exports.getPastMonthReturns = functions.https.onCall((data, context) => {

    return axios.get(
        'https://financialmodelingprep.com/api/company/historical-price/'+ data.ticker +'?serietype=line&serieformat=array&datatype=json'
    ).then((result) => {
        //console.log(result.data);
        return result.data.historical.splice(result.data.historical.length - 20);
    })

});

// This is a function to get the past 6 months' return data via the API.
exports.getPastSixMonthReturns = functions.https.onCall((data, context) => {

    return axios.get(
        'https://financialmodelingprep.com/api/company/historical-price/'+ data.ticker +'?serietype=line&serieformat=array&datatype=json'
    ).then((result) => {
        //console.log(result.data);
        return result.data.historical.splice(result.data.historical.length - 120);
    })


});

// This is a function to get the past year's return data via the API.
exports.getPastYearReturns = functions.https.onCall((data, context) => {

    return axios.get(
        'https://financialmodelingprep.com/api/company/historical-price/'+ data.ticker +'?serietype=line&serieformat=array&datatype=json'
    ).then((result) => {
        //console.log(result.data);
        return result.data.historical.splice(result.data.historical.length - 240);
    })
});

// This is a function to get the past 3 year's return data via the API.
exports.getPastThreeYearReturns = functions.https.onCall((data, context)  => {

    return axios.get(
        'https://financialmodelingprep.com/api/company/historical-price/' + data.ticker + '?serietype=line&serieformat=array&datatype=json'
    ).then((result) => {
        //console.log(result.data);
         return result.data.historical.splice(result.data.historical.length - 720);
    })
});

// This is a function to get the past 5 year's return data via the API.
exports.getPastFiveYearReturns = functions.https.onCall((data, context) => {

    return axios.get(
        'https://financialmodelingprep.com/api/company/historical-price/' + data.ticker + '?serietype=line&serieformat=array&datatype=json'
    ).then((result) => {
        //console.log(result.data);
        return result.data.historical.splice(result.data.historical.length - 1200);
    })
});

// This is a function to get the companies profile
// Returns: mktCap, ceo, website, and description
exports.getCompanyProfile = functions.https.onCall((data, context)  => {


    // response.set('Access-Control-Allow-Methods', '*');
    // response.set('Access-Control-Allow-Headers', '*');

    // response.set('Access-Control-Allow-Origin', '*'); 

    console.log(data)
    return axios.get(
        `https://financialmodelingprep.com/api/company/profile/${data.ticker}`
    ).then((result) => {
        //console.log(result.data);
        var resultString = result.data.toString();
        //resultString = resultString.substr(5, resultString.length - 10);
        //var resultJSON = JSON.parse(resultString);

        return resultString;
    })



});

// function to get current ratios (current assets / current liabilties); ratio that can be < 1 or > 1
// current ratio is a measurement of liquidity
exports.getCurrentRatios = functions.https.onCall((data, context) => {

    return axios.get(
        `https://financialmodelingprep.com/api/financial-ratios/${data.ticker}`
    ).then((result) => {
        //console.log(result.data);
        var resultString = result.data.toString();
        resultString = resultString.substr(5, resultString.length - 10);
        var resultJSON = JSON.parse(resultString);

        var currentRatios = [];
        var dates = [];

        for (var key in resultJSON.financialRatios) {
            if (key === "TTM")
                continue;

                var cr = resultJSON.financialRatios[key].liquidityMeasurementRatios['currentRatio'];
                currentRatios.push(cr);
                // console.log(cr);

                dates.push(key);
        }

        var currentRatiosDates = [];
        currentRatiosDates.push(dates);
        currentRatiosDates.push(currentRatios);

        return currentRatiosDates;
    })

});


exports.getQuarterlyRevenue = functions.https.onCall((data, context) => {


    return axios.get(
        `https://financialmodelingprep.com/api/v3/financials/income-statement/${data.ticker}?period=quarter`
    ).then((result) => {
        var dates = [];
        var revenues = [];

        for (var key in result.data.financials) {
            var d = result.data.financials[key]['date'];
            dates.push(d);

            var r = result.data.financials[key]['Revenue'];
            revenues.push(r);
        }

        var currRevenuesDates = [];
        currRevenuesDates.push(dates);
        currRevenuesDates.push(revenues);

        return currRevenuesDates;
    })
      .catch((error) => {
        console.log('error');
      })
});

