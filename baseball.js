"use strict"

var container;
var raycaster;

// three.js
var camera, scene, renderer, loader;
var batMesh, ballMesh, swinging, doneSwinging, downSwing, canHit, hudMesh, targetMesh;
var tracker, num = 0, devMesh, menuBool, startMesh, howMesh, skip = false, howBool = false, help, helpMesh, howDiv;
var playingGame = false, pCount = 0;
var highScore = 0, hScore;


// cannon.js
var world, ball, bat, batter, walls, start, how = [];

window.onload = function init() {
    initCannon();

    menuBool = true;
    swinging = false;
    canHit = false;

    // create container for canvas
    container = document.createElement('div');
    document.body.appendChild(container);

    document.body.setAttribute("style", "font-family: \"Comic Sans MS\";");

    //this.document.body.style.backgroundImage = "url('/textures/field-sheet0.png')";

    tracker = document.createElement('p');
    tracker.setAttribute("style", "position: absolute; left: 0; top: 0; z-index: 1; font-size: 25pt; color: #444488; padding-left: 5px");
    tracker.innerHTML = "Home runs: " + num.toString();
    container.appendChild(tracker);

    hScore = document.createElement('p');
    hScore.setAttribute("style", "position: absolute; right: 0; top: -200; z-index: 1; font-size: 25pt; color: #444488; padding-right: 5px");
    hScore.innerHTML = "High Score: " + highScore.toString();
    container.appendChild(hScore);

    howDiv = document.createElement('div');
    howDiv.setAttribute("style", "position:absolute; top: 25%; left: 25%; visibility: hidden;");
    howDiv.innerHTML = "<h1>How To Play:</h1><ul><li>Move mouse to change your bat position</li><li>Click to swing</li><li>You get 20 pitches to hit as many home runs as you can. Good luck!</li></ul>";
    container.appendChild(howDiv);



    loader = new THREE.TextureLoader();

    // create camera
    camera = new THREE.PerspectiveCamera(45,
            window.innerWidth / window.innerHeight, .1, 100);
    camera.position.set(0, 0, 24);

    // create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x00aaff );

    // add lights
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    var directionalLight = new THREE.PointLight(0xffffaa, 2.0);
    directionalLight.position.set(0, 100, 225);
    scene.add(directionalLight);

    

    // create field

    // CANNON
    var fieldShape = new CANNON.Plane();
    var fieldBody = new CANNON.Body({ mass: 0 });
    fieldBody.addShape(fieldShape);
    fieldBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    fieldBody.position.set(0,-1.5,0);
    world.addBody(fieldBody);

    // THREE
    //var fieldMaterial = new THREE.MeshLambertMaterial({color: 0xccaa55 /*map: loader.load('textures/field-sheet0.png')*/,
        //side: THREE.DoubleSide });
    //var fieldGeometry = new THREE.PlaneBufferGeometry(96,96);
    //var fieldMesh = new THREE.Mesh(fieldGeometry,fieldMaterial);
    //fieldMesh.rotation.x -= Math.PI * 6.0/12.0;
    //fieldMesh.position.y -= 1.5;
    //fieldMesh.position.z -= 24;

    // Load the background texture
    var texture = THREE.ImageUtils.loadTexture( 'textures/field-sheet0.png' );
    var fieldMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(45, 45, 0),
        new THREE.MeshBasicMaterial({
            map: texture
        }));
    scene.add(fieldMesh);

    // create the three outfield walls
    var wallMaterial = new THREE.MeshLambertMaterial({color: 0x222266});
    var wallGeometry = new THREE.PlaneBufferGeometry(96,12);

    var wallShape = new CANNON.Plane();
    var wallBody = new CANNON.Body({ mass: 0 });
    fieldBody.addShape(wallShape);
    fieldBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    fieldBody.position.set(0,-1.5,0);
    world.addBody(fieldBody);

    var wallMesh1 = new THREE.Mesh(wallGeometry,wallMaterial);
    wallMesh1.position.z -= 72;
    scene.add(wallMesh1);

    var wallMesh2 = new THREE.Mesh(wallGeometry,wallMaterial);
    wallMesh2.position.z -= 64;
    wallMesh2.position.x -= 48;
    wallMesh2.rotation.y += Math.PI * 1.0 / 3.0;
    scene.add(wallMesh2);

    var wallMesh3 = new THREE.Mesh(wallGeometry,wallMaterial);
    wallMesh3.position.z -= 64;
    wallMesh3.position.x += 48;
    wallMesh3.rotation.y -= Math.PI * 1.0 / 3.0;
    scene.add(wallMesh3);

    //adding player1
    var texture = THREE.ImageUtils.loadTexture( 'textures/catcher1.png' );
    var player1Mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0, 3),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1
        }));
        
        player1Mesh.position.y = -0.75;
        player1Mesh.position.z = 21;
        player1Mesh.position.x = -1.75;
    scene.add(player1Mesh);

    // add bat
    var objLoader = new THREE.OBJLoader();
    objLoader.load('obj/bat/baseball_bat.obj', function(object) {
        var scale = 10.0;

        var batMaterial = new THREE.MeshPhongMaterial({color: 0xccaa55});

        object.traverse(function(child) {
            if(child instanceof THREE.Mesh) {
                child.material = batMaterial
            };
        });

        object.position.y = 0.25;
        object.position.z = 21;
        object.position.x = -1;
        object.scale.divideScalar(scale);
        object.rotation.z = Math.PI * -1.0/6.0;
        object.rotation.y = Math.PI * -2.0/3.0;

        // add to scene
        batMesh = object;
        batMesh.scale.set(0.25,0.175,0.25);
        scene.add(object);

    });

    var batShape = new CANNON.Cylinder(0.1,0.1,0.75,30);
    bat = new CANNON.Body({mass: 0});
    bat.addShape(batShape);
    bat.velocity.set(0,7.5,-20);
    bat.position.set(0,0.125,21);
    bat.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1), Math.PI * -0.5);
    bat.collisionResponse = 0;
    world.addBody(bat);

    bat.addEventListener("collide", function(e) {
        if (e.body == ball && canHit) {
            ball.velocity.x = (ball.position.z - bat.position.z) * 50;
            ball.velocity.y = (ball.position.y - bat.position.y) * 100;
            ball.velocity.z = Math.cos(Math.PI*(ball.position.x-bat.position.x))*-75;

            
        }
    });



    // add ball

    // CANNON

    var texture = THREE.ImageUtils.loadTexture( 'textures/thrower.png' );
    var throwMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0, 3),
        new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1
        }));
    scene.add(throwMesh);

    var ballShape = new CANNON.Sphere(0.075);
    ball = new CANNON.Body({ mass: 0.001 });
    ball.addShape(ballShape);
    ball.velocity.set(0,5,22);
    ball.position.set(0, 3, -10);

    // THREE
    var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
    var ballMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
    ballMesh = new THREE.Mesh( ballGeometry, ballMaterial );


    var hudGeometry = new THREE.BoxGeometry(1, 1, 0.1);
    var hudMaterial = new THREE.MeshLambertMaterial({
        map: loader.load('textures/hud.png'),
        transparent: true,
        opacity: 0.5 });
    hudMesh = new THREE.Mesh( hudGeometry, hudMaterial );
    hudMesh.position.z = 21.4;
    hudMesh.collisionResponse = 0;
    scene.add(hudMesh);

    var targetGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.02);
    var targetMaterial = new THREE.MeshLambertMaterial({
        map: loader.load('textures/target.png'),
        transparent: true,
        opacity: 0.6 });
    targetMesh = new THREE.Mesh( targetGeometry, targetMaterial );
    targetMesh.position.z = 21.5;
    scene.add(targetMesh);


    var helpGeometry = new THREE.BoxGeometry(2.20, 1.25, 0.1);
    var helpMaterial = new THREE.MeshLambertMaterial({
        map: loader.load('textures/help.png'),
        transparent: true,
        opacity: 0.5 });
    helpMesh = new THREE.Mesh( helpGeometry, helpMaterial );
    helpMesh.position.z = 22.0;
    helpMesh.collisionResponse = 0;




    var devGeometry = new THREE.BoxGeometry(1, 1);
    var devMaterial = new THREE.MeshLambertMaterial({map: loader.load('textures/bballlogo.png'), transparent: true, opacity: 1});
    devMesh = new THREE.Mesh( devGeometry, devMaterial );
    devMesh.position.z = 18.5;
    devMesh.position.y += 1.8;
    scene.add(devMesh);


    var startShape = new CANNON.Box( new CANNON.Vec3(2.04, 0.51, 0.5));
    start = new CANNON.Body({ mass: 1  });
    start.addShape(startShape);
    start.velocity.set(0,0,0);
    start.velocity.set(0,0,0);
    start.position.set(0, 2, 20);

    var startGeometry = new THREE.BoxGeometry(2.04, 1, 0.5);
    var startMaterial = new THREE.MeshPhongMaterial({ map: loader.load('textures/menuitem_start_large_trimmed.png') });
    startMesh = new THREE.Mesh( startGeometry, startMaterial );
    world.addBody(start);
    scene.add(startMesh);


    var howShape = new CANNON.Box( new CANNON.Vec3(2.04, 0.5, 0.5));
    how = new CANNON.Body({ mass: 1 });
    how.addShape(howShape);
    how.velocity.set(0,0,0);
    how.velocity.set(0,0,0);
    how.position.set(0, 0.5, 20);

    var howGeometry = new THREE.BoxGeometry(2.04, 1, 0.5);
    var howMaterial = new THREE.MeshPhongMaterial({ map: loader.load('textures/menuitem_howto_large.png') });
    howMesh = new THREE.Mesh( howGeometry, howMaterial );
    world.addBody(how);
    scene.add(howMesh);

    // create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // create raycaster
    raycaster = new THREE.Raycaster();

    // add event listeners
    document.addEventListener('mousedown', onClick);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('resize', onWindowResize, false);
    document.addEventListener('onkeydown', getPress);

    animate();
}

function getPress(event) {
    console.log(event);
    var charC = ('which' in event) ? event.charCode : event.keyCode;
    console.log(charC);
    if (charC == 82 || 114) {
        if (howBool) {
            howBool = false;
            menuBool = true;
        }
    }
}

function startGame() {

    if (!howBool) {
        if (helpMesh) {
            scene.remove(helpMesh);
            howDiv.setAttribute("style", "position: absolute; top: 25%; left: 25%; visibility: hidden;");
        }
    }

    if (menuBool) {
        scene.add(startMesh);
        scene.add(howMesh);
    }

    if (!skip && !menuBool && !howBool) {

        if (!menuBool) {
            var ballShape = new CANNON.Sphere(0.075);
            ball = new CANNON.Body({ mass: 0.001 });
            ball.addShape(ballShape);
            ball.velocity.set(Math.random()/4.0 - 0.125,5 + Math.random()/3.0,(Math.random()-.5) + 22);
            ball.position.set(0, 3, -10);

            // THREE
            var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
            var ballMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
            ballMesh = new THREE.Mesh( ballGeometry, ballMaterial );
            world.addBody(ball);
            scene.add(ballMesh);
        }

        skip = true;
        playingGame = true;
    }

    if (howBool) {
        if (start) {
            scene.remove(startMesh);
        }
        if (how) {
            scene.remove(howMesh);
        }
        scene.add(helpMesh);
        howDiv.setAttribute("style", "position: absolute; top: 25%; left: 25%; color: #ffffff;");
    }

    if (playingGame) {
        if ((ball.position.z < -64) || (Math.abs(ball.velocity.z) < 20) || (ball.position.y < -0.3 && (ball.position.z > 25 || ball.velocity.z < 0))) {
            skip = false;
            pCount++;
            scene.remove(ballMesh);

            if (ball.position.z < -64 && ball.position.y > 5.5) {
                num++;
            }

            if (pCount >= 20) {
                menuBool = true;
                skip = true;
                playingGame = false;
                pCount = 0;

                if(num > highScore) {
                    highScore = num;
                }

                start.velocity.set(0,0,0);
                start.position.set(0, 2, 20);

                how.velocity.set(0,0,0);
                how.position.set(0, 0.5, 20);
            }
        }
    }
}

function initCannon() {
    // create world
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    // set default contact material properties
    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;

    // set gravity
    world.gravity.set(0,-10,0);

    // create and add a contact material to the world
    var physicsMaterial = new CANNON.Material("slipperyMaterial");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
            physicsMaterial,
            0.0,
            0.3);
    world.addContactMaterial(physicsContactMaterial);
}

function onClick( event ) {
    if(!swinging && !doneSwinging && !menuBool && !howBool) {
        swinging = true;
        downSwing = true;

        /*scene.remove(player1Mesh);
        var texture = THREE.ImageUtils.loadTexture( 'textures/player2.png' );
            var player1Mesh = new THREE.Mesh(
                new THREE.PlaneGeometry(0, 3),
                new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 1
                }));
                
                player1Mesh.position.y = -0.75;
                player1Mesh.position.z = 21;
                player1Mesh.position.x = -1.75;
            scene.add(player1Mesh);*/
    }

    if (howBool) {
        var delay = true;
    }

    if (menuBool) {

        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX/renderer.domElement.clientWidth)*2-1;
        mouse.y = (event.clientY/renderer.domElement.clientHeight)*-2+1;
        raycaster.setFromCamera(mouse,camera);

        var intersects = raycaster.intersectObject(startMesh);

        if(intersects.length > 0) {
            menuBool = false;
            playingGame = true;
            start.position.set(0,0,40);
            how.position.set(0,0,40);
            num = 0;
        }

        intersects = raycaster.intersectObject(howMesh);
        if (intersects.length > 0 && mouse.y < -0.32) {
            howBool = true;
            menuBool = false;
        }
    }

    /*if (howBool) {
      menuBool = true;
      howBool = false;
      }*/

    if (delay) {
        menuBool = true;
        howBool = false;
    }

}

function onMouseMove( event ) {
    var mouse = new THREE.Vector2();

    if(!swinging && !menuBool && !howBool) {
        mouse.x = (event.clientX/renderer.domElement.clientWidth)*2-1;
        mouse.y = (event.clientY/renderer.domElement.clientHeight)*-2+1;
        raycaster.setFromCamera(mouse,camera);

        var intersects = raycaster.intersectObject(hudMesh);

        if(intersects.length > 0) {
            targetMesh.position.copy(intersects[0].point);
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    world.step(1.0/60.0);



    startMesh.position.copy(start.position);
    howMesh.position.copy(how.position);
    if (ballMesh && ball) {
        ballMesh.position.copy(ball.position);
    }
    bat.position.copy(targetMesh.position);
    bat.position.y -= 0.1;
    batMesh.position.set(bat.position.x - 1.1125,
            bat.position.y + 0.05,
            bat.position.z);

    if(swinging) {
        if(batMesh.rotation.y < Math.PI * 3.0/6.0) {
            if(downSwing && batMesh.rotation.z > Math.PI * -7.0/12.0) {
                batMesh.rotation.z -= Math.PI * 1.0/30.0;
            }
            else {
                downSwing = false;
                batMesh.rotation.z += Math.PI * 1.0/30.0;
            }
            batMesh.rotation.y += Math.PI * 1.0/18.0;
            if(batMesh.rotation.y < Math.PI * 5.0/12.0
                    && batMesh.rotation.y > Math.PI * -5.0/12.0) {
                canHit = true;
            }
            else {
                canHit = false;
            }
        }
        else {
            swinging = false;
            doneSwinging = true;
        }
    }

    if(doneSwinging) {
        if(batMesh.rotation.y > Math.PI * -2.0/3.0) {
            batMesh.rotation.y -= Math.PI * 1.0/30.0;
        }
        else {
            doneSwinging = false;
            batMesh.rotation.z = Math.PI * -1.0/6.0
        }
    }

    highScore = Math.max(num, highScore);
    tracker.innerHTML = "Home Runs: " + num.toString();
    hScore.innerHTML = "High Score: " + highScore.toString();

    render();
}

function render() {
    camera.lookAt(scene.position);

    startGame();

    renderer.render(scene, camera);
}
