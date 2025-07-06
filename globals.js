let tasks = [];
let points = [];
let viewBox = [0, 0, 0, 0];
let magnitude = 5;
let modified = false;
let mode = "C";

const gradeLevels = { PA: 0, CR: 1, DI: 2, HD: 3 };
const levelNames = Object.keys(gradeLevels);