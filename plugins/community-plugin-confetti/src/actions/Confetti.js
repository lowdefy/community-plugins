import JSConfetti from 'js-confetti';

async function Confetti({ params }) {
    const jsConfetti = new JSConfetti();
    const { emojis = ['🌈', '⚡️'], confettiRadius = 3, confettiNumber = 50, emojiSize = 10, confettiColors= [
        '#ff0a54', '#ff477e'] } = params;
    jsConfetti.addConfetti({
    emojis,
    confettiRadius,
    confettiNumber,
    emojiSize,
    confettiColors
    });
}

export default Confetti;
