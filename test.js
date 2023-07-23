// Your CSV data (replace this with your actual CSV data)
const csvData = `date,Country A,Country B,Country C
2023-07-01,50,45,65
2023-07-02,53,48,60
2023-07-03,55,50,68
2023-07-04,60,55,72
2023-07-05,57,52,70`;

// Function to parse CSV data into an array of objects
function parseCSV(data) {
  const rows = data.trim().split('\n');
  const headers = rows.shift().split('\t');
  const result = [];

  rows.forEach(row => {
    const values = row.split('\t');
    const item = { date: values[0] };
    for (let i = 1; i < headers.length; i++) {
      item[headers[i]] = +values[i]; // Convert to numeric value
    }
    result.push(item);
  });

  return result;
}

// Function to draw the line chart for the selected country
function drawLineChart(data, country) {
  const margin = { top: 20, right: 30, bottom: 30, left: 50 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select('#chartContainer')
    .html('') // Clear previous chart, if any
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => new Date(d.date)))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[country])])
    .range([height, 0]);

  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);

  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  svg.append('g')
    .call(yAxis);

  const line = d3.line()
    .x(d => x(new Date(d.date)))
    .y(d => y(d[country]));

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .attr('d', line);
}

document.addEventListener('DOMContentLoaded', () => {
  const data = parseCSV(csvData);

  const countrySelect = document.getElementById('countrySelect');
  const countries = Object.keys(data[0]).slice(1); // Get country names from the header
  countries.forEach(country => {
    const option = document.createElement('option');
    option.text = country;
    countrySelect.appendChild(option);
  });

  countrySelect.addEventListener('change', () => {
    const selectedCountry = countrySelect.value;
    drawLineChart(data, selectedCountry);
  });

  // Draw the initial line chart with the first country
  drawLineChart(data, countries[0]);
});
