let stateGeoJSONURL = "./US_geo.json";
let COVIDdataURL = "./Provisional_COVID-19_Deaths_by_Sex_and_Age.csv";
let statesMapping = {
	01: "Alabama",
	02: "Alaska",
	04: "Arizona",
	05: "Arkansas",
	06: "California",
	08: "Colorado",
	09: "Connecticut",
	10: "Delaware",
	12: "Florida",
	13: "Georgia",
	15: "Hawaii",
	16: "Idaho",
	17: "Illinois",
	18: "Indiana",
	19: "Iowa",
	20: "Kansas",
	21: "Kentucky",
	22: "Louisiana",
	23: "Maine",
	24: "Maryland",
	25: "Massachusetts",
	26: "Michigan",
	27: "Minnesota",
	28: "Mississippi",
	29: "Missouri",
	30: "Montana",
	31: "Nebraska",
	32: "Nevada",
	33: "New Hampshire",
	34: "New Jersey",
	35: "New Mexico",
	36: "New York",
	37: "North Carolina",
	38: "North Dakota",
	39: "Ohio",
	40: "Oklahoma",
	41: "Oregon",
	42: "Pennsylvania",
	44: "Rhode Island",
	45: "South Carolina",
	46: "South Dakota",
	47: "Tennessee",
	48: "Texas",
	49: "Utah",
	50: "Vermont",
	51: "Virginia",
	53: "Washington",
	54: "West Virginia",
	55: "Wisconsin",
	56: "Wyoming",
};

let statesData;
let COVIDdata;

let svg = d3.select("#wrapper");
var stateColor = d3.scaleLinear().domain([1, 99000]).range(["white", "red"]);
let tooltip = d3.select("#tooltip");

let draw = function () {
	svg
		.selectAll("path")
		.data(statesData)
		.enter()
		.append("path")
		.attr("d", d3.geoPath())
		.attr("class", "state")
		.attr("fill", (stateDataItem) => {
			let id = stateDataItem["id"];
			let data = COVIDdata.find((e) => {
				return e["State"] === statesMapping[parseInt(id)];
			});
			let deaths = data ? parseInt(data["COVID-19 Deaths"]) : 0;

			return stateColor(deaths);
		})
		.attr(
			"data-state",
			(stateDataItem) => statesMapping[parseInt(stateDataItem.id)]
		)
		.attr("data-deaths", (stateDataItem) => {
			let id = stateDataItem["id"];
			let data = COVIDdata.find((e) => {
				return e["State"] === statesMapping[parseInt(id)];
			});
			let deaths = data ? parseInt(data["COVID-19 Deaths"]) : 0;
			return deaths;
		})
		.on("mouseover", (stateDataItem) => {
			tooltip.transition().style("visibility", "visible");
			let id = stateDataItem.target.__data__["id"];
			let data = COVIDdata.find((e) => {
				return e["State"] === statesMapping[parseInt(id)];
			});

			tooltip.text(
				data["State"] + " has " + data["COVID-19 Deaths"] + " deaths."
			);
			tooltip.attr("data-deaths", data["COVID-19 Deaths"]);
		})
		.on("mouseout", (stateDataItem) => {
			tooltip.transition().style("visibility", "hidden");
		});
};

// read geojson for states and covid data from csv
d3.json(stateGeoJSONURL).then(function (data, err) {
	if (err) {
		console.log(err);
	} else {
		statesData = topojson.feature(data, data.objects.states).features;
		console.log(statesData);
		d3.csv(COVIDdataURL).then(function (data, err) {
			if (err) {
				console.log(err);
			} else {
				COVIDdata = data;
				console.log(COVIDdata);
				draw();
			}
		});
	}
});
