import JSConfetti from 'js-confetti';

async function Confetti({ params = {} }) {
  const jsConfetti = new JSConfetti();
  const { emojis, confettiRadius, confettiNumber, emojiSize, confettiColors } = params;
  jsConfetti.addConfetti({
    emojis,
    confettiRadius,
    confettiNumber,
    emojiSize,
    confettiColors,
  });
}

export default Confetti;
