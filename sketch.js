const canvas_w = 512;
const canvas_h = 512;

const n_pts = 30;

let min_r = 150;
let max_r = 250;

let ra = 0;

let audio = null;
let mic = null;
let audio_is_loaded = false;
let mic_is_loaded = false;
let amp;
let fft;
let vol;

let t = 0;
let shrinking = true;

const bg_color = 20
const circle_fill = 0
const circle_stroke = 255

function handle_file(file) {
  if (audio_is_loaded) {
    audio.stop();
    audio = null;
    audio_is_loaded = false;
  }

  if (file.type === 'audio') {
    audio = loadSound(file.data, start_uploaded_audio);
  } else {
    audio = null;
    audio_is_loaded = false;
  }
}

function start_uploaded_audio() {
  audio_is_loaded = true;

  audio.loop();
  amp = new p5.Amplitude();

  background(bg_color);

  t = 0;
  min_r = 150;
  max_r = 250;
}

function start_mic_audio() {
  if (mic_is_loaded) {
    mic_is_loaded = false;
    use_mic_btn.html('Use mic audio input');
  } else {
    mic_is_loaded = true;

    mic = new p5.AudioIn();
    mic.start();

    background(bg_color);

    t = 0;
    min_r = 150;
    max_r = 250;

    use_mic_btn.html('Stop mic');
  }
}

function setup() {
  createCanvas(canvas_w, canvas_h);
  userStartAudio();

  upload_btn = createFileInput(handle_file);
  upload_btn.position(0, 513);

  use_mic_btn = createButton('Use mic audio input');
  use_mic_btn.position(0, 550);
  use_mic_btn.mousePressed(start_mic_audio);

  background(bg_color);
  stroke(circle_stroke);
  strokeWeight(1);

  fill(circle_fill);
}

function draw() {
  translate(width / 2, height / 2);
  rotate(ra);
  ra += 0.01;
  t++;

  if (audio_is_loaded) {
    vol = amp.getLevel();
  } else if (mic_is_loaded) {
    vol = mic.getLevel();
  } else {
    vol = 0.2;
  }

  if (shrinking) {
    const dr = map(vol, 0, 1, -0.01, -4);

    min_r += dr;
  	max_r += dr;

    min_r = constrain(min_r, 0, 150);
    max_r = constrain(max_r, 0, 250);

    strokeWeight(map(min_r + max_r, 0, 400, 0.5, 1, true));

    if (min_r <= 5 && max_r <= 10) {
      shrinking = false;
    }
  } else {
    const dr = map(0.2, 0, 1, 0.01, 4);

    min_r += dr;
    max_r += dr * 2;
    min_r = constrain(min_r, 0, 150);
    max_r = constrain(max_r, 0, 250);

    strokeWeight(map(min_r + max_r, 0, 400, 0.5, 1, true));

    if (min_r == 150 && max_r == 250) {
      shrinking = true;
    }
  }

  let pts = [];
  for (let i = 0; i < n_pts; i++) {
  	let a = map(i, 0, n_pts, 0, TWO_PI);

  	if (a >= TWO_PI) {
  		a -= TWO_PI;
  	}

  	let r = noise(a, t * 0.05, vol * 3);
  	r = map(r, 0, 1, min_r, max_r);

  	const x = cos(a) * r;
  	const y = sin(a) * r;

  	const pt = createVector(x, y);
  	pts.push(pt);
  }

  const n = round(pts.length / 2);
 	const og_pts = pts.slice();
  pts = og_pts.slice(n, og_pts.length);
  pts.push(...og_pts.slice(0, n));

  beginShape();
  curveVertex(pts[0].x, pts[0].y);
  for (const pt of pts) {
  	curveVertex(pt.x, pt.y);
  }
  curveVertex(pts[0].x, pts[0].y);
  curveVertex(pts[0].x, pts[0].y);
  endShape();
}
