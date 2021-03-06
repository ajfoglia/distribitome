//Ball and Urn Experiment
var runID, stepID;
var runCount = 0, stopCount = 0, stopFreq = 10;
var currentRecord, completeRecord = "", header = "Run\tY\tU\tV";
var dist, distCanvas, distGraph, mParam, nParam, rParam;
var recordTable, distTable;
var runButton, stepButton, runImage, distCanvas, stopSelect, replaceSelect, showCheck;
var m = 50, r = 25, n = 10, N = 50, type = 0;
var ball = new Array(N);
var pop = new Array(m);
var y, u, v, s;

function initializeExperiment(){
	runButton = document.getElementById("runButton");
	stepButton = document.getElementById("stepButton");
	recordTable = document.getElementById("recordTable");
	distCanvas = document.getElementById("distCanvas");
	distTable = document.getElementById("distTable");
	stopSelect = document.getElementById("stopSelect");
	stopSelect.value = "10";
	replaceCheck = document.getElementById("replaceCheck");
	replaceCheck.checked = false;
	showCheck = document.getElementById("showCheck");
	showCheck.checked = true;
	for (var i = 0; i < N; i++) ball[i] = new Ball(document.getElementById("ball" + i));
	for (var i = 0; i < m; i++) pop[i] = i + 1;
	mParam = new Parameter(document.getElementById("mInput"), document.getElementById("mLabel"));
	mParam.setProperties(1, 100, 1, m, "<var>m</var>");
	nParam = new Parameter(document.getElementById("nInput"), document.getElementById("nLabel"));
	nParam.setProperties(1, N, 1, n, "<var>n</var>");
	rParam = new Parameter(document.getElementById("rInput"), document.getElementById("rLabel"));
	rParam.setProperties(1, m, 1, r, "<var>r</var>");
	resetExperiment();
}

function stepExperiment(){
	stepButton.disabled = true;
	runButton.disabled = true;
	s = sample(pop, n, type);
	y = 0;
	count = 0;
	for (var i = 0; i < N; i++){
		if (i < n) ball[i].setValue(-1);
		else ball[i].setValue(-2);
	}
	stepID = setInterval(selectBall, 50);
}

function runExperiment(){
	runID = setInterval(selectBalls, 20);
	stepButton.disabled = true;
	stopSelect.disabled = true;
}

function stopExperiment(){
	stopCount = 0;
	clearInterval(runID);
	clearInterval(stepID);
	stepButton.disabled = false;
	runButton.disabled = false;
	stopSelect.disabled = false;
	if (runCount > 0) recordTable.value = header + completeRecord;
}

function resetExperiment(){
	stopExperiment();
	runCount = 0; stopCount = 0;
	for (var i = 0; i < N; i++){
		if (i < n) ball[i].setValue(-1);
		else ball[i].setValue(-2);
	}
	completeRecord = "";
	recordTable.value = header;
	if (type == 0) dist = new HypergeometricDistribution(m, r, n);
	else dist = new BinomialDistribution(n, r / m);
	distGraph = new DistributionGraph(distCanvas, dist, "Y");
	distGraph.showDist(showCheck.checked);
	distTable.value = distGraph.text;
}

function setPopulation(){
	m = mParam.getValue();
	pop = new Array(m);
	for (var i = 0; i < m; i++) pop[i] = i + 1;
	if (type == 0) nParam.setProperties(1, Math.min(m, N), 1, Math.min(n, m), "<var>n</var>");
	else nParam.setProperties(1, N, 1, n, "<var>n</var>");
	n = nParam.getValue();	
	rParam.setProperties(1, m, 1, Math.round(m / 2), "<var>r</var>");
	r = rParam.getValue();
	resetExperiment();
}

function setSample(){
	n = nParam.getValue();
	resetExperiment();
}

function setReds(){
	r = rParam.getValue();
	resetExperiment();
}

function setType(){
	if (replaceCheck.checked) type = 1; else type = 0;
	if (type == 0) nParam.setProperties(1, Math.min(m, N), 1, Math.min(n, m), "n");
	else nParam.setProperties(1, N, 1, n, "<var>n</var>");
	n = nParam.getValue();
	resetExperiment();
}

function selectBalls(){
	stopCount++;
	s = sample(pop, n, type);
	y = 0;
	for (var i = 0; i < n; i++){
		if (s[i] <= r) {
			y++;
			ball[i].ballColor = "red";
		}
		else ball[i].ballColor = "green";
		ball[i].setValue(s[i]);
	}
	update();
	recordTable.value = header + "\n" + currentRecord;
	if (stopCount == stopFreq) stopExperiment();
}

function selectBall(){
	if (count < n){
		if (s[count] <= r){
			ball[count].ballColor = "red";
			y++;
		}
		else ball[count].ballColor = "green";
		ball[count].setValue(s[count]);
		count++;
	}
	else{
		update();
		stopExperiment();
	}
}

function update(){
	runCount++;
	u = m * y / n;
	if (y > 0) v = n * r / y; else v = Infinity;
	currentRecord = runCount + "\t" + y + "\t" + u.toFixed(1) +"\t" + v.toFixed(1);
	completeRecord = completeRecord + "\n" + currentRecord;
	dist.setValue(y);
	distGraph.draw();
	distTable.value = distGraph.text;
}

function showDist(b){
	distGraph.showDist(b);
	distTable.value = distGraph.text;
}

//The hypergeometric distribution
function HypergeometricDistribution(m, r, n){
	//Properties
	this.type = 0;
	this.minValue = Math.max(0, n - (m - r));
	this.maxValue = Math.min(n, r);
	this.step = 1;
	this.data = new Data(this.minValue, this.maxValue, this.step);
	
	//Methods
	this.density = function(x){
		var k = Math.round(x);
		return binomial(r, k) * binomial(m - r, n - k) / binomial(m, n);
	}
	
	this.mode = function(){
		return Math.floor((r + 1) * (n + 1) / (m + 2));
	}
	
	this.maxDensity = function(){
		return this.density(this.mode());
	}
		
	this.mean = function(){
		return n * (r / m);
	}
	
	this.variance = function(){
		return n * (r / m) * (1 - r / m) * (m - n) / (m - 1);
	}		
}

HypergeometricDistribution.prototype = new Distribution;
