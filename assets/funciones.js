// ****** GAME LOOP ********//

var time = new Date();
var deltaTime = 0;

if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(Init, 1);
} else {
    document.addEventListener("DOMContentLoaded", Init);
}

function Init() {
    time = new Date();
    Start();
    Loop();
}

function Loop() {
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    Update();
    requestAnimationFrame(Loop);
}

// ****** GAME LOGIC ********//

var sueloY = 22;
var velocidadY = 0;
var salto = 900;
var gravedad = 2500;

var dinoX = 42;
var dinoPositionY = sueloY;

var sueloX = 0;
var velocidadEscenario = 1280 / 3;
var velocidadJuego = 1;
var score = 0;

var parado = false;
var saltando = false;

var tiempoHastaObstaculo = 2;
var tiempoObstaculoMin = 0.7;
var tiempoObstaculoMax = 1.8;
var obstaculoPosY = 16;
var obstaculos = [];

var tiempoHastaNube = 0.5;
var tiempoNubeMin = 0.7;
var tiempoNubeMax = 2.7;
var maxNubeY = 270;
var minNubeY = 100;
var nubes = [];
var velocidadNube = 0.5;

var contenedor;
var dino;
var textoScore;
var suelo;
var gameOver;

function Start() {
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    dino = document.querySelector(".dino");
    document.addEventListener("keydown", HandleKeyDown);
}

function Update() {
    if (parado)
        return;
    MoverDinosaurio();
    MoverSuelo();
    DecidirCrearObstaculos();
    DecidirCrearNubes();
    MoverObstaculos();
    MoverNubes();
    DetectarColision();
    velocidadY -= gravedad * deltaTime;
}

function HandleKeyDown(ev) {
    if (ev.keyCode == 32) {
        Saltar();
    }
}

function Saltar() {
    if (dinoPositionY === sueloY) {
        saltando = true;
        velocidadY = salto;
        dino.classList.remove("dino-corriendo");
    }
}

function MoverDinosaurio() {
    dinoPositionY += velocidadY * deltaTime;
    if (dinoPositionY < sueloY) {

        TocarSuelo();
    }
    dino.style.bottom = dinoPositionY + "px";
}

function TocarSuelo() {
    dinoPositionY = sueloY;
    velocidadY = 0;
    if (saltando) {
        dino.classList.add("dino-corriendo");
    }
    saltando = false;
}

function MoverSuelo() {
    sueloX += CalcularDesplazamiento();
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

function CalcularDesplazamiento() {
    return velocidadEscenario * deltaTime * velocidadJuego;
}

function fail() {
    dino.classList.remove("dino-corriendo");
    dino.classList.add("dino-fail");
    parado = true;
}

function DecidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime;
    if (tiempoHastaObstaculo <= 0) {
        CrearObstaculo();
    }
}

function DecidirCrearNubes() {
    tiempoHastaNube -= deltaTime;
    if (tiempoHastaNube <= 0) {
        CrearNube();
    }
}

function CrearObstaculo() {
    var obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("cactus");
    if (Math.random() > 0.5)
        obstaculo.classList.add("cactus2");
    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = contenedor.clientWidth + "px";
    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin) / velocidadJuego;
}

function CrearNube() {
    var nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth;
    nube.style.left = contenedor.clientWidth + "px";
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY - minNubeY) + "px";
    nubes.push(nube);
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax - tiempoNubeMin) / velocidadJuego;
}

function MoverObstaculos() {
    for (var i = obstaculos.length - 1; i >= 0; i--) {
        if (obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
            GanarPuntos();
        } else {
            obstaculos[i].posX -= CalcularDesplazamiento();
            obstaculos[i].style.left = obstaculos[i].posX + "px";
        }
    }
}

function MoverNubes() {
    for (var i = nubes.length - 1; i >= 0; i--) {
        if (nubes[i].posX < - nubes[i].clientWidth) {
            nubes[i].parentNode.removeChild(nubes[i]);
            nubes.splice(i, 1);
        } else {
            nubes[i].posX -= CalcularDesplazamiento() * velocidadNube;
            nubes[i].style.left = nubes[i].posX + "px";
        }
    }
}

function GanarPuntos() {
    score++;
    textoScore.innerText = score;
    if (score == 10) {
        velocidadJuego = 1.5;
    } else if (score == 30) {
        velocidadJuego = 2;
    } else if (score == 50) {
        velocidadJuego = 3;
    }
    suelo.style.animationDuration = (3 / velocidadJuego) + "s";
}

function GameOver() {
    fail();
    gameOver.style.display = "block";
}

function DetectarColision() {
    for (var i = 0; i < obstaculos.length; i++) {
        if (obstaculos[i].posX > dinoX + dino.clientWidth) { // EVADE
            break; // al estar en orden, no puede chocar con más
        } else {
            if (IsCollision(dino, obstaculos[i], 10, 30, 15, 20)) {
                if(confirm('¿Quieres jugar de nuevo?')){
                    window.location.reload();  
                }
                else {
                    GameOver();
                }
            }
        }
    }
}

function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(((aRect.top + aRect.height - paddingBottom) < (bRect.top)) || (aRect.top + paddingTop > (bRect.top + bRect.height)) || ((aRect.left + aRect.width - paddingRight) < bRect.left) || (aRect.left + paddingLeft > (bRect.left + bRect.width)));
}
