import React from "react";
import { motion } from "framer-motion";
import { COLORS } from "../../components/common";
import { Editable, useImageOverride } from "../../components/SatelliteAdminPanel";
import introImg from "../../VictoriaSatelliteResource/Intro.png";

export default function Intro() {
    const getImageOverride = useImageOverride("victoria");
    const introBg = getImageOverride("bgIntro", introImg);
    
    return (
        <section id="victoria" className="intro-section">
            {/* 大标题 */}
            <motion.header 
                className="about-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <motion.span 
                    className="pill"
                    whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Editable 
                        id="intro.pill" 
                        defaultText="INTRODUCTION"
                        satelliteType="victoria"
                    />
                </motion.span>
            </motion.header>

            <motion.h3
                className="vic-card-title gradient-text hover-gradient-text"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.98 }}
            >
                <Editable 
                    id="intro.title" 
                    defaultText="Are You A Student From Victoria?"
                    satelliteType="victoria"
                />
            </motion.h3>

            <div className="intro-content">
                {/* 图片 */}
                <motion.div
                    className="intro-image-container"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    whileHover={{ 
                        scale: 1.05,
                        rotate: 2,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                        transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.95 }}
                >
                    <img src={introBg} alt="Victoria Intro" className="intro-image" />
                </motion.div>

                {/* 文本框 */}
                <motion.div
                    className="vic-card glass-card"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    whileHover={{ 
                        y: -8, 
                        scale: 1.02,
                        boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
                        transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.98 }}
                >
                    <h4 className="vic-card-subtitle">
                        <Editable 
                            id="intro.subtitle" 
                            defaultText="Come and Join us"
                            satelliteType="victoria"
                        />
                    </h4>
                    <p className="vic-card-text">
                        <Editable 
                            id="intro.text1" 
                            defaultText="After the success of our Melbourne Satellite Chapter in 2022, we are continuing to expand and want to give more students the opportunity to work on a project with a world-class researcher. The BIOTech Futures Challenge in MELB will follow the same structure as NSW and International challenges so check out what's in store here."
                            satelliteType="victoria"
                        />
                    </p>
                    <p className="vic-card-text">
                        <Editable 
                            id="intro.text2" 
                            defaultText="Please note the MELB Challenge will take place before the NSW challenge so register your interest so you don't miss out. Finalists and runners-up from each Satellite Challenge will have the opportunity to fly out to Sydney to present at the Sydney Symposium."
                            satelliteType="victoria"
                        />
                    </p>
                </motion.div>
            </div>

            <style>{`
                .intro-section {
                  position: relative;
                  padding: 5rem 1.5rem;
                  text-align: center;
                  overflow: hidden;
                  background: transparent;
                }

                .vic-card-title {
                  font-size: clamp(32px, 4.6vw, 64px);
                  font-weight: 900;
                  margin-bottom: 3rem;
                  margin-top: 10px;
                  line-height: 1.2;
                }
                .gradient-text {
                  background: linear-gradient(90deg, #017151, #017151, #FFFFFF);
                  background-size: 200% 200%;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  /*animation: textGradientShift 10s ease infinite;*/
                }
                @keyframes textGradientShift {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
                
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

                /* 布局 */
                .intro-content {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 2rem;
                  position: relative;
                  z-index: 1;
                }
                @media(min-width: 900px) {
                  .intro-content {
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    gap: 3rem;
                  }
                  .intro-image-container, .vic-card {
                    flex: 1;
                  }
                }

                /* 图片样式 */
                .intro-image-container {
                  max-width: 550px;
                  transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .intro-image {
                  width: 100%;
                  height: auto;
                  border-radius: 1.5rem;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                }

                /* 文本框样式 */
                .vic-card {
                  max-width: 600px;
                  border-radius: 2rem;
                  background: rgba(255, 255, 255, 0.1);
                  backdrop-filter: blur(12px);
                  padding: 2.5rem;
                  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
                  border: 1px solid rgba(255,255,255,0.3);
                  text-align: left;
                  transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .glass-card {
                  background: rgba(255,255,255,0.10);
                  border-color: rgba(255,255,255,0.28);
                  backdrop-filter: saturate(140%) blur(8px);
                  -webkit-backdrop-filter: saturate(140%) blur(8px);
                }
                .vic-card-subtitle {
                  font-size: 22px;
                  font-weight: 700;
                  text-align: center;
                  margin-bottom: 1.5rem;
                  color: #017151;
                }
                .vic-card-text {
                  font-size: 16px;
                  line-height: 1.7;
                  color: #1f2937;
                  margin-top: 1rem;
                }
            `}</style>
        </section>
    );
}
