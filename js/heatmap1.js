const cellSize = 50;                                 // Size of cells, good for changing whole grid size
const fillSize = cellSize * Math.sqrt(fillArea);
const fillOffset = (cellSize - fillSize) / 2;

// attaches variables to each row
function prepareData(data) {
  data.forEach(d => {
    const { year, month } = parseYearMonth(d.date);
    d.year = year;
    d.month = month;
    d.max_temperature = +d.max_temperature;
    d.min_temperature = +d.min_temperature;
  });
  return data;
}

// builds x and y scales
function buildScales(years) {
  const x = d3.scaleBand().domain(years).range([0, years.length * cellSize]);
  const y = d3.scaleBand().domain(d3.range(12)).range([0, months.length * cellSize]);
  const yMonths = d3.scaleBand().domain(months).range([0, months.length * cellSize]);
  return { x, y, yMonths };
}

// creates the correctly sized svg
function createSvg(years) {
  const width = margin.left + margin.right + years.length * cellSize + legendWidth;
  const height = margin.top + margin.bottom + months.length * cellSize;

  const svg = d3.select("#chart")
    .attr("width", width)
    .attr("height", height);

  return svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
}

// main function
function render(data) {
  prepareData(data);

  const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);
  const grid = computeMonthlyExtremes(data);

  const { x, y, yMonths } = buildScales(years);
  const g = createSvg(years);

  drawAxes(g, x, yMonths);

  let field = "maxTemp";
  drawCells(g, grid, x, y, buildColorScale(grid, field), field, fillSize, fillSize, fillOffset, fillOffset, "#tooltip");
  drawLegend(g, years.length * cellSize + 20);

  d3.select("#toggle-btn").on("click", () => {
    field = field === "maxTemp" ? "minTemp" : "maxTemp";
    d3.select("#toggle-btn").text(field === "maxTemp" ? "Show Min Temp" : "Show Max Temp");
    g.selectAll("rect.cell")
      .attr("fill", d => buildColorScale(grid, field)(d[field]));
  });
}

