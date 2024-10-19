function getRandValue(min, max) {
    return Math.floor(Math.random()*(max-min)+min);
}

document.addEventListener("DOMContentLoaded", function(e){
    var wellDoneTxtElt = document.getElementById("wellDoneText");
    var disksTxtElt = document.getElementById("disksText");
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext('2d');

    // rod atributes
    const rodBaseLen = 160;
    const rodsGap = 20;
    const rodWidth = 15;
    const rodHeight = 200;
    const rodsBasePos = [] // rod base positions. array of objects. each object => (.x : left x) (.y : left y) (.xm = middle x (not actuall middle, it's left of middle rod))
    // precalculating the required values for positioning the rods
    for(var i=0; i<3; i++) {
        rodLeftX = (2*rodsGap+rodBaseLen)*i+rodsGap; // x co-ord of rod's left side 
        rodLeftY = 350;
        rodMidX = rodLeftX+rodBaseLen/2-rodWidth/2; // left of middle rod
        rodsBasePos.push({x:rodLeftX, y:rodLeftY, xm: rodMidX});
    }

    const diskLen = 10; // len=2*10+rodWidth for no.1 disk  and 2*2*10+rowWidth for no.2 disk 3*2*10+rodWidth for no.3 
    const diskWidth = 15;

    function drawRods() {
        ctx.fillStyle = 'pink';

        // horizontal base disks
        for (var i=0; i<3; i++) {
            // horizontal rod
            ctx.fillRect(rodsBasePos[i].x, rodsBasePos[i].y, rodBaseLen, rodWidth);

            // vertical rod
            ctx.fillRect(rodsBasePos[i].xm, rodsBasePos[i].y-rodHeight, rodWidth, rodHeight)
        }

    }

    var nDisks = 3;
    var rod1 = [] // disks at rod 1
    for(var i=nDisks; i>0; i--) rod1.push(i);
    var rod2 = []
    var rod3 = []
    const rods = [rod1, rod2, rod3]

    // when you click and hold a disk
    var heldRod = null;
    var heldDiskVal = null; // value of disk - 1 5 2 .. (length)
    var heldRodPos = null; 

    var moves = 0

    // while animating
    var isAnimating = false
    var animTime = 1000; // (ms) animation time for each move 
    var animStartTime = null; // starting time of current animation 
    var animRod = null;  // the rod to which the current animating disk belongs to 
    var animDiskVal = null; // current animating disk value
    var animDiskPos = null; // current animating disk position
    var animDiskSrcPos = null; // current animating disk's source position (before moving) - needed to calculate current position using linear equation
    var animDiskDestPos = null; // current animating disk's target position

    function nullifyAnimAtributes() {
        isAnimating = false;
        animStartTime = null;
        animRod = null;
        animDiskVal = null;
        animDiskPos = null;
        animDiskSrcPos = null;
        animDiskDestPos = null;
    }

    const colors = ['red', 'blue', 'orange', 'yellow']
    function drawDisks() {
        for(j=0; j<rods.length; j++) {
            const rod = rods[j];
            var mid = rodsBasePos[j].xm; // x coord of left side of first vertical rod

            var len = rod.length - (j==heldRod || j==animRod); // if a disk is held, it should should be drawn at mouse position
            // if a disk is held, it will be the top of the rod, so we ignore that rod. same log if the disk is begin animated(while solving)
            for (i=0; i<len; i++) {
                ctx.fillStyle = colors[(rod[i]-1)%colors.length];
                ctx.fillRect(mid-rod[i]*diskLen, rodsBasePos[j].y-(i+1)*diskWidth, rod[i]*diskLen*2+rodWidth, diskWidth)
            }
        }
        // for held disk (click and hold to move)
        if (heldRod!=null) {
            var heldDiskTotLen = heldDiskVal*2*diskLen+rodWidth; // total disk length of the held disk
            ctx.fillStyle = colors[(heldDiskVal-1)%colors.length];
            ctx.fillRect(heldRodPos.x, heldRodPos.y, heldDiskTotLen, diskWidth);
        }
        // for animating block (while solving)
        else if (animRod != null) {
            var animDiskTotLen = animDiskVal*2*diskLen+rodWidth; // total disk length of the anim disk
            ctx.fillStyle = colors[(animDiskVal-1)%colors.length];
            ctx.fillRect(animDiskPos.x, animDiskPos.y, animDiskTotLen, diskWidth);
        }
    }
    
    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function canvasMainLoop() {
        clearCanvas();
        drawRods();
        if (isAnimating) {
            animDiskPos.x = animDiskSrcPos.x + (animDiskDestPos.x - animDiskSrcPos.x)*(Date.now()-animStartTime)/animTime;
            animDiskPos.y = animDiskSrcPos.y + (animDiskDestPos.y - animDiskSrcPos.y)*(Date.now()-animStartTime)/animTime;

            if (Date.now()-animStartTime>animTime) {
                animDiskPos.x = animDiskDestPos.x;
                animDiskPos.y = animDiskDestPos.y;
                rods[1].push(rods[0].pop());
                nullifyAnimAtributes();
            }
            console.log(animDiskPos);
        }
        drawDisks();
        requestAnimationFrame(canvasMainLoop);
    }
    canvasMainLoop();

    // moves Text element
    movesTextElt = document.getElementById("movesText")
    function updateMovesOnScreen() {
        movesTextElt.innerText = "Moves: "+moves;
    }
    function increaseMoves() {
        moves++;
        updateMovesOnScreen();
    }

    function resetGame() {
        rod1.length = 0;
        for(var i=nDisks; i>0; i--) rod1.push(i);
        rod2.length = 0;
        rod3.length = 0;

        heldRod = null;
        heldDiskVal = null;
        heldRodPos = null;

        moves = 0;
        updateMovesOnScreen();
        wellDoneTxtElt.innerText = " ";

        nullifyAnimAtributes();
    }
    document.getElementById("resetButton").onclick = resetGame;

    function updateDisksOnScreen() { // updates the no. of disks (number) on the screen
        disksTxtElt.innerHTML = "Disks: "+nDisks;
    }
    function increaseDisks() {
        nDisks = Math.min(7, nDisks+1);
        resetGame();
        updateDisksOnScreen();
    }
    function decreaseDisks() {
        nDisks = Math.max(1, nDisks-1);
        resetGame();
        updateDisksOnScreen();
    }
    document.getElementById("increaseButton").onclick = increaseDisks;
    document.getElementById("decreaseButton").onclick = decreaseDisks;

    function isPointInRect(mx, my, left, top, width, height) {
        return mx >= left && mx <= left + width && my >= top && my <= top + height;
    }

    function getRodFromXval(x) { // on which rod is the mouse placed. 
        if (x<0) return 0;
        if (x>=canvas.width) return 2;
        return Math.trunc(x/200);
    }

    function isDiskStackableOnRod(diskVal, rod) { // check if the disk can put on top at the given rod
        // rod is an array
        if (rod.length === 0) return true;
        if (rod.at(-1) > diskVal) return true;
        return false;
    }
    
    function isGameComplete() { // checks whether the game is completed
        if (rods[0].length==0 && rods[1].length==0 && rods[2].length==nDisks) return true;
        return false;
    }

    canvas.addEventListener("mousedown", function(e) {
        if (isAnimating) return;
        var mx = e.clientX - canvas.getBoundingClientRect().left;
        var my = e.clientY - canvas.getBoundingClientRect().top;
        console.log(mx, my);
        for (var i=0; i<rods.length; i++) {
            const rod = rods[i];
            if (isPointInRect(mx, my,
                rodsBasePos[i].xm - rod.at(-1)*diskLen,  rodsBasePos[i].y - rod.length*diskWidth,
                2*rod.at(-1)*diskLen+rodWidth,  diskWidth))
            {
                heldRod = i;
                heldDiskVal = rod.at(-1);
                var heldDiskTotLen = heldDiskVal*2*diskLen+rodWidth; // total disk length of the held disk
                heldRodPos = {x: mx-heldDiskTotLen/2, y:my-diskWidth/2};
                break;
            }
        }
    })

    canvas.addEventListener("mousemove", function(e) {
        if (isAnimating) return;
        var mx = e.clientX - canvas.getBoundingClientRect().left;
        var my = e.clientY - canvas.getBoundingClientRect().top;
        if (heldRod != null) {
            var heldDiskTotLen = heldDiskVal*2*diskLen+rodWidth; // total disk length of the held disk
            heldRodPos = {x: mx-heldDiskTotLen/2, y:my-diskWidth/2};
        }
    })

    canvas.addEventListener("mouseup", function(e) {
        if (isAnimating) return;
        var mx = e.clientX - canvas.getBoundingClientRect().left;
        var my = e.clientY - canvas.getBoundingClientRect().top;
        if (heldRod === null) return;

        destRod = getRodFromXval(mx); // destination rod
        if (isDiskStackableOnRod(heldDiskVal, rods[destRod])) {
            rods[destRod].push(rods[heldRod].pop());
            increaseMoves();
            if (isGameComplete()) {
                wellDoneTxtElt.innerText = "Well Done!";
            }
        }

        heldRod = null;
        heldDiskVal = null;
        heldRodPos = null;
    })

    document.addEventListener("keydown", function(e){
        if (e.key === "Enter") {
            debugger;
            isAnimating = true;
            animStartTime = Date.now();
            animRod = 0;
            animDiskVal = rods[animRod].at(-1);
            animDiskSrcPos = {x: rodsBasePos[animRod].xm-animDiskVal*diskLen, 
                            y: rodsBasePos[animRod].y-rods[0].length*diskWidth };
            animDiskPos = {x: rodsBasePos[animRod].xm-animDiskVal*diskLen, 
                            y: rodsBasePos[animRod].y-rods[0].length*diskWidth };
            animDiskDestPos = {x: rodsBasePos[1].xm -animDiskVal*diskLen,
                            y: rodsBasePos[1].y-diskWidth};
        }
    })
})