document.getElementById("add-task").addEventListener("click", e => {
	addTask();
});
document.getElementById("s").addEventListener("click", e => {
	sShape();
});
document.getElementById("line").addEventListener("click", e => {
	lineShape();
});
document.getElementById("circle").addEventListener("click", e => {
	circleShape();
});
document.getElementById("mode").addEventListener("click", e => {
	mode = mode == "C" ? "S" : "C";
	renderSVG();
});
document.getElementById("flip").addEventListener("click", e => {
	const taskContainer = document.getElementById("tasks");
	const children = Array.from(taskContainer.children);
	for (let i = children.length - 1; i >= 0; i--) {
		taskContainer.appendChild(children[i]);
	}

	getTasks();
	compute();
	computeViewbox();
	renderSVG();
});
document.getElementById("rename").addEventListener("click", e => {
	const allTasks = document.querySelectorAll(".task");
	allTasks.forEach((element, i) => {
		element.childNodes[0].value = "Task " + (i + 1);
	});

	getTasks();
	renderSVG();
});
document.getElementById("magnitude").addEventListener("input", e => {
	magnitude = e.target.value;
	e.target.setAttribute("value", Math.floor(magnitude));
	renderSVG();
});
window.addEventListener("resize", () => {
	renderSVG()
});

let draggingIdx = null, offset = [0, 0];

document.getElementById("svg-container").addEventListener("mousedown", (e) => {
	if (e.target.hasAttribute("data-idx")) {
		modified = true;
		draggingIdx = parseInt(e.target.getAttribute("data-idx"));
		const scale = Math.max(viewBox[2] / window.innerWidth, viewBox[3] / window.innerHeight);
		offset[0] = e.clientX * scale + viewBox[0] - points[draggingIdx].x;
		offset[1] = e.clientY * scale + viewBox[1] - points[draggingIdx].y;
		document.body.style.cursor = "grabbing";
	}
});

window.addEventListener("mousemove", (e) => {
	if (draggingIdx === null) {
		if (e.target.hasAttribute("data-idx")) {
			document.body.style.cursor = "pointer";
		} else {
			document.body.style.cursor = "";
		}
	}
});

window.addEventListener("mousemove", (e) => {
	if (draggingIdx !== null) {
		const scale = Math.max(viewBox[2] / window.innerWidth, viewBox[3] / window.innerHeight);
		points[draggingIdx].x = e.clientX * scale + viewBox[0] - offset[0];
		points[draggingIdx].y = e.clientY * scale + viewBox[1] - offset[1];
		document.body.style.cursor = "grabbing";
		renderSVG();
	}
});

window.addEventListener("mouseup", () => {
	if (draggingIdx !== null) {
		draggingIdx = null;
		document.body.style.cursor = "";
		computeViewbox();
		renderSVG();
	}
});