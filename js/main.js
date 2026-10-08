// loads the shared dataset once and draws both charts
d3.csv("data/temperature_daily.csv").then(data => {
  drawHeatmap({
    data,
    chartSelector: "#chart",
    tooltipSelector: "#tooltip",
    toggleBtnSelector: "#toggle-btn",
    cellWidth: 50,
    cellHeight: 50
  });

  drawHeatmap({
    data,
    chartSelector: "#chart2",
    tooltipSelector: "#tooltip2",
    toggleBtnSelector: "#toggle-btn2",
    cellWidth: 105,
    cellHeight: 70,
    startYear: 2008,
    endYear: 2017,
    sparklines: true
  });
});
