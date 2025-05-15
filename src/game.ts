import p5 from "p5";

interface Avatar {
  holeIndex: number;
  isLoveMatch: boolean;
  hasBeenJudged: boolean;
  feedbackEmoji: string | null;
  feedbackY: number;
  feedbackStartTime: number;
  popY: number;
  isPoppingDown: boolean;
  image: any;
}

export function loadGame() {
  const gameDuration = 5000;
  const canvasWidth = 800;
  const canvasHeight = 600;

  const holePositions = [
    { x: canvasWidth / 5, y: canvasHeight / 4 },
    { x: (2 * canvasWidth) / 5, y: canvasHeight / 4 },
    { x: (3 * canvasWidth) / 5, y: canvasHeight / 4 },
    { x: (4 * canvasWidth) / 5, y: canvasHeight / 4 }, // end of row 1
    { x: canvasWidth / 4, y: (2 * canvasHeight) / 4 },
    { x: (2 * canvasWidth) / 4, y: (2 * canvasHeight) / 4 },
    { x: (3 * canvasWidth) / 4, y: (2 * canvasHeight) / 4 }, // end of row 2
    { x: canvasWidth / 5, y: (3 * canvasHeight) / 4 },
    { x: (2 * canvasWidth) / 5, y: (3 * canvasHeight) / 4 },
    { x: (3 * canvasWidth) / 5, y: (3 * canvasHeight) / 4 },
    { x: (4 * canvasWidth) / 5, y: (3 * canvasHeight) / 4 }, // end of row 3
  ];

  let currentAvatar: Avatar | null = null;
  let score = 0;
  let gameStartTime = 0;
  let timeLeft = gameDuration;
  let isGameStarted = false;
  let isGameOver = false;
  let lastHoleIndex = -1;
  let floaters: { x: number; y: number; emoji: string }[] = [];
  let image;

  return function sketch(p5: p5) {
    p5.preload = function () {
      image = p5.loadImage("assets/gigachad.png");
    };

    p5.setup = function () {
      p5.createCanvas(canvasWidth, canvasHeight);
      spawnNewAvatar();
    };

    p5.draw = function () {
      p5.background("#f9fafb");
      drawHoles();

      if (!isGameStarted) {
        displayPopoverWithText(
          "Swipe left (A) or right (D) to find your soulmate. No way to tell who will ghost you — just like real life. Good luck! 🤪 \n\nPress (S) to start"
        );
      }

      if (isGameStarted) {
        drawAvatar();
        displayScore();
        displayTimer();

        if (shouldEndGame()) {
          isGameOver = true;
          currentAvatar = null;
          p5.noLoop(); // end game
          let gameOverText =
            score > 0
              ? " 💖💕💖 WOOT WOOT, YOU JUST MIGHT FIND LOVE! 💖💕💖\n\nNot happy with your matches?? Typical 🙄 Press (S) to get back on the dating apps"
              : "OOPS, GHOSTED! 👻💀☠️\n\nIt's tough in these streets 😞 Want to try your hand at love again? Press (S) to replay";
          displayPopoverWithText(gameOverText);
        }
      }
    };

    p5.keyPressed = function () {
      const pressedKey = p5.key.toLowerCase();

      if (pressedKey === "s") {
        if (!isGameStarted) {
          startGame();
          return;
        } else if (isGameOver) {
          resetGame();
          startGame();
          return;
        }
      }

      if (!currentAvatar || currentAvatar.hasBeenJudged || isGameOver) return;

      const correctKey = currentAvatar.isLoveMatch ? "d" : "a";
      if (pressedKey === "a" || pressedKey === "d") {
        if (pressedKey === correctKey) {
          score++;
          currentAvatar.feedbackEmoji = "✅";
        } else {
          score--;
          currentAvatar.feedbackEmoji = "❌";
        }
        currentAvatar.feedbackStartTime = p5.millis();
        currentAvatar.hasBeenJudged = true;
        currentAvatar.isPoppingDown = true;

        setTimeout(spawnNewAvatar, 300);
      }
    };

    function shouldEndGame() {
      return !isGameOver && timeLeft <= 0;
    }

    function drawAvatar() {
      if (currentAvatar) {
        const avatarPosition = holePositions[currentAvatar.holeIndex];
        p5.image(
          currentAvatar.image,
          avatarPosition.x - 30,
          avatarPosition.y - 60
        );

        if (currentAvatar.isPoppingDown) {
          currentAvatar.popY = p5.lerp(currentAvatar.popY, 0, 0.2);
        } else {
          currentAvatar.popY = 30;
        }

        if (currentAvatar.feedbackEmoji) {
          const timeSince = p5.millis() - currentAvatar.feedbackStartTime;
          const yOffset = p5.map(timeSince, 0, 500, 0, -30);
          p5.textAlign(p5.CENTER, p5.CENTER);
          p5.textSize(32);
          p5.text(
            currentAvatar.feedbackEmoji,
            avatarPosition.x,
            avatarPosition.y - currentAvatar.popY + yOffset
          );
        }

        if (!shouldEndGame()) {
          const targetEmoji = score > 0 ? "💕" : "👻";
          if (p5.frameCount % 8 === 0) {
            floaters.push({
              x: p5.random(0, canvasWidth),
              y: canvasHeight + 20,
              emoji: targetEmoji,
            });
          }

          for (let i = floaters.length - 1; i >= 0; i--) {
            const floater = floaters[i];
            floater.y -= 3; // Moves up 3 pixels per frame
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.textSize(24);
            p5.text(floater.emoji, floater.x, floater.y);

            if (floater.y < -30) {
              floaters.splice(i, 1);
            }
          }
        }
      }
    }

    function drawHoles() {
      for (const pos of holePositions) {
        p5.fill(0);
        p5.ellipse(pos.x, pos.y, 90, 45);
      }
    }

    function startGame() {
      isGameStarted = true;
      isGameOver = false;
      gameStartTime = p5.millis();
    }

    function resetGame() {
      score = 0;
      timeLeft = gameDuration;
      spawnNewAvatar();
      p5.loop();
    }

    function displayTimer() {
      timeLeft = Math.max(0, gameDuration - (p5.millis() - gameStartTime));
      p5.textAlign(p5.RIGHT, p5.TOP);
      p5.text(`Time: ${(timeLeft / 1000).toFixed(1)}s`, canvasWidth - 10, 10);
    }

    function displayScore() {
      p5.fill("#111827");
      p5.textAlign(p5.LEFT, p5.TOP);
      p5.textSize(16);
      p5.text(`Matches: ${score}`, 10, 10);
    }

    function displayPopoverWithText(text: string) {
      p5.noStroke();
      p5.fill("#fff");
      p5.rect(
        canvasWidth / 5,
        canvasWidth / 5,
        (3 * canvasWidth) / 5,
        (2 * canvasWidth) / 5 - 30
      );

      p5.textSize(20);
      p5.fill("#d04035");
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.text(
        text,
        canvasWidth / 5 + 30,
        canvasWidth / 5,
        (3 * canvasWidth) / 5 - 60,
        (2 * canvasWidth) / 5 - 30
      );
    }

    function spawnNewAvatar(): void {
      let randomIndex: number;
      do {
        randomIndex = p5.floor(p5.random(holePositions.length));
      } while (randomIndex === lastHoleIndex);
      lastHoleIndex = randomIndex;

      const isLoveMatch = p5.random() < 0.5;
      currentAvatar = {
        holeIndex: randomIndex,
        isLoveMatch,
        hasBeenJudged: false,
        feedbackEmoji: null,
        feedbackY: 0,
        feedbackStartTime: 0,
        popY: 30,
        isPoppingDown: false,
        image,
      };
    }
  };
}
