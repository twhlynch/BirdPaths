class Point {
	constructor(x, y, task) {
		this.x = x;
		this.y = y;
		this.task = task;
	}

	connections = [];
	x = 0;
	y = 0;
	task = null;
}

function getTasks() {
	tasks = [];

	document.querySelectorAll(".task").forEach(t => {
		tasks.push({
			name: t.childNodes[0].value,
			grade: t.childNodes[1].value
		});
	});

	points.forEach((p, i) => {
		if (tasks[i]) {
			p.task = tasks[i];
		}
	});

	const newParams = new URLSearchParams(window.location.search);
	if (tasks && tasks.length > 0) {
		const tasksString = tasks.map((task) => `${task.name}-${task.grade}`).join("_");
		newParams.set("tasks", tasksString);
	} else {
		newParams.delete("tasks");
	}

	const newUrl = `${window.location.pathname}?${newParams.toString()}${window.location.hash}`;
	history.pushState({ path: newUrl }, "", newUrl);
}

function addTask(name = null, grade = "PA") {
	const newTask = document.createElement("div");
	newTask.className = "task";

	const nameInput = document.createElement("input");
	nameInput.type = "text";
	nameInput.className = "name";
	nameInput.value = name || ("Task " + (tasks.length + 1));
	nameInput.size = 15;

	const gradeInput = document.createElement("select");
	gradeInput.className = "type";
	gradeInput.innerHTML = `
	<option value="PA" ${grade == "PA" ? "selected" : ""}>PA</option>
	<option value="CR" ${grade == "CR" ? "selected" : ""}>CR</option>
	<option value="DI" ${grade == "DI" ? "selected" : ""}>DI</option>
	<option value="HD" ${grade == "HD" ? "selected" : ""}>HD</option>`;

	const deleteButton = document.createElement("button");
	deleteButton.className = "delete";
	deleteButton.innerHTML = "&times;";

	newTask.appendChild(nameInput);
	newTask.appendChild(gradeInput);
	newTask.appendChild(deleteButton);

	nameInput.addEventListener("input", e => {
		getTasks();
		computeViewbox();
		renderSVG();
	});
	gradeInput.addEventListener("input", e => {
		getTasks();
		computeViewbox();
		renderSVG();
	});
	deleteButton.addEventListener("click", e => {
		points.splice(Array.from(newTask.parentNode.children).indexOf(newTask), 1);
		newTask.remove();
		getTasks();
		computeViewbox();
		renderSVG();
	});

	document.getElementById("tasks").appendChild(newTask);

	getTasks();
	if (modified) {
		computeNewPoint();
	} else {
		compute();
	}
	computeViewbox();
	renderSVG();
}

function computeNewPoint() {
	const newTask = tasks[tasks.length - 1];
	const lastPoint = points[points.length - 1];
	points.push(new Point(lastPoint.x, lastPoint.y + 100, newTask));
}

function compute() {
	points.length = 0;

	const tasksByLevel = [[], [], [], []];
	for (const task of tasks) {
		const level = gradeLevels[task.grade];
		tasksByLevel[level].push(task);
	}

	const marginY = 100, marginX = 120, startY = 100;
	const centerX = Math.floor(levelNames.length / 2) * marginX + 200;

	let y = startY;
	for (let i = 0; i < tasks.length; i++) {
		const task = tasks[i];
		const level = gradeLevels[task.grade];
		const point = new Point(centerX + (level - 1.5) * marginX, y, task);
		points.push(point);
		y += marginY;
	}
}

function renderSVG() {
	const pointsByLevel = [[], [], [], []];
	for (const point of points) {
		const level = gradeLevels[point.task.grade];
		pointsByLevel[level].push(point);
	}

	let svgContent = "";

	for (let level = pointsByLevel.length - 1; level >= 0; level--) {
		let pts = [];
		for (let l = 0; l <= level; l++) {
			pts = pts.concat(pointsByLevel[l]);
		}
		if (pts.length < 2) continue;

		pts.sort((a, b) => points.indexOf(a) - points.indexOf(b));

		const d = mode == "C" ? buildSmoothPathC(pts, level) : buildSmoothPathS(pts, level);
		const colors = ["#1E2B39", "#514037", "#A18E6A", "#CEAB7D"];
		const widths = [10, 5, 5, 5];
		const strokes = ["none", "10,10", "5,8", "1,10"];
		const i = level % colors.length;
		svgContent += svgPath(d, colors[i], widths[i], strokes[i]);
	}

	points.forEach((point, i) => {
		svgContent += svgCircle(point.x, point.y, 10, "black", `data-idx="${i}"`);
		if (point.task) {
			svgContent += svgText(point.x + 15, point.y - 10, point.task.name || "", 16, "black");
			svgContent += svgText(point.x + 15, point.y + 10, point.task.grade, 16, "black");
		}
	});

	document.getElementById("svg-container").innerHTML = svgElement(window.innerWidth, window.innerHeight, viewBox.join(" "), svgContent);
}

function computeViewbox() {
	let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
	points.forEach(pt => {
		if (pt.x < minX) minX = pt.x;
		if (pt.y < minY) minY = pt.y;
		if (pt.x > maxX) maxX = pt.x;
		if (pt.y > maxY) maxY = pt.y;
	});
	minX -= 100;
	minY -= 100;
	maxX += 100;
	maxY += 100;
	viewBox = [minX, minY, maxX - minX, maxY - minY];
}

function lineShape() {
	const numPoints = points.length;
	for (let i = 0; i < numPoints; i++) {
		points[i].x = 0;
		points[i].y = i * 100;
	}

	computeViewbox();
	renderSVG();
}

function sShape() {
	const numPoints = points.length;
	const amplitude = 40 * numPoints;
	const width = 80 * numPoints;

	for (let i = 0; i < numPoints; i++) {
		const t = i / (numPoints - 1);
		points[i].x = amplitude * Math.sin(t * Math.PI * 3 - Math.PI / 2);
		points[i].y = width * (1 - t);
	}

	computeViewbox();
	renderSVG();
}

function circleShape() {
	const numPoints = points.length;
	const radius = 40 * numPoints;

	for (let i = 0; i < numPoints; i++) {
		const angle = (i / numPoints) * Math.PI * 2;
		points[i].x = radius * Math.cos(angle);
		points[i].y = radius * Math.sin(angle);
	}

	computeViewbox();
	renderSVG();
}

const params = new URLSearchParams(window.location.search);
const tasksString = params.get("tasks");

if (tasksString) {
	tasksString.split("_").forEach((task) => {
		const [name, grade] = task.split("-");
		addTask(name, grade);
	});
} else {
	for (let i = 0; i < 4; i++) {
		addTask();
	}
}