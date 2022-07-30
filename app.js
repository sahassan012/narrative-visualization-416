let stateGeoJSONURL = "./US_geo.json";
let deathsDataURL = "./Provisional_COVID-19_Deaths_by_Sex_and_Age.csv";
let populationDataURL = "./NST-EST2021-popchg2020_2021.csv";

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
let populationData;

let filteredDeathData;
let filteredPopulationData;

let filteredDeathData_timeline;
let filteredPopulationData_timeline;

let dateAnalyzed;
let stateDeathsPopulationMapping = {};

let formatter = Intl.NumberFormat("en-US");
let annotationColor = "#f10004ed";
let timeSliderIsVisible = false;
let timelineErroredOut = false;

const ColumnCOVIDDeath = "COVID-19 Deaths";
const ColumnTotalDeath = "Total Deaths";
const ColumnPneumoniaDeath = "Pneumonia Deaths";
const ColumnInfluenzaDeath = "Influenza Deaths";
const ColumnPneumoniaInfluenzaCOVIDDeaths =
	"Pneumonia, Influenza, or COVID-19 Deaths";

let chosenDeathType = ColumnCOVIDDeath;
let chosenSlide = 0;

let userSelected = {
	chosenDeathType: ColumnCOVIDDeath,
	chosenGroup: "By Year",
	chosenYear: "2020",
	chosenMonth: "",
	chosenSex: "",
	chosenAgeGroup: "",
};

let timelineValues = {
	year: "",
	month: "",
	earliestDate: null,
	latestDate: null,
	allDates: [],
};

let maleDeaths;
let femaleDeaths;
let stateHighestDeaths = { state: "", deaths: null };
let stateHighestRatio = { state: "", ratio: null };
let ageHighestDeath = { ageGroup: "", deaths: null, totalDeaths: null };

let slideInformation = {
	0: { left: "", right: "", bottom: "" },
	1: { left: "", right: "", bottom: "" },
	2: { left: "", right: "", bottom: "" },
	3: { left: "", right: "", bottom: "" },
	4: { left: "", right: "", bottom: "" },
};

// first
slideInformation[0].left =
	"In [5], males had [0] more deaths than females due to [4] with a count of [1]. The State of [2] held the most deaths reported ([3]). The highest death-to-population ratio was for [6] with a rate of [7]."; //  1,863,902/3,370,919 (55.29%)  -  1,507,017/3,370,919 (44.70%)
slideInformation[0].right =
	"[0] have been the highest for those within the age of [1] which accounts for [3] of overall [0] ([2])."; // 983,449 / 3,370,919
slideInformation[0].bottom =
	"Some categories of data with a death count within the range of 1-9 has been excluded from the dataset in accordance with National Center for Health Statistics(NCHS) confidentiality standards.";

// second
slideInformation[1].left =
	"In [5], males had [0] more deaths than females due to [4] with a count of [1]. The State of [2] held the most deaths reported ([3]). The highest death-to-population ratio was for [6] with a rate of [7]."; //  1,863,902/3,370,919 (55.29%)  -  1,507,017/3,370,919 (44.70%)
slideInformation[1].right =
	"[0] have been the highest for those within the age range of [1] which accounts for [3] of overall [0] ([2])."; // 14,923 / 71,845 = 20.78%
slideInformation[1].bottom =
	"Some categories of data with a death count within the range of 1-9 has been excluded from the dataset in accordance with National Center for Health Statistics(NCHS) confidentiality standards.";
("");

// third
slideInformation[2].left =
	"In [5], males had [0] more deaths than females due to [4] with a count of [1]. The State of [2] held the most deaths reported ([3]). The highest death-to-population ratio was for [6] with a rate of [7]."; //  1,863,902/3,370,919 (55.29%)  -  1,507,017/3,370,919 (44.70%)
slideInformation[2].right =
	"[0] have been the highest for those within the age of [1] which accounts for [3] of overall [0] ([2])."; //  818,447 / 3,099,823
slideInformation[2].bottom =
	"Some categories of data with a death count within the range of 1-9 has been excluded from the dataset in accordance with National Center for Health Statistics(NCHS) confidentiality standards.";
("");

// fourth
slideInformation[3].left =
	"In [5], males had [0] more deaths than females due to [4] with a count of [1]. The State of [2] held the most deaths reported ([3]). The highest death-to-population ratio was for [6] with a rate of [7]."; //  1,863,902/3,370,919 (55.29%)  -  1,507,017/3,370,919 (44.70%)
slideInformation[3].right =
	"The rate of [0] combined has been the highest for those within the age of [1] ([2]).";
slideInformation[3].bottom =
	"Some categories of data with a death count within the range of 1-9 has been excluded from the dataset in accordance with National Center for Health Statistics(NCHS) confidentiality standards.";
("");

// five
slideInformation[4].left =
	"In [5], males had [0] more deaths than females due to [4] with a count of [1]. The State of [2] held the most deaths reported ([3]). The highest death-to-population ratio was for [6] with a rate of [7]."; //  1,863,902/3,370,919 (55.29%)  -  1,507,017/3,370,919 (44.70%)
slideInformation[4].right =
	"Highest overall deaths have been within the age of 85 years and over ([2]) which is [3] of [0].";
slideInformation[4].bottom =
	"Some categories of data with a death count within the range of 1-9 has been excluded from the dataset in accordance with National Center for Health Statistics(NCHS) confidentiality standards.";
("");

let svg = d3.select("#wrapper");
let chartTooltip, leftGraphTooltip, rightGraphTooltip;

let mouseover, mouseleave, mousemove;
let leftMouseover, leftMouseleave, leftMousemove;
let rightMouseover, rightMouseleave, rightMousemove;

let stateColor;

let annotations;

let setAnnotations = function () {
	annotations = {
		0: [
			[
				{
					note: {
						title: "Highest Death-to-population Ratio",
						label:
							stateHighestRatio.state +
							" - " +
							(stateHighestRatio.ratio * 100).toFixed(2) +
							"%",
						align: "middle",
						wrap: 300,
						padding: 10,
					},
					connector: {
						end: "dot", // none, or arrow or dot
						type: "lne", // Line or curve
						points: 1, // Number of break in the curve
						lineType: "horizontal",
					},
					color: [annotationColor],
					x: 852,
					y: 225,
					dy: -155,
					dx: -150,
				},
			],
			[
				{
					note: {
						title: "Highest Death Rate",
						label:
							stateHighestDeaths.state +
							" - " +
							formatter.format(stateHighestDeaths.deaths),
						align: "middle",
						wrap: 300,
						padding: 10,
					},
					connector: {
						end: "dot", // none, or arrow or dot
						type: "lne", // Line or curve
						points: 1, // Number of break in the curve
						lineType: "horizontal",
					},
					color: [annotationColor],
					x: 440,
					y: 465,
					dy: 100,
					dx: 180,
				},
			],
		],
		1: [
			[
				{
					note: {
						title: "Highest Death-to-population Ratio",
						label:
							stateHighestRatio.state +
							" - " +
							(stateHighestRatio.ratio * 100).toFixed(2) +
							"%",
						align: "middle",
						wrap: 300,
						padding: 10,
					},
					connector: {
						end: "dot", // none, or arrow or dot
						type: "lne", // Line or curve
						points: 1, // Number of break in the curve
						lineType: "horizontal",
					},
					color: [annotationColor],
					x: 450,
					y: 300,
					dy: -245,
					dx: 100,
				},
			],
			[
				{
					note: {
						title: "Highest Death Rate",
						label:
							stateHighestDeaths.state +
							" - " +
							formatter.format(stateHighestDeaths.deaths),
						align: "middle",
						wrap: 300,
						padding: 10,
					},
					connector: {
						end: "dot", // none, or arrow or dot
						type: "lne", // Line or curve
						points: 1, // Number of break in the curve
						lineType: "horizontal",
					},
					color: [annotationColor],
					x: 440,
					y: 465,
					dy: 100,
					dx: 180,
				},
			],
		],
		2: [
			[
				{
					note: {
						title: "Highest Death-to-population Ratio",
						label:
							stateHighestRatio.state +
							" - " +
							(stateHighestRatio.ratio * 100).toFixed(2) +
							"%",
						align: "middle",
						wrap: 300,
						padding: 10,
					},
					connector: {
						end: "dot", // none, or arrow or dot
						type: "lne", // Line or curve
						points: 1, // Number of break in the curve
						lineType: "horizontal",
					},
					color: [annotationColor],
					x: 605,
					y: 435,
					dy: -365,
					dx: 100,
				},
			],
			[
				{
					note: {
						title: "Highest Death Rate",
						label:
							stateHighestDeaths.state +
							" - " +
							formatter.format(stateHighestDeaths.deaths),
						align: "middle",
						wrap: 300,
						padding: 10,
					},
					connector: {
						end: "dot", // none, or arrow or dot
						type: "lne", // Line or curve
						points: 1, // Number of break in the curve
						lineType: "horizontal",
					},
					color: [annotationColor],
					x: 80,
					y: 270,
					dy: -217,
					dx: 310,
				},
			],
		],
		3: [
			[
				{
					note: {
						title: "Highest Death-to-population Ratio",
						label:
							stateHighestRatio.state +
							" - " +
							(stateHighestRatio.ratio * 100).toFixed(2) +
							"%",
						align: "middle",
						wrap: 300,
						padding: 10,
					},
					connector: {
						end: "dot", // none, or arrow or dot
						type: "lne", // Line or curve
						points: 1, // Number of break in the curve
						lineType: "horizontal",
					},
					color: [annotationColor],
					x: 605,
					y: 435,
					dy: -365,
					dx: 100,
				},
			],
			[
				{
					note: {
						title: "Highest Death Rate",
						label:
							stateHighestDeaths.state +
							" - " +
							formatter.format(stateHighestDeaths.deaths),
						align: "middle",
						wrap: 300,
						padding: 10,
					},
					connector: {
						end: "dot", // none, or arrow or dot
						type: "lne", // Line or curve
						points: 1, // Number of break in the curve
						lineType: "horizontal",
					},
					color: [annotationColor],
					x: 80,
					y: 270,
					dy: -217,
					dx: 310,
				},
			],
		],
		4: [
			[
				{
					note: {
						title: "Highest Death-to-population Ratio",
						label:
							stateHighestRatio.state +
							" - " +
							(stateHighestRatio.ratio * 100).toFixed(2) +
							"%",
						align: "middle",
						wrap: 300,
						padding: 10,
					},
					connector: {
						end: "dot", // none, or arrow or dot
						type: "lne", // Line or curve
						points: 1, // Number of break in the curve
						lineType: "horizontal",
					},
					color: [annotationColor],
					x: 750,
					y: 290,
					dy: -220,
					dx: -15,
				},
			],
			[
				{
					note: {
						title: "Highest Death Rate",
						label:
							stateHighestDeaths.state +
							" - " +
							formatter.format(stateHighestDeaths.deaths),
						align: "middle",
						wrap: 300,
						padding: 10,
					},
					connector: {
						end: "dot", // none, or arrow or dot
						type: "lne", // Line or curve
						points: 1, // Number of break in the curve
						lineType: "horizontal",
					},
					color: [annotationColor],
					x: 80,
					y: 270,
					dy: -217,
					dx: 310,
				},
			],
		],
	};
};

let updateAnnotations = function () {
	let makeAnnotationsRatio;
	if (annotations[chosenSlide] && annotations[chosenSlide].length > 0) {
		makeAnnotationsRatio = d3
			.annotation()
			.editMode(true)
			.type(d3.annotationCalloutElbow)
			.annotations(annotations[chosenSlide][0]);

		d3.select("#wrapper")
			.append("g")
			.attr("class", "state-annotation")
			.call(makeAnnotationsRatio);
	}

	let makeAnnotationsDeaths;
	if (annotations[chosenSlide] && annotations[chosenSlide].length > 0) {
		makeAnnotationsDeaths = d3
			.annotation()
			.editMode(true)
			.type(d3.annotationCalloutElbow)
			.annotations(annotations[chosenSlide][1]);
		d3.select("#wrapper")
			.append("g")
			.attr("class", "state-annotation")
			.call(makeAnnotationsDeaths);
	}
	d3.select("#wrapper")
		.selectAll(".connector")
		.attr("stroke", "red")
		.style("stroke-dasharray", "10, 3");
};

let setSlideInformation = function () {
	let leftString_0 = slideInformation[chosenSlide].left.replace(
		"[0]",
		(
			(maleDeaths / (maleDeaths + femaleDeaths) -
				femaleDeaths / (maleDeaths + femaleDeaths)) *
			100
		).toFixed(2) + "%"
	);
	let leftString_1 = leftString_0.replace("[1]", formatter.format(maleDeaths));
	let leftString_2 = leftString_1.replace("[2]", stateHighestDeaths.state);
	let leftString_3 = leftString_2.replace("[4]", userSelected.chosenDeathType);
	let leftString_4 = leftString_3.replace("[5]", userSelected.chosenYear);
	let leftString_5 = leftString_4.replace(
		"[7]",
		(stateHighestRatio.ratio * 100).toFixed(2) + "%"
	);
	let leftString_6 = leftString_5.replace("[6]", stateHighestRatio.state);
	let finalString = leftString_6.replace(
		"[3]",
		formatter.format(stateHighestDeaths.deaths)
	);
	document.getElementById("info-left").innerHTML = "";
	document.getElementById("info-left").innerHTML = finalString;

	let rightString_0 = slideInformation[chosenSlide].right.replace();
	let rightString_1 = rightString_0.replace(
		"[0]",
		userSelected.chosenDeathType
	);
	let rightString_2 = rightString_1.replace("[1]", ageHighestDeath.ageGroup);
	let rightString_3 = rightString_2.replace(
		"[2]",
		formatter.format(ageHighestDeath.deaths)
	);
	let rightString_4 = rightString_3.replace(
		"[3]",
		((ageHighestDeath.deaths / ageHighestDeath.totalDeaths) * 100).toFixed(2) +
			"%"
	);
	finalString = rightString_4.replace("[0]", userSelected.chosenDeathType);

	document.getElementById("info-right").innerHTML = "";
	document.getElementById("info-right").innerHTML = finalString;
};

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

let updateTime = function (i = -1) {
	let elem = document.getElementById("timeSliderRange");
	let index;
	if (i === -1) {
		index = parseInt(elem.value);
	} else {
		index = i;
	}
	timelineValues.year = timelineValues.allDates[index].getFullYear().toString();
	timelineValues.month = (
		timelineValues.allDates[index].getMonth() + 1
	).toString();

	userSelected.chosenMonth = timelineValues.month;
	userSelected.chosenYear = timelineValues.year;
	renderPage();
};

let showTimeSlider = function () {
	document.getElementById("switchToExplorationModeBtn").style.display = "none";
	document.getElementById("timeSliderRangeContainer").style.display = "";
};

let hideTimeSlider = function () {
	document.getElementById("switchToExplorationModeBtn").style.display = "none";
	document.getElementById("timeSliderRangeContainer").style.display = "none";
	("hidden;");
};

let initializeTimelineDates = function () {
	timelineValues.earliestDate = new Date("2020/1");
	timelineValues.latestDate = new Date("2022/1");

	let endDate = timelineValues.latestDate;
	let date = timelineValues.earliestDate;
	timelineValues.allDates = [];
	while (date <= endDate) {
		timelineValues.allDates.push(new Date(date));
		date.setDate(date.getDate() + 8);
	}
	timelineValues.year = "2020";
	timelineValues.month = "1";
};

let updateSlide = function (slideNumber) {
	chosenSlide = slideNumber;
	let existingAnnotations = document.querySelectorAll(".state-annotation");
	if (existingAnnotations.length > 0) {
		existingAnnotations.forEach((a) => a.remove());
	}
	if (chosenSlide === 0) {
		if (!timeSliderIsVisible) {
			userSelected.chosenYear = "2020";
		}
		userSelected.chosenDeathType = ColumnCOVIDDeath;
	} else if (chosenSlide === 1) {
		if (!timeSliderIsVisible) {
			userSelected.chosenYear = "2020";
		}
		userSelected.chosenDeathType = ColumnInfluenzaDeath;
	} else if (chosenSlide === 2) {
		if (!timeSliderIsVisible) {
			userSelected.chosenYear = "2020";
		}
		userSelected.chosenDeathType = ColumnPneumoniaDeath;
	} else if (chosenSlide === 3) {
		if (!timeSliderIsVisible) {
			userSelected.chosenYear = "2020";
		}
		userSelected.chosenDeathType = ColumnPneumoniaInfluenzaCOVIDDeaths;
	} else if (chosenSlide === 4) {
		if (!timeSliderIsVisible) {
			userSelected.chosenYear = "2020";
		}
		userSelected.chosenDeathType = ColumnTotalDeath;
		if (!timeSliderIsVisible) {
			document.getElementById("switchToExplorationModeBtn").style.display = "";
			initializeTimelineDates();
		}
	}

	renderPage();
	if (timeSliderIsVisible) {
		showTimeSlider();
	}
	if (!timeSliderIsVisible) {
		setAnnotations();
		updateAnnotations();
	}
};

let switchToExplorationMode = function () {
	showTimeSlider();
	timeSliderIsVisible = true;
	document.querySelectorAll(".state-annotation").forEach((a) => a.remove());
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

let getfilteredDeathDataByAge = function () {
	let temp = {};
	filteredDeathData.forEach((d) => {
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

let getfilteredDeathDataBySex = function () {
	let maleTotal = 0;
	let femaleTotal = 0;
	filteredDeathData.forEach((d) => {
		if (d["Sex"] === "Female") {
			femaleTotal +=
				d[userSelected.chosenDeathType] !== ""
					? parseInt(d[userSelected.chosenDeathType])
					: 0;
		} else if (d["Sex"] === "Male") {
			maleTotal +=
				d[userSelected.chosenDeathType] !== ""
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
	let data = getfilteredDeathDataBySex();
	let column = "Sex";

	maleDeaths = data[0][userSelected.chosenDeathType];
	femaleDeaths = data[1][userSelected.chosenDeathType];

	let max = Math.max(
		parseInt(data[0][userSelected.chosenDeathType]),
		parseInt(data[1][userSelected.chosenDeathType])
	);

	var margin = { top: 38, right: -20, bottom: 90, left: 90 },
		width = 350 - margin.left - margin.right,
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
		.domain(data.map((d) => d[column]))
		.padding(0.2);

	svg
		.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	let y = d3.scaleLinear().domain([0, max]).range([height, 0]);
	svg.append("g").call(d3.axisLeft(y));

	// text
	svg
		.append("text")
		.attr("x", width / 2)
		.attr("y", 0 - margin.top / 3)
		.attr("text-anchor", "middle")
		.style("font-size", "12px")
		.style("fill", "white")
		.text(
			userSelected.chosenDeathType
				.replace(/Influenza/gi, "Flu")
				.replace(/COVID-19/gi, "COVID") + " by Sex"
		);
	svg
		.append("text")
		.attr("x", width - 140)
		.attr("y", margin.top + 235)
		.attr("text-anchor", "middle")
		.style("font-size", "12px")
		.style("fill", "white")
		.text("Sex");

	svg
		.append("text")
		.attr("x", -120)
		.attr("y", -75)
		.attr("text-anchor", "middle")
		.style("font-size", "12px")
		.attr("dy", ".75em")
		.style("fill", "white")
		.attr("transform", "rotate(-90)")
		.text("Death Rate");

	// Bars
	svg
		.selectAll("sexGraphBars")
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
		.attr("height", function (d) {
			return height - y(0);
		})
		.attr("y", function (d) {
			return y(0);
		})
		.on("mouseover", leftMouseover)
		.on("mousemove", leftMousemove)
		.on("mouseleave", leftMouseleave);

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
	let data = getfilteredDeathDataByAge();

	let totalOtherThanHighest = 0;
	let indexWithHighestDeaths = 0;
	let column = "Age Group";
	let max = -1;
	data.forEach((d, i) => {
		let deaths =
			d[userSelected.chosenDeathType] != ""
				? parseInt(d[userSelected.chosenDeathType])
				: 0;
		if (deaths > max) {
			max = deaths;
			indexWithHighestDeaths = i;
		}
		if (d["Age Group"] != ageHighestDeath.ageGroup) {
			totalOtherThanHighest += d[userSelected.chosenDeathType];
		}
	});
	ageHighestDeath.totalDeaths = totalOtherThanHighest;
	ageHighestDeath.ageGroup = data[indexWithHighestDeaths]["Age Group"];
	ageHighestDeath.deaths =
		data[indexWithHighestDeaths][userSelected.chosenDeathType];

	var margin = { top: 40, right: 25, bottom: 90, left: 80 },
		width = 370 - margin.left - margin.right,
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
		.text(
			userSelected.chosenDeathType
				.replace(/Influenza/gi, "Flu")
				.replace(/COVID-19/gi, "COVID") + " by Age"
		);

	svg
		.append("text")
		.attr("x", width - 140)
		.attr("y", margin.top + 230)
		.attr("text-anchor", "middle")
		.style("font-size", "12px")
		.style("fill", "white")
		.text("Age Group");

	svg
		.append("text")
		.attr("x", -100)
		.attr("y", -65)
		.attr("text-anchor", "middle")
		.style("font-size", "12px")
		.attr("dy", ".75em")
		.style("fill", "white")
		.attr("transform", "rotate(-90)")
		.text("Death Rate");

	svg
		.selectAll("ageGraphBars")
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
		.attr("height", function (d) {
			return height - y(0);
		})
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

	informationContainerLeft.innerHTML = "<h3>Deaths by Sex:</h3>";
	informationContainerRight.innerHTML = "<h3>Deaths by Age Group:</h3>";
	informationContainerBottom.innerHTML = "<h3>About the Dataset:</h3>";

	let spanLeft = document.createElement("span");
	let spanRight = document.createElement("span");
	let spanBottom = document.createElement("span");

	spanLeft.id = "info-left";
	spanRight.id = "info-right";

	dateAnalyzed = filteredDeathData[0]["Data As Of"];
	let dateAnalyzedMessage =
		"The data above was last analyzed on " + dateAnalyzed + ". ";

	spanBottom.innerHTML +=
		dateAnalyzedMessage + slideInformation[chosenSlide].bottom;

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

let setstateDeathsPopulationMapping = function () {
	stateDeathsPopulationMapping = {};
	for (let i = 0; i < filteredDeathData.length; i++) {
		let data = filteredDeathData[i];
		let stateDoesNotExist = !stateDeathsPopulationMapping.hasOwnProperty(
			data["State"]
		);

		if (stateDoesNotExist) {
			let value = filteredDeathData.filter((d) => d["State"] === data["State"]);
			value = value.reduce((rate, object) => {
				let existingRate = parseInt(
					object[userSelected.chosenDeathType] !== ""
						? object[userSelected.chosenDeathType]
						: "0"
				);
				return rate + existingRate;
			}, 0);

			if (!stateDeathsPopulationMapping.hasOwnProperty("deathrate")) {
				stateDeathsPopulationMapping[data["State"]] = { deathrate: value };
			} else {
				stateDeathsPopulationMapping[data["State"]].deathrate += value;
			}
		}
	}
	populationData.forEach((d) => {
		if (stateDeathsPopulationMapping.hasOwnProperty(d["NAME"])) {
			let key = stateDeathsPopulationMapping[d["NAME"]];
			if (userSelected.chosenYear === "2020") {
				key["population"] = parseInt(d["POPESTIMATE2020"]);
				key["rate"] = key["deathrate"] / parseInt(d["POPESTIMATE2020"]);
			} else if (userSelected.chosenYear === "2021") {
				key["population"] = parseInt(d["POPESTIMATE2021"]);
				key["rate"] = key["deathrate"] / parseInt(d["POPESTIMATE2021"]);
			}
		}
	});
};

let showTimelineErrorAndResetFilters = function () {
	alert(
		"Oops. Seems like we do not have data for the date chosen in the timeline. Please choose another date."
	);
	timelineErroredOut = true;
	updateTime(10);
};

let setFilteredDeathData = function () {
	let data = JSON.parse(JSON.stringify(deathsData));
	data = data.filter(function (d) {
		if (
			d["State"] === "United States" ||
			d["State"] === "New York City" ||
			d["State"] === "District of Columbia"
		) {
			return false;
		}

		if (timeSliderIsVisible) {
			return d["Group"] === "By Month";
		} else {
			if (userSelected.chosenGroup === "By Year") {
				return (
					d["Group"] === userSelected.chosenGroup &&
					d["Year"] === userSelected.chosenYear
				);
			} else if (userSelected.chosenGroup === "By Month") {
				return (
					d["Group"] === userSelected.chosenGroup &&
					d["Month"] === userSelected.chosenMonth
				);
			}
		}
		return false;
	});
	filteredDeathData = data;

	if (timeSliderIsVisible) {
		filteredDeathData = filteredDeathData.filter(function (d) {
			return (
				d["Year"] === timelineValues.year && d["Month"] === timelineValues.month
			);
		});
		if (filteredDeathData.length === 0) {
			showTimelineErrorAndResetFilters();
		}
	}
};

let setStateColor = function () {
	let stateWithHighestDeaths;
	if (
		!Object.keys(stateDeathsPopulationMapping) ||
		Object.keys(stateDeathsPopulationMapping).length === 0
	) {
		return;
	}
	stateWithHighestDeaths = Object.keys(stateDeathsPopulationMapping).reduce(
		function (a, b) {
			return stateDeathsPopulationMapping[a].deathrate >
				stateDeathsPopulationMapping[b].deathrate
				? a
				: b;
		}
	);

	stateHighestDeaths.state = stateWithHighestDeaths;
	stateHighestDeaths.deaths =
		stateDeathsPopulationMapping[stateWithHighestDeaths].deathrate;

	let stateWithHighestRate = Object.keys(stateDeathsPopulationMapping).reduce(
		function (a, b) {
			return stateDeathsPopulationMapping[a].rate >
				stateDeathsPopulationMapping[b].rate
				? a
				: b;
		}
	);
	stateHighestRatio.state = stateWithHighestRate;
	stateHighestRatio.ratio =
		stateDeathsPopulationMapping[stateWithHighestRate].rate;

	const deathsList = Object.keys(stateDeathsPopulationMapping)
		.filter((state) => state !== "United States")
		.map((state) => stateDeathsPopulationMapping[state].deathrate);
	stateColor = d3
		.scaleLinear()
		.domain([Math.min(...deathsList), Math.max(...deathsList)])
		.range(["white", "red"]);
};

let createChartTooltip = function () {
	chartTooltip = d3
		.select("#outer-wrapper")
		.append("div")
		.style("opacity", 0)
		.attr("class", "chartTooltip")
		.style("background-color", "grey")
		.style("position", "relative")
		.style("color", "white")
		.style("border", "dashed")
		.style("border-width", "0.1px")
		.style("border-radius", "5px")
		.style("width", "200px")
		.style("text-align", "center")
		.style("padding", "5px")
		.style("position", "relative");

	mouseover = function () {
		chartTooltip.style("opacity", 1);
		chartTooltip.style("stroke", "solid").style("opacity", 1);
	};
	mousemove = function (stateDataItem) {
		let id = stateDataItem.target.__data__["id"];
		let data = filteredDeathData.filter((e) => {
			return e["State"] === statesMapping[parseInt(id)];
		});
		let state = data[0]["State"];
		let deaths = sumDeaths(data);
		let population = stateDeathsPopulationMapping[state].population;
		chartTooltip.attr("data-deaths", deaths);

		chartTooltip
			.html(
				"<p>State: " +
					state +
					"</br></p><p>" +
					"Deaths: " +
					formatter.format(deaths) +
					"</p><p>Population: " +
					formatter.format(population) +
					"</p>"
			)
			.style("left", d3.pointer(event)[0] + 30 + "px")
			.style("top", d3.pointer(event)[1] - 610 + "px");
	};
	mouseleave = function () {
		chartTooltip.style("opacity", 0);
		chartTooltip.transition().style("visibility", "none");
		chartTooltip.style("stroke", "none").style("opacity", 0);
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
		.style("text-align", "center")
		.style("padding", "5px");
	leftMouseover = function () {
		leftGraphTooltip.style("opacity", 1);
		d3.select(this).style("stroke", "solid").style("opacity", 1);
	};
	leftMousemove = function (stateDataItem) {
		let sex = stateDataItem.currentTarget.__data__.Sex;
		let data = filteredDeathData.filter((e) => {
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
		.style("text-align", "center")
		.style("padding", "5px");

	rightMouseover = function () {
		rightGraphTooltip.style("opacity", 1);
		d3.select(this).style("stroke", "solid").style("opacity", 1);
	};
	rightMousemove = function (stateDataItem) {
		let age = stateDataItem.currentTarget.__data__["Age Group"];
		let data = filteredDeathData.filter((e) => {
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

let removeExistingTooltips = function () {
	let leftTooltip = document.querySelector(".leftGraphTooltip");
	let rightTooltip = document.querySelector(".rightGraphTooltip");
	let chartTooltip = document.querySelector(".chartTooltip");
	if (leftTooltip) {
		leftTooltip.remove();
	}
	if (rightTooltip) {
		rightTooltip.remove();
	}
	if (chartTooltip) {
		chartTooltip.remove();
	}
};

let createTooltips = function () {
	removeExistingTooltips();
	createChartTooltip();
	createLeftGraphtip();
	createRightGraphtip();
};

let renderPage = function () {
	setFilteredDeathData();

	if (timeSliderIsVisible && timelineErroredOut) {
		return;
	}
	setstateDeathsPopulationMapping();
	createTooltips();
	setStateColor();
	setInfo();
	setSideGraphs();
	setSlideInformation();

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
			let data = filteredDeathData.filter((e) => {
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
			let data = filteredDeathData.filter((e) => {
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
				d3.csv(populationDataURL).then(function (data, err) {
					if (err) {
						console.log(err);
					} else {
						populationData = data;
						updateSlide(0);
						hideTimeSlider();
					}
				});
			}
		});
	}
});
