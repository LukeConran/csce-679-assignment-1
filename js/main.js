// loads the shared dataset once and kicks off both charts
d3.csv("data/temperature_daily.csv").then(data => {
  render(data);
  render2(data);
});
