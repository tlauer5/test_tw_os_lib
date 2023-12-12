
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');

async function plot_data (data_from_website) {

    const data_ = extract_only_values(data_from_website); // Extrahierte Daten

    const width = 800;
    const height = 600;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });


    const combinedData = data_.flat();

    const labels = [];
    data_.forEach((dayData, dayIndex) => {
        dayData.forEach((_, hourIndex) => {
            labels.push(`Tag ${dayIndex + 1}`);
        });
    });

    const data = {
        labels: labels,
        datasets: [{
            label: 'Daten über mehrere Tage',
            data: combinedData,
            borderColor: 'blue',
            fill: false
        }]
    };

    const maxVal = Math.max(...combinedData);
    const minVal = Math.min(...combinedData);
    const padding = (maxVal - minVal) * 0.5;

    const config = {
        type: 'line',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: minVal - padding,
                    suggestedMax: maxVal + padding,
                },
                x: {
                    type: 'category',
                    labels: labels,
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: data_.length
                    }
                }
            }
        }
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(config);
    fs.writeFileSync('chart.png', imageBuffer);

}

function extract_only_values (data) {

    temperatur_as_string = []
    for (i = 0; i < data.length; i++) {
        temperatur_as_string.push(JSON.parse(data[i][1]));
    }
    return temperatur_as_string;

}


module.exports = {
    plot_data
}