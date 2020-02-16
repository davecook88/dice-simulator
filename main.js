class Dice {
    constructor(type, color = 0xb50004) {
        this.color = color;
        this.type = type;
        this.spin = false;
        this.showAnswer = false;
        this.axes = {
            x: Math.random() * 10,
            y: Math.random() * 10,
            z: Math.random() * 10
        };
        
        this.geometry = this.createGeometry(type)
        this.element = this.createDice();
    }
    shapes = {
        4: THREE.TetrahedronGeometry,
        6: THREE.BoxGeometry,
        8: THREE.OctahedronGeometry,
        10: this.createD10,
        12: THREE.DodecahedronGeometry,
        20: THREE.IcosahedronGeometry,
    }
    finalStates = {
        4: {
            x:0.9,
            y:-0.8,
            z:-0.2
        },
        6: {
            x:0,
            y:0,
            z:0
        },
        8: {
            x:0.5,
            y:0.8,
            z:0
        },
        10: {
            x:-0.6,
            y:-1.9,
            z:0
        },
        12: {
            x:1,
            y:0.7,
            z:0.3
        },
        20: {
            x:0.18,
            y:-0.12,
            z:-0.085
        }
    }
    createGeometry(type){
        let geometry;
        if (type == 6) {
            geometry = new this.shapes[type](500, 500, 500, 10, 10, 10);             
        } else if (type == 10) {
            geometry = this.shapes[type]();
        } else {
            geometry = new this.shapes[type](500);  
        }
        return geometry;
    }

    createDice(){
        const material = new THREE.MeshPhongMaterial({
            color: this.color,
            wireframe: false,
            opacity: 0.8,
            side: THREE.DoubleSide,
            vertexColors:THREE.FaceColors,
            flatShading: true,
        });    

        const dice = new THREE.Mesh(this.geometry, material);

        return dice;
    }

    updateElementRotation() {
        for (let a in this.axes){
            this.element.rotation[a] = this.axes[a];
        }
    }

    reduceRotationAllAxes(speed) {
        let stopSpinning = true;     
        for (let a in this.axes){
            let axis = this.axes[a];
            const finalState = this.finalStates[this.type][a];
            let difference = (axis - finalState) / 75;
            if (difference < 0.005) difference = 0.005
            if (axis - difference > finalState) {
                this.axes[a] = axis - difference;
            } else {
                this.axes[a] = finalState;
            }
            if (this.axes[a] != finalState) stopSpinning = false;
        }
        this.updateElementRotation();
        this.spin = !stopSpinning;
        this.showAnswer = stopSpinning;
    }
    createCanvas() {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = 100;
        ctx.canvas.height = 100;
        ctx.fillStyle = '#FFF';
        ctx.font = "150px Arial";
        ctx.fillText("1",50,50);
        // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const texture = new THREE.CanvasTexture(ctx.canvas);
        return texture;
    }

    createD10() {
        let vertices = [];
        
        vertices.push(...[0, 0, -1]);
        for (let i = 0, b = 0; i < 10; ++i, b += Math.PI * 2 / 10) {
            vertices.push(...[Math.cos(b), Math.sin(b), 0.105 * (i % 2 ? 1 : -1)]);
        }      
        vertices.push(...[0, 0, 1]);        

        const faces = [
            1,2,11, 2,3,11, 3,4,11, 4,5,11, 5,6,11, 6,7,11, 7,8,11, 8,9,11, 9,10,11, 10,1,11, 
            1,2,0, 2,3,0, 3,4,0, 4,5,0, 5,6,0, 6,7,0, 7,8,0, 8,9,0, 9,10,0, 10,1,0
            ];

        return new THREE.PolyhedronGeometry(vertices, faces, 500, 0);
    }

    
}

class DiceScene{
    constructor(parentElement, diceType, result=1, id=0){
        this.id = id,
        this.result = result,
        this.parent = parentElement;
        this.type = diceType;
        this.scene = this.createScene();
        this.camera = this.createCamera();
        this.renderer = this.createRenderer();        
        this.canvasBox = this.createCanvasBox();
        this.resultText = this.canvasBox.firstElementChild;
        this.canvasBox.append(this.renderer.domElement);
        this.dice = new Dice(diceType);
        this.scene.add(this.dice.element);

    }
    createCanvasBox() {
        const canvasBox = document.createElement('div');
        canvasBox.classList = "canvas-box";
        canvasBox.setAttribute('id', `canvas-box-${this.id}`);
        const text  = document.createElement('h1');
        text.classList = `text-result d${this.type} `;
        text.innerText = this.result;
        canvasBox.append(text);
        this.parent.append(canvasBox);
        return canvasBox;
    }
    createCamera() {
        let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.z = 800;
        return camera;
    }
    createRenderer(){
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(200, 200);
        renderer.domElement.id = 'dice-canvas';
        return renderer;
    }
    createScene() {
        let scene = new THREE.Scene();
        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
        directionalLight.position.x = -5000;
        var bottomLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
        bottomLight.position.x = 500;
        bottomLight.position.z = 500;
        scene.background = new THREE.Color( 0xffffff );
        scene.add(directionalLight);
        scene.add(bottomLight);
        return scene;
    }

    setResult(result) {
        this.result = result;
        this.resultText.innerText = this.result;
    }

    showResult() {
        let classList = this.resultText.classList.value;
        if (classList.indexOf('show-result') === -1) {
            this.resultText.classList.add('show-result');
        }
    }

    render = () => {
        requestAnimationFrame(this.render);
        this.renderer.render(this.scene, this.camera);
        if (this.dice.spin) {
            this.dice.reduceRotationAllAxes();
        } else {
            if (this.dice.showAnswer) this.showResult();
        }
    }
}
const sceneD6 = new DiceScene(document.body,6);
const sceneD4 = new DiceScene(document.body,4);
const sceneD8 = new DiceScene(document.body,8);
const sceneD10 = new DiceScene(document.body,10);
const sceneD12 = new DiceScene(document.body,12);
const sceneD20 = new DiceScene(document.body,20);

const scenes = [sceneD4,sceneD6,sceneD8,sceneD10,sceneD12,sceneD20]
scenes.forEach(scene => {
    scene.render();
})

const startRolling = () =>{
    scenes.forEach(scene => {
        scene.dice.spin = true;
    })
}