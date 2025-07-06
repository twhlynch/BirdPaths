function svgCircle(x, y, r, color, extra = "") {
	return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" ${extra} />`;
}

function svgText(x, y, text, fontSize = 16, color) {
	return `<text x="${x}" y="${y}" font-size="${fontSize}" fill="${color}" font-family="Arial" alignment-baseline="middle">${text}</text>`;
}

function svgPath(path, color, width, dash) {
	return `<path d="${path}" stroke="${color}" stroke-width="${width}" fill="none" opacity="0.7" stroke-dasharray="${dash}" stroke-linecap="round"/>`;
}

function svgElement(w, h, view, content) {
	return `<svg id="main-svg" width="${w}" height="${h}" viewBox="${view}" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
}

function buildSmoothPathS(points, level) {
	if (points.length < 2) return "";

	let d = "";

	const waveMag = (10 + 5 * level) * (magnitude / 10);

	let prevX = points[0].x + Math.sin(level * 2) * waveMag;
	let prevY = points[0].y + Math.cos(level * 2) * (waveMag * 0.6);
	d += `M ${prevX} ${prevY} `;

	for (let i = 1; i < points.length; i++) {
		const pt = points[i];
		const px = pt.x + Math.sin(level * 2) * waveMag;
		const py = pt.y + Math.cos(level * 2) * (waveMag * 0.6);

		const dx = px - prevX;
		const dy = py - prevY;
		const len = Math.sqrt(dx * dx + dy * dy) || 1;
		const nx = -dy / len;
		const ny = dx / len;
		const cpX = prevX + dx * 0.5 + nx * waveMag;
		const cpY = prevY + dy * 0.5 + ny * waveMag;

		d += `S ${cpX} ${cpY}, ${px} ${py} `;

		prevX = px;
		prevY = py;
	}

	return d;
}

function buildSmoothPathC(points, level) {
	if (points.length < 2) return "";

	let d = "";

	const waveMag = (10 + 5 * level) * (magnitude / 10);

	const getWavedPoint = (p, l) => ({
		x: p.x + Math.sin(l * 2) * waveMag,
		y: p.y + Math.cos(l * 2) * (waveMag * 0.6),
	});

	let p0 = getWavedPoint(points[0], level);
	d += `M ${p0.x} ${p0.y} `;

	for (let i = 0; i < points.length - 1; i++) {
		const p1 = getWavedPoint(points[i], level);
		const p2 = getWavedPoint(points[i + 1], level);

		let pPrev = i === 0 ? p1 : getWavedPoint(points[i - 1], level);
		let pNext = i === points.length - 2 ? p2 : getWavedPoint(points[i + 2], level);

		const cp1x = p1.x + (p2.x - pPrev.x) / 6;
		const cp1y = p1.y + (p2.y - pPrev.y) / 6;
		const cp2x = p2.x - (pNext.x - p1.x) / 6;
		const cp2y = p2.y - (pNext.y - p1.y) / 6;

		d += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y} `;
	}

	return d;
}