import { motion } from "framer-motion";

const letterVariants = {
    hidden: { x: "100%", opacity: 0 },
    show: {
        x: 0, opacity: 1,
        transition: { type: "spring", stiffness: 100, damping: 5, mass: 1.2 }
    }
};

const wordVariants = (delay = 0) => ({
    hidden: { opacity: 1 },
    show: {
        opacity: 1,
        transition: {
            delayChildren: delay,
            staggerChildren: 0.05
        }
    }
});

export default function LetterSlide({ text, delay = 0, className }) {
    return (
        <motion.span
            className={className}
            variants={wordVariants(delay)}
            initial="hidden"
            animate="show"
            style={{ display: "inline-block", whiteSpace: "pre" }}
        >
            {text.split("").map((ch, i) => (
                <motion.span
                    key={i}
                    variants={letterVariants}
                    style={{ display: "inline-block" }}
                >
                    {ch}
                </motion.span>
            ))}
        </motion.span>
    );
}
