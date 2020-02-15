const container = d3.select('.bar-container');
const barChart = britecharts.bar();
const recordsGraphDataUrl = document.getElementById('records-graph-url').value;

barChart
    .margin({left: 100})
    .height(400);

axios.get(recordsGraphDataUrl)
.then(r => {
    const barData = r.data;
    container.datum(barData).call(barChart);
})
.catch(e => {
    console.log(e);
});