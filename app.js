let stateGeoJSONURL = "./US_geo.json";
let deathsDataURL = "./Provisional_COVID-19_Deaths_by_Sex_and_Age.csv";
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
let deathsData;

let filteredData;
let stateDeathsMapping = {};

const ColumnCOVIDDeath = "COVID-19 Deaths";
const ColumnTotalDeath = "Total Deaths";
const ColumnPneumoniaDeath = "Pneumonia Deaths";
const ColumnInfluenzaDeath = "Influenza Deaths";

let chosenDeathType = ColumnCOVIDDeath;
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
let chartTooltip, leftGraphTooltip, rightGraphTooltip;

let mouseover, mouseleave, mousemove;
let leftMouseover, leftMouseleave, leftMousemove;
let rightMouseover, rightMouseleave, rightMousemove;

let stateColor;

let changeToNextSlide = function () {
	if (chosenSlide < 4) {
		chosenSlide += 1;
		updateSlide(chosenSlide);
	}
};

let changeToPrevSlide = function () {
	if (chosenSlide > 0) {
		chosenSlide -= 1;
		updateSlide(chosenSlide);
	}
};

let updateSlide = function (slideNumber) {
	chosenSlide = slideNumber;
	if (chosenSlide === 0) {
		userSelected.chosenYear = "2020";
		userSelected.chosenDeathType = ColumnCOVIDDeath;
	} else if (chosenSlide === 1) {
		userSelected.chosenYear = "2020";
		userSelected.chosenDeathType = ColumnInfluenzaDeath;
	} else if (chosenSlide === 2) {
		userSelected.chosenYear = "2021";
		userSelected.chosenDeathType = ColumnPneumoniaDeath;
	} else if (chosenSlide === 3) {
		userSelected.chosenYear = "2021";
		userSelected.chosenDeathType = ColumnTotalDeath;
	} else if (chosenSlide === 4) {
		userSelected.chosenYear = "2021";
		userSelected.chosenDeathType = ColumnCOVIDDeath;
	}
	renderPage();
};

let updateGraph = function (svg, x, y, height, data, column) {
	let u = svg.selectAll("rect").data(data);

	u.enter()
		.append("rect")
		.merge(u)
		.transition()
		.duration(1000)
		.attr("x", function (d) {
			return x(d[column]);
		})
		.attr("y", function (d) {
			return y(d[userSelected.chosenDeathType]);
		})
		.attr("width", x.bandwidth())
		.attr("height", function (d) {
			return height - y(d[userSelected.chosenDeathType]);
		});
};

let getFilteredDataByAge = function () {
	let temp = {};
	filteredData.forEach((d) => {
		if (temp.hasOwnProperty(d["Age Group"])) {
			temp[d["Age Group"]] +=
				d[userSelected.chosenDeathType] != ""
					? parseInt(d[userSelected.chosenDeathType])
					: 0;
		} else {
			temp[d["Age Group"]] =
				d[userSelected.chosenDeathType] != ""
					? parseInt(d[userSelected.chosenDeathType])
					: 0;
		}
	});

	let data = [];
	Object.keys(temp).forEach((field) => {
		if (field != "All Ages") {
			let tmp = {};
			tmp["Age Group"] = field;
			tmp[userSelected.chosenDeathType] = temp[field];
			data.push(tmp);
		}
	});
	return data;
};

let getFilteredDataBySex = function () {
	let maleTotal = 0;
	let femaleTotal = 0;
	filteredData.forEach((d) => {
		if (d.Sex === "Female") {
			femaleTotal +=
				d[userSelected.chosenDeathType] != ""
					? parseInt(d[userSelected.chosenDeathType])
					: 0;
		} else if (d.Sex === "Male") {
			maleTotal +=
				d[userSelected.chosenDeathType] != ""
					? parseInt(d[userSelected.chosenDeathType])
					: 0;
		}
	});

	let maleData = {};
	maleData["Sex"] = "Male";
	maleData[userSelected.chosenDeathType] = maleTotal;

	let femaleData = {};
	femaleData["Sex"] = "Female";
	femaleData[userSelected.chosenDeathType] = femaleTotal;

	return [maleData, femaleData];
};

let setGraphOne = function () {
	let data = getFilteredDataBySex();
	let column = "Sex";
	let max = Math.max(
		parseInt(data[0][userSelected.chosenDeathType]),
		parseInt(data[1][userSelected.chosenDeathType])
	);

	var margin = { top: 40, right: 40, bottom: 90, left: 60 },
		width = 300 - margin.left - margin.right,
		height = 365 - margin.top - margin.bottom;

	let svg = d3
		.select("#svg-graph-left")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate( " + margin.left + "," + margin.top + ")");

	let x = d3
		.scaleBand()
		.range([0, width])
		.domain(data.map((d) => d[column])) // update here
		.padding(0.2);
	svg
		.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	let y = d3.scaleLinear().domain([0, max]).range([height, 0]); // update here
	svg.append("g").call(d3.axisLeft(y));

	// text
	svg
		.append("text")
		.attr("x", width / 2)
		.attr("y", 0 - margin.top / 3)
		.attr("text-anchor", "middle")
		.style("font-size", "12px")
		.style("fill", "white")
		.text(userSelected.chosenDeathType + " by Gender");

	// Bars
	svg
		.selectAll("mybar")
		.data(data)
		.enter()
		.append("rect")
		.attr("x", function (d) {
			return x(d[column]);
		})
		.attr("width", x.bandwidth())
		.attr("fill", function (d) {
			return stateColor(d[userSelected.chosenDeathType]);
		})
		// no bar at the beginning thus:
		.attr("height", function (d) {
			return height - y(0);
		}) // always equal to 0
		.attr("y", function (d) {
			return y(0);
		})
		.on("mouseover", leftMouseover)
		.on("mousemove", leftMousemove)
		.on("mouseleave", leftMouseleave);

	// Animation
	svg
		.selectAll("rect")
		.transition()
		.duration(800)
		.attr("y", function (d) {
			return y(d[userSelected.chosenDeathType]);
		})
		.attr("height", function (d) {
			return height - y(d[userSelected.chosenDeathType]);
		})
		.delay(function (d, i) {
			return i * 100;
		});

	updateGraph(svg, x, y, height, data, column);
};

let setGraphTwo = function () {
	let data = getFilteredDataByAge();
	let column = "Age Group";
	let max = -1;
	data.forEach((d) => {
		let deaths =
			d[userSelected.chosenDeathType] != ""
				? parseInt(d[userSelected.chosenDeathType])
				: 0;
		if (deaths > max) {
			max = deaths;
		}
	});

	var margin = { top: 40, right: 40, bottom: 90, left: 60 },
		width = 300 - margin.left - margin.right,
		height = 315 - margin.top - margin.bottom;

	let svg = d3
		.select("#svg-graph-right")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate( " + margin.left + "," + margin.top + ")");

	let x = d3
		.scaleBand()
		.range([0, width])
		.domain(data.map((d) => d[column])) // update here
		.padding(0.2);
	svg
		.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x).ticks(10))
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-1em")
		.attr("dy", ".15em")
		.attr("transform", "rotate(-65)");

	let y = d3.scaleLinear().domain([0, max]).range([height, 0]); // update here
	svg.append("g").call(d3.axisLeft(y));

	svg
		.append("text")
		.attr("x", width / 2)
		.attr("y", 0 - margin.top / 3)
		.attr("text-anchor", "middle")
		.style("font-size", "12px")
		.style("fill", "white")
		.text(userSelected.chosenDeathType + " by Age Group");

	// Bars
	svg
		.selectAll("mybar")
		.data(data)
		.enter()
		.append("rect")
		.attr("x", function (d) {
			return x(d[column]);
		})
		.attr("width", x.bandwidth())
		.attr("fill", function (d) {
			return stateColor(d[userSelected.chosenDeathType]);
		})
		// no bar at the beginning thus:
		.attr("height", function (d) {
			return height - y(0);
		}) // always equal to 0
		.attr("y", function (d) {
			return y(0);
		})
		.on("mouseover", rightMouseover)
		.on("mousemove", rightMousemove)
		.on("mouseleave", rightMouseleave);

	// Animation
	svg
		.selectAll("rect")
		.transition()
		.duration(800)
		.attr("y", function (d) {
			return y(d[userSelected.chosenDeathType]);
		})
		.attr("height", function (d) {
			return height - y(d[userSelected.chosenDeathType]);
		})
		.delay(function (d, i) {
			return i * 100;
		});

	updateGraph(svg, x, y, height, data, column);
};

let setSideGraphs = function () {
	setGraphOne();
	setGraphTwo();
};

let setInfo = function () {
	// get year and set in UI
	let causeYearContainer = document.getElementById("cause-year-container");
	causeYearContainer.innerHTML = "";
	let h1_cause_year = document.createElement("h1");
	h1_cause_year.innerHTML =
		userSelected.chosenDeathType + " " + userSelected.chosenYear;
	causeYearContainer.appendChild(h1_cause_year);
	//deathTypeContainer.appendChild(h1_death);

	// get chosen slide and enable all slide buttons except that one
	let slideshowButtons = document.getElementsByClassName("slideshow-button");
	Array.from(slideshowButtons).forEach((element, index) => {
		index === chosenSlide
			? (element.disabled = true)
			: (element.disabled = false);
	});

	// set information in surrounding containers
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

	let graphLeftContainer = document.createElement("div");
	let graphRightContainer = document.createElement("div");

	let svgGraphLeft = document.createElement("svg");
	let svgGraphRight = document.createElement("svg");

	svgGraphLeft.setAttribute("id", "svg-graph-left");
	svgGraphRight.setAttribute("id", "svg-graph-right");
	graphLeftContainer.setAttribute("id", "graph-container-left");
	graphRightContainer.setAttribute("id", "graph-container-right");

	graphLeftContainer.appendChild(svgGraphLeft);
	graphRightContainer.appendChild(svgGraphRight);
	informationContainerLeft.append(graphLeftContainer);
	informationContainerRight.append(graphRightContainer);
};

let setStateDeathsMapping = function () {
	for (let i = 0; i < filteredData.length; i++) {
		let data = filteredData[i];
		if (!stateDeathsMapping.hasOwnProperty(data["State"])) {
			let value = filteredData
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
	let data = JSON.parse(JSON.stringify(deathsData));
	data = data.filter(function (d) {
		return d["Year"] === userSelected.chosenYear;
	});
	filteredData = data;
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

let createChartTooltip = function () {
	chartTooltip = d3
		.select("#slideshowBtnContainer")
		.append("div")
		.style("opacity", 0)
		.attr("class", "chartTooltip")
		.style("background-color", "grey")
		.style("position", "relative")
		.style("color", "white")
		.style("border", "dashed")
		.style("border-width", "0.1px")
		.style("border-radius", "5px")
		.style("width", "150px")
		.style("text-align", "center")
		.style("padding", "5px")
		.style("position", "absolute");

	mouseover = function () {
		chartTooltip.style("opacity", 1);
		d3.select(this).style("stroke", "solid").style("opacity", 1);
	};
	mousemove = function (stateDataItem) {
		let formatter = Intl.NumberFormat("en-US");
		let id = stateDataItem.target.__data__["id"];
		let data = filteredData.filter((e) => {
			return e["State"] === statesMapping[parseInt(id)];
		});
		let deaths = sumDeaths(data);
		chartTooltip.attr("data-deaths", deaths);

		chartTooltip
			.html(
				"<p>State: " +
					data[0]["State"] +
					"</br></p><p>Deaths: " +
					formatter.format(deaths) +
					"</p>"
			)
			.style("left", d3.pointer(event)[0] + 300 + "px")
			.style("top", d3.pointer(event)[1] + 150 + "px");
	};
	mouseleave = function () {
		chartTooltip.style("opacity", 0);
		chartTooltip.transition().style("visibility", "none");
		d3.select(this).style("stroke", "none").style("opacity", 1);
	};
};
let createLeftGraphtip = function () {
	leftGraphTooltip = d3
		.select("#container-left")
		.append("div")
		.style("opacity", 0)
		.attr("class", "leftGraphTooltip")
		.style("background-color", "white")
		.style("position", "relative")
		.style("color", "red")
		.style("border", "dashed")
		.style("border-width", "0.1px")
		.style("border-radius", "5px")
		.style("width", "150px")
		.style("z-index", "0")
		.style("text-align", "center")
		.style("padding", "5px");
	leftMouseover = function () {
		leftGraphTooltip.style("opacity", 1);
		d3.select(this).style("stroke", "solid").style("opacity", 1);
	};
	leftMousemove = function (stateDataItem) {
		let formatter = Intl.NumberFormat("en-US");
		let sex = stateDataItem.currentTarget.__data__.Sex;
		let data = filteredData.filter((e) => {
			return e["Sex"] === sex;
		});
		let deaths = sumDeaths(data);

		leftGraphTooltip.attr("data-deaths", deaths);

		leftGraphTooltip
			.html(
				"<p>Sex: " +
					data[0]["Sex"] +
					"</br></p><p>Deaths: " +
					formatter.format(deaths) +
					"</p>"
			)
			.style("left", d3.pointer(event)[0] + 80 + "px")
			.style("top", d3.pointer(event)[1] - 350 + "px");
	};
	leftMouseleave = function () {
		leftGraphTooltip.style("opacity", 0);
		leftGraphTooltip.transition().style("visibility", "none");
		d3.select(this).style("stroke", "none").style("opacity", 1);
	};
};
let createRightGraphtip = function () {
	rightGraphTooltip = d3
		.select("#container-right")
		.append("div")
		.style("opacity", 0)
		.attr("class", "rightGraphTooltip")
		.style("background-color", "white")
		.style("position", "relative")
		.style("color", "red")
		.style("border", "dashed")
		.style("border-width", "0.1px")
		.style("border-radius", "5px")
		.style("width", "220px")
		.style("z-index", "0")
		.style("text-align", "center")
		.style("padding", "5px");

	rightMouseover = function () {
		rightGraphTooltip.style("opacity", 1);
		d3.select(this).style("stroke", "solid").style("opacity", 1);
	};
	rightMousemove = function (stateDataItem) {
		let formatter = Intl.NumberFormat("en-US");
		let age = stateDataItem.currentTarget.__data__["Age Group"];
		let data = filteredData.filter((e) => {
			return e["Age Group"] === age;
		});
		let deaths = sumDeaths(data);
		rightGraphTooltip.attr("data-deaths", deaths);

		rightGraphTooltip
			.html(
				"<p>Age Group: " +
					data[0]["Age Group"] +
					"</br></p><p>Deaths: " +
					formatter.format(deaths) +
					"</p>"
			)
			.style("left", d3.pointer(event)[0] - 160 + "px")
			.style("top", d3.pointer(event)[1] - 400 + "px");
	};
	rightMouseleave = function () {
		rightGraphTooltip.style("opacity", 0);
		rightGraphTooltip.transition().style("visibility", "none");
		d3.select(this).style("stroke", "none").style("opacity", 1);
	};
};

let createTooltips = function () {
	document.querySelectorAll(".rightGraphTooltip").forEach((x) => {
		x.remove();
	});

	document.querySelectorAll(".leftGraphToolTip").forEach((x) => {
		x.remove();
	});

	document.querySelectorAll(".chartTooltip").forEach((x) => {
		x.remove();
	});
	createChartTooltip();
	createLeftGraphtip();
	createRightGraphtip();
};

let renderPage = function () {
	setFilteredData();
	createTooltips();
	setStateColor();
	setInfo();
	setSideGraphs();

	svg
		.selectAll("path")
		.data(statesData)
		.enter()
		.append("path")
		.attr("d", d3.geoPath())
		.attr("class", "state")
		.attr("id", function (stateDataItem) {
			return "state-" + stateDataItem["id"];
		})
		.attr("fill", (stateDataItem) => {
			let id = stateDataItem["id"];
			let data = filteredData.filter((e) => {
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
			let data = filteredData.filter((e) => {
				return e["State"] === statesMapping[parseInt(id)];
			});
			return sumDeaths(data);
		})
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave);
};

let sumDeaths = function (data) {
	let total = 0;
	for (let i = 0; i < data.length; i++) {
		if (data[i] && data[i][userSelected.chosenDeathType] != "") {
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
		d3.csv(deathsDataURL).then(function (data, err) {
			if (err) {
				console.log(err);
			} else {
				deathsData = data;
				renderPage();
			}
		});
	}
});
