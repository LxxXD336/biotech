import React from "react";
import { motion } from "framer-motion";
import { Container } from "../../components/common";
import { Editable, useImageOverride } from "../../components/SatelliteAdminPanel";
import heroImg from "../../VictoriaSatelliteResource/Hero.png";

// 单个字符动画（保留空格）
const letterAnimation = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
};

// 父容器用于错落动画
const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.03 } },
};


export default function Hero() {
    const getImageOverride = useImageOverride("victoria");
    const heroBg = getImageOverride("bgHero", heroImg);
    
    return (
        <section className="vic-section">
            <motion.div
                className="vic-bg"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1.3 }}
                transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            >
                <img src={heroBg} alt="Victoria Chapter Background" className="vic-bg-img" />
                <div className="vic-overlay" />
            </motion.div>

            <Container className="vic-container">
                <motion.div
                    key="vic"
                    className="vic-header"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <motion.p 
                        className="vic-tagline hover-gradient-text" 
                        variants={staggerContainer}
                        whileHover={{ 
                            scale: 1.05,
                            transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Editable 
                            id="hero.tagline" 
                            defaultText="THE BIOTECH FUTURES CHALLENGE WILL TAKE PLACE IN VIC"
                            satelliteType="victoria"
                        />
                    </motion.p>

                    <motion.h2 
                        className="vic-title hover-gradient-text" 
                        variants={staggerContainer}
                        whileHover={{ 
                            scale: 1.02,
                            transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Editable 
                            id="hero.title" 
                            defaultText="VICTORIA CHAPTER"
                            satelliteType="victoria"
                        />
                    </motion.h2>

                    <motion.div 
                        className="vic-subtitle" 
                        variants={staggerContainer}
                        whileHover={{ 
                            scale: 1.03,
                            y: -4,
                            boxShadow: "0 12px 24px rgba(0,0,0,0.2)",
                            transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Editable 
                            id="hero.subtitle" 
                            defaultText="The Challenge in Victoria has now started. Good luck to our participating teams and mentors!"
                            satelliteType="victoria"
                        />
                    </motion.div>
                </motion.div>
            </Container>

            <style>{`
                .vic-section { position: relative; overflow: hidden; background: transparent}
                .vic-bg { position: absolute; inset: 0; }
                .vic-bg-img { width: 100%; height: 100%; object-fit: cover; opacity: 1; }
                .vic-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.4), rgba(255,255,255,0.85)); }
                .vic-container { position: relative; padding-top: 7rem; padding-bottom: 9rem; margin-bottom: auto; color: white; text-align: center; }
                .vic-tagline { text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; font-size: 16px; background: linear-gradient(to right, #FFFFFF, #A7DEA0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 3px 8px rgba(0,0,0,0.3); margin-bottom: 0.5rem; }
                .vic-title { margin-top: 1rem; font-size: clamp(32px,4.6vw,70px); font-weight: 900; color: #A7DEA0; text-shadow: 0 3px 8px rgba(0,0,0,0.3); }
                
                /* 悬停渐变色动画 */
                .hover-gradient-text {
                    background-size: 200% 200%;
                    transition: background-position 0.6s ease;
                }
                .hover-gradient-text:hover {
                    background: linear-gradient(45deg, #A7DEA0, #017151, #5EA99E, #A7DEA0);
                    background-size: 300% 300%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: gradientShift 2s ease infinite;
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .vic-subtitle { font-size: 16px; line-height: 1.6; max-width: 70ch; margin: 50px auto 0; padding: 1rem 1.5rem; background: rgba(255,255,255,0.10); backdrop-filter: saturate(140%) blur(8px); -webkit-backdrop-filter: saturate(140%) blur(8px); border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); color: #1f2937; text-align: center; transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .vic-subtitle:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.3); }
            `}</style>
        </section>
    );
}
