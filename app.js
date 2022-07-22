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

let filteredCOVIDData;
let stateDeathsMapping = {};

const ColumnCOVIDDeath = "COVID-19 Deaths";
const ColumnTotalDeath = "Total Deaths";

let chosenDeathType;
let chosenSlide = 0;

let userSelected = {
	chosenDeathType: ColumnCOVIDDeath,
	chosenYear: "2020",
	chosenGender: "",
	chosenAgeGroup: "",
};

let slideInformation = {
	0: { left: "HAHAHAHAH", right: "UUHUHUHU", bottom: "UUHUHUHU" },
	1: { left: "ASASASASA", right: "DSDSDSDSD", bottom: "KMKMKMKK" },
	2: { left: "ZXXZXZXZX", right: "XZXZXZXZ", bottom: "OKOKKOKOK" },
	3: { left: "GHGHGHGHG", right: "POPOPOPP", bottom: "PLPLLPLP" },
	4: { left: "RTRTRTRTR", right: "BVBVBVBV", bottom: "GYGYYYGY" },
};

let svg = d3.select("#wrapper");
let tooltip = d3.select("#tooltip");

let stateColor;

let updateSlide = function (slideNumber) {
	chosenSlide = slideNumber;
	if (chosenSlide === 0) {
		userSelected.chosenYear = "2020";
		userSelected.chosenDeathType = ColumnTotalDeath;
	} else if (chosenSlide === 1) {
		userSelected.chosenYear = "2020";
		userSelected.chosenDeathType = ColumnCOVIDDeath;
	} else if (chosenSlide === 2) {
		userSelected.chosenYear = "2021";
		userSelected.chosenDeathType = ColumnTotalDeath;
	} else if (chosenSlide === 3) {
		userSelected.chosenYear = "2021";
		userSelected.chosenDeathType = ColumnCOVIDDeath;
	} else if (chosenSlide === 4) {
		userSelected.chosenYear = "2020";
		userSelected.chosenDeathType = ColumnCOVIDDeath;
	}
	renderChart();
};

let setInfo = function () {
	// get year and set in UI
	let yearContainer = document.getElementById("year-container");
	yearContainer.innerHTML = "";
	let h1 = document.createElement("h1");
	h1.innerHTML = userSelected.chosenYear;
	yearContainer.appendChild(h1);

	// get chosen slide and enable all slide buttons except that one
	let slideshowButtons = document.getElementsByClassName("slideshow-button");
	Array.from(slideshowButtons).forEach((element, index) => {
		index === chosenSlide
			? (element.disabled = true)
			: (element.disabled = false);
	});

	// set information
	let informationContainerLeft = document.getElementById("info-container-left");
	let informationContainerRight = document.getElementById(
		"info-container-right"
	);
	let informationContainerBottom = document.getElementById(
		"info-container-bottom"
	);

	informationContainerLeft.innerHTML = "<h3>Information:</h3>";
	informationContainerRight.innerHTML = "<h3>Other Information:</h3>";
	informationContainerBottom.innerHTML = "<h3>Some other Information:</h3>";
	let spanLeft = document.createElement("span");
	let spanRight = document.createElement("span");
	let spanBottom = document.createElement("span");
	spanLeft.innerHTML += slideInformation[chosenSlide].left;
	spanRight.innerHTML += slideInformation[chosenSlide].right;
	spanBottom.innerHTML += slideInformation[chosenSlide].bottom;
	informationContainerLeft.appendChild(spanLeft);
	informationContainerRight.appendChild(spanRight);
	informationContainerBottom.appendChild(spanBottom);
};

let setStateDeathsMapping = function () {
	for (let i = 0; i < filteredCOVIDData.length; i++) {
		let data = filteredCOVIDData[i];
		if (!stateDeathsMapping.hasOwnProperty(data["State"])) {
			let value = filteredCOVIDData
				.filter((d) => d["State"] === data["State"])
				.reduce((acc, object) => {
					return (
						acc +
						parseInt(
							object[userSelected.chosenDeathType] !== ""
								? object[userSelected.chosenDeathType]
								: "0"
						)
					);
				}, 0);
			stateDeathsMapping[data["State"]] = value;
		}
	}
};

let setFilteredData = function () {
	let data = JSON.parse(JSON.stringify(COVIDdata));
	data = data.filter(function (d) {
		return d["Year"] == userSelected.chosenYear;
	});
	filteredCOVIDData = data;
};

let setStateColor = function () {
	setStateDeathsMapping();
	const deathsList = Object.keys(stateDeathsMapping)
		.filter((state) => state !== "United States")
		.map((state) => stateDeathsMapping[state]);
	stateColor = d3
		.scaleLinear()
		.domain([Math.min(...deathsList) + 4000, Math.max(...deathsList)])
		.range(["white", "red"]);
};

let renderChart = function () {
	setFilteredData();
	setStateColor();
	setInfo();

	svg
		.selectAll("path")
		.data(statesData)
		.enter()
		.append("path")
		.attr("d", d3.geoPath())
		.attr("class", "state")
		.attr("fill", (stateDataItem) => {
			let id = stateDataItem["id"];
			let data = filteredCOVIDData.filter((e) => {
				return e["State"] === statesMapping[parseInt(id)];
			});
			let deaths = sumDeaths(data);
			return stateColor(deaths);
		})
		.attr(
			"data-state",
			(stateDataItem) => statesMapping[parseInt(stateDataItem.id)]
		)
		.attr("data-deaths", (stateDataItem) => {
			let id = stateDataItem["id"];
			let data = filteredCOVIDData.filter((e) => {
				return e["State"] === statesMapping[parseInt(id)];
			});
			return sumDeaths(data);
		})
		.on("mouseover", (stateDataItem) => {
			tooltip.transition().style("visibility", "visible");
			let id = stateDataItem.target.__data__["id"];
			let data = filteredCOVIDData.filter((e) => {
				return e["State"] === statesMapping[parseInt(id)];
			});
			let deaths = sumDeaths(data);
			tooltip.text(
				data[0]["State"] +
					" has " +
					deaths +
					" deaths in the Year " +
					userSelected.chosenYear
			);
			tooltip.attr("data-deaths", deaths);
		})
		.on("mouseout", (stateDataItem) => {
			tooltip.transition().style("visibility", "hidden");
		});
};

let sumDeaths = function (data) {
	let total = 0;
	for (let i = 0; i < data.length; i++) {
		if (data[i] && data[i][userSelected.chosenDeathType]) {
			total += parseInt(data[i][userSelected.chosenDeathType]);
		}
	}
	return total;
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
				renderChart();
			}
		});
	}
});
