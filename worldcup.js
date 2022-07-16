let worldcup_data;
let svg;
let xScaleBand, yScaleBand;
let x, y;

let year, away, home;
let yearsList = new Set();
let chosenYear;
let marginMapping = [
	150, 220, 292, 363, 434, 504, 576, 647, 716, 788, 860, 930, 1000, 1072, 1143,
	1215, 1285, 1355, 1428, 1500,
];

//
//	fetchPassengerData
//
//
fetchPassengerData = function () {
	d3.csv("/world_cup_results_data.csv").then(function (response) {
		worldcup_data = response;
		initD3();
		initChart();
		initDraggableTimeline();
	});
};

//
//	initD3
//
//
initD3 = function () {
	svg = d3
		.select("#chart")
		.append("svg")
		.attr("width", 100)
		.attr("height", 100)
		.append("g")
		.attr("transform", "translate(60,30)");

	xScaleBand = d3.scaleBand().range([0, 100]).padding(0.2);
	x = svg.append("g").attr("transform", "translate(0, 100)");

	yScaleLinear = d3.scaleLinear().range([100, 0]);
	y = svg.append("g").attr("transform", "translate(100, 0)");
};

//
//	initChart
//
//
initChart = function () {
	for (let i = 0; i < worldcup_data.length; i++) {
		var year = worldcup_data[i].Year;
		if (!yearsList.has(year)) {
			yearsList.add(year);
		}
	}

	chosenYear = yearsList[0];
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
			"<div class='timeline-year'>" +
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
	elmnt.style.marginLeft = "150px";
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
		let min = 150;
		let max = 1500;
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
