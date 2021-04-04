let teapot;
let plate;
let setScene = -1;
let time = 0;
let robotoBlack;
let robotoLight;
let colorNoise;
let noff = 0;
let textureImg;
let xValue = 175;
let yValue = 180;
let zValue = 0;
let sumX = 0;
let sumY = 0;
let sumZ = 0;
let smoothingFactor = 0.25;
let colorPicker;
let mySoundTime = 0;
let resetBtn;
let changeBtn;
let changeCol = 0;
let isChange = false;
let screenSizeChange;

function preload() {
  soundFormats('mp3');
  mySound = loadSound('./assets/The_most_powerful_Teapot_ever');
  teapot = loadModel('assets/teapot.obj');
  plate = loadModel('assets/plate.obj');
  visibleLight = loadImage('assets/lights.png');
  robotoBlack = loadFont('assets/robotoBlack.ttf');
  robotoLight = loadFont('assets/robotoLight.ttf');
}

function setup() {
  frameRate(60);
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(HSB, 360, 100, 100);
  fft = new p5.FFT();
  osc = new p5.Oscillator('sine');
  osc.start();
  osc.amp(0); // silent at first.
  slider = createSlider(0, 0.7, 0.35, 0.1);
  colorPicker = createColorPicker('#ffffff');
  resetBtn = createButton('RESET');
  changeBtn = createButton('CHANGE');

  textAlign(CENTER, BOTTOM);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {

  noff = noff + 0.01;
  colorNoise = int(map(noise(noff),0,1,0,100));

  if (width < 1000) {
    
  }

  if (mySound.isPlaying() == false && setScene == -1 && mouseIsPressed) {
    mySound.loop();
    setScene = 0;
  }

  if (setScene > -1) {
    if (time < 10) {
      time = time + 1;
    }
    
    slider.position(width/2-120, height-50);
    slider.style('width', '120px');
    mySound.setVolume(slider.value());
  }

  switch (setScene) {
      case -1:
        background(0);
        textSize(width/40);
        textAlign(CENTER);
        textFont(robotoBlack);
        text("Press your mouse to get started.", 0, -1);
        break;

      case 0 :
        background(0);
        push();
        fill(50,100,100);
        textAlign(CENTER);
        textFont(robotoBlack);
        text("Loading...", 0, -1);
        pop();
        if (time == 10) {
          setScene = 1;
        }
        break;


      case 1:
        background(colorNoise * 0.1);
        push();
        image(visibleLight, mouseX-width/2-50, mouseY-height/2-50, 100, 100);
        pop();
        colorPicker.position(width/2-50, height/2-100);
        resetBtn.position(width/2-75, height/2-500);
        resetBtn.mousePressed(reset);
        changeBtn.position(width/2-75, height/2-550);
        changeBtn.mousePressed(change);
        slider.style('width', '180px');
        let locX = mouseX - height / 2;
        let locY = mouseY - width / 2;
        
        if (isChange){
          changeCol = random(100);
          ambientLight(32.9, 12.16, 50);
          pointLight(int(changeCol*3.6), changeCol, changeCol, locX, locY, 100);
        } else {
          ambientLight(32.9, 12.16, 60);
          pointLight(32.9, 12.16, 50, locX, locY, 100);
        }


        push();
        textAlign(CENTER);
        textFont(robotoLight);
        textSize(24);
        noLights();
        fill(0,0,50);
        text("Move your iTeapot with your Keyboard and Mouse", 0,-400);
        pop();

        //For smoothing movement
        sumX += (radians(xValue) - sumX) * smoothingFactor;
        sumY += (radians(yValue) - sumY) * smoothingFactor;
        sumZ += (radians(zValue) - sumZ) * smoothingFactor;




        push();
        normalMaterial();
        specularMaterial(colorPicker.color());
        scale(20); // Scaled to make model fit into canvas
        noStroke();
        rotateX(sumX + HALF_PI); // without HALF_PI, teapot looks weird.
        rotateY(sumY);
        rotateZ(sumZ);
        model(teapot);
        pop();

        push();
        scale(10);
        specularMaterial(20);
        rotateY(sumZ); // the plate obj file is different from teapot
        rotateX(sumX);
        rotateZ(sumY);
        model(plate);
        pop();

        for (let x = 0; x < width; x+= width / 20) {
          for(let y = 0; y < height; y += height / 10) {
          push();
          
          specularMaterial(10);
          scale(2); // Scaled to make model fit into canvas
          noStroke();
          rotateX(sumX + HALF_PI); // without HALF_PI, teapot looks weird.
          rotateY(sumY);
          rotateZ(sumZ);
          translate(x-width/2+100, y-height/2+100);
          model(teapot);
          pop();
          }
        }

        push();
        let spectrum = fft.analyze();

        noStroke();
        if (mySound.isLooping()){
          for (let i = 0; i< spectrum.length; i++){
            fill(360, 100, colorNoise*1.5);
            let x = map(i, 0, spectrum.length, 0, width);
            let h = -height + map(spectrum[i], 0, 255, height, 0);
            rect(x-width/2, height, width / spectrum.length, h*1.3);
            rect(abs(x-width/2), height, width / spectrum.length, h*1.3);
          }
        } else {
          for (let i = 0; i< spectrum.length; i++){
            fill(210, 100, colorNoise*1.5);
            let x = map(i, 0, spectrum.length, 0, width);
            let h = -height + map(spectrum[i], 0, 255, height, 0);
            rect(x-width/2, 0, width / spectrum.length, -h);
            rect(abs(x-width/2), 0, width / spectrum.length, -h);
          }
        }
        pop();
        

        if ((140 < xValue) && (xValue < 220) && (140 < yValue) && (yValue < 220)) {
          osc.stop();
          if(!mySound.isLooping())
          mySound.loop();
          } else {
          osc.start();
          osc.amp(0.05);
          let freq = map(abs(180 - xValue) + abs(180 -  yValue), 0, 360, 20.0, 12000.0);
          osc.freq(freq);
          mySound.pause();
          }
      break;
  }
}

function keyPressed() {
 
  if (keyCode === RIGHT_ARROW) {
    yValue += 5;
  } else if (keyCode === LEFT_ARROW) {
    yValue -= 5;
  } else if (keyCode === UP_ARROW) {
    xValue += 5;
  } else if (keyCode === DOWN_ARROW) {
    xValue -= 5;
  }
}

function keyReleased() {
 
  if (keyCode === RIGHT_ARROW) {
    yValue += 5;
  } else if (keyCode === LEFT_ARROW) {
    yValue -= 5;
  } else if (keyCode === UP_ARROW) {
    xValue += 5;
  } else if (keyCode === DOWN_ARROW) {
    xValue -= 5;
  }
}

function reset() {
  xValue = 175;
  yValue = 180;
  zValue = 0;
  changeCol = 0;
  isChange = false;
}

function change() {
 if (isChange === false) {
  isChange = true;

 } else {
   changeCol = 0;
   isChange = false;
 }
}