let worldcup_data;
let filtered_data = [];
let slideShowMapping = [1930, 1962, 1994, 2002, 2010];

let svg;
let xScaleBand, yScaleBand;
let x, y;

let year, away, home;
let yearsList = new Set();
let chosenYear = 1930;
let chosenSide = "home";
let chosenSlide = 0;
let marginMapping;
let height, width;

//
//	fetchPassengerData
//
//
fetchPassengerData = function () {
	d3.csv("world_cup_results_data.csv").then(function (response) {
		worldcup_data = response;
		initD3();
		updateChart();
		initDraggableTimeline();
		updateSlideshow(0);
	});
};

//
//	initD3
//
//
initD3 = function () {
	var margin = { top: 30, right: 30, bottom: 70, left: 60 };
	width = 1800 - margin.left - margin.right;
	height = 600 - margin.top - margin.bottom;

	svg = d3
		.select("#chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	xScaleBand = d3.scaleBand().range([0, width]).padding(0.2);
	x = svg.append("g").attr("transform", "translate(0," + height + ")");

	yScaleLinear = d3.scaleLinear().range([height, 0]);
	y = svg.append("g");
};

//
//	updateChart
//
//
updateChart = function () {
	updateButtons();
	d3.select("#chart").selectAll("rect").remove();
	for (let i = 0; i < worldcup_data.length; i++) {
		var year = worldcup_data[i].Year;
		if (!yearsList.has(year)) {
			yearsList.add(year);
		}
	}

	filtered_data = worldcup_data.filter((d) => d.Year == String(chosenYear));
	filtered_data.sort((a, b) => {
		if (chosenSide === "home") {
			return a.HomeTeam > b.HomeTeam ? 1 : -1;
		} else {
			return a.AwayTeam > b.AwayTeam ? 1 : -1;
		}
	});

	marginMapping = Array(yearsList.size)
		.fill()
		.map(function (_, idx) {
			value = -30 + idx * 70;
			return value;
		});

	xScaleBand.domain(
		filtered_data.map(function (d) {
			if (chosenSide === "home") {
				return d.HomeTeam;
			}
			return d.AwayTeam;
		})
	);
	x.transition().duration(1000).call(d3.axisBottom(xScaleBand));

	yScaleLinear.domain([
		0,
		d3.max(filtered_data, function (d) {
			if (chosenSide === "home") {
				return d.HomeGoals;
			}
			return d.AwayGoals;
		}),
	]);
	y.transition().duration(1000).call(d3.axisLeft(yScaleLinear));

	let rect = svg.selectAll("rect").data(filtered_data);
	rect
		.enter()
		.append("rect")
		.merge(rect)
		.transition()
		.duration(1000)
		.attr("x", (d) =>
			xScaleBand(chosenSide === "home" ? d.HomeTeam : d.AwayTeam)
		)
		.attr("y", (d) =>
			yScaleLinear(chosenSide === "home" ? d.HomeGoals : d.AwayGoals)
		)
		.attr("width", xScaleBand.bandwidth())
		.attr(
			"height",
			(d) =>
				height - yScaleLinear(chosenSide === "home" ? d.HomeGoals : d.AwayGoals)
		)
		.attr("fill", "#007bff");
};

//
//	initDraggableTimeline
//
//
initDraggableTimeline = function () {
	initTimelineArrow();
	initTimelineYears();
};

//
//	initTimelineYears
//
//
initTimelineYears = function () {
	let timelineContainer = document.getElementById("timelineYears");

	yearsList.forEach((value) => {
		timelineContainer.innerHTML +=
			"<div class='timeline-year' onclick='updateTimelineArrow(" +
			value +
			")'>" +
			"<svg><circle cx='8' cy='8' r='8'/><svg>" +
			"<p>" +
			value +
			"</p>" +
			"</div>";
	});
};

//
//	initTimelineArrow
//	 sources : https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_draggable
//
initTimelineArrow = function () {
	let elmnt = document.getElementById("timelineArrow");
	elmnt.style.marginLeft = "-30px";
	var pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;
	if (document.getElementById(elmnt.id + "Svg")) {
		/* if present, the header is where you move the DIV from:*/
		document.getElementById(elmnt.id + "Svg").onmousedown = dragMouseDown;
	} else {
		/* otherwise, move the DIV from anywhere inside the DIV:*/
		elmnt.onmousedown = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// set the element's new position:
		var position = elmnt.offsetLeft - pos1;

		// check for min and max position
		let min = 147;
		let max = 1477;
		position = position < min ? min : position > max ? max : position;
		elmnt.style.marginLeft = position + "px";
	}

	function closeDragElement() {
		// check the closest year
		position = parseInt(elmnt.style.marginLeft.slice(0, -2));
		const indices = marginMapping.map((num) => {
			return Math.abs(num - position);
		});
		let index = indices.indexOf(Math.min(...indices));
		position = marginMapping[index];
		elmnt.style.marginLeft = position + "px";
		chosenYear = Array.from(yearsList)[index];
		console.log(chosenYear);

		/* stop moving when mouse button is released:*/
		document.onmouseup = null;
		document.onmousemove = null;
	}
};

//
//	updateTimelineArrow
//
//
updateTimelineArrow = function (year) {
	let elmnt = document.getElementById("timelineArrow");
	let index = [...yearsList].indexOf(String(year));
	chosenYear = Array.from(yearsList)[index];
	position = marginMapping[index];
	elmnt.style.marginLeft = position + "px";
	console.log(chosenYear);
	updateChart();
};

//
//	updateSide
//
//
updateSide = function (side) {
	chosenSide = side;
	updateChart();
};

//
//	updateButtons
//
//
updateButtons = function () {
	let homeBtn = document.getElementById("homeBtn");
	let awayBtn = document.getElementById("awayBtn");
	if (chosenSide == "home") {
		homeBtn.setAttribute("disabled", "");
		awayBtn.removeAttribute("disabled");
	} else {
		awayBtn.setAttribute("disabled", "");
		homeBtn.removeAttribute("disabled");
	}
};

//
//	updateSlideshow
//
//
updateSlideshow = function (slideshowIndex) {
	let year = slideShowMapping[slideshowIndex];
	chosenSlide = slideshowIndex;
	chosenYear = year;
	updateTimelineArrow(year);

	let slideshowButtons = document.getElementsByClassName("slideshow-btn");
	Array.from(slideshowButtons, (d) => {
		d.removeAttribute("disabled");
	});
	slideshowButtons[slideshowIndex].setAttribute("disabled", "");
	updateChart();
};
