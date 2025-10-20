import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Editable } from "../../components/SatelliteAdminPanel";

export default function VideoPlayer (){
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-10% 0px" });

    return (
        <motion.div 
            className="video-container"
            ref={sectionRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <motion.header 
                className="video-header"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : -30 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
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
                        id="video.pill" 
                        defaultText="VIDEO"
                        satelliteType="queensland"
                    />
                </motion.span>
                <motion.h1 
                    className="page-title hover-gradient-text"
                    whileHover={{
                        scale: 1.02,
                        transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Editable 
                        id="video.title" 
                        defaultText="BIOTECH FUTURES CHALLENGE"
                        satelliteType="queensland"
                    />
                </motion.h1>
                <motion.p 
                    className="video-subtitle"
                    whileHover={{ 
                        scale: 1.01,
                        transition: { duration: 0.3 }
                    }}
                >
                    <Editable 
                        id="video.subtitle" 
                        defaultText="Watch our video to find out more"
                        satelliteType="queensland"
                    />
                </motion.p>
            </motion.header>
            <motion.div 
                className="video-wrapper"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                    opacity: inView ? 1 : 0, 
                    scale: inView ? 1 : 0.9 
                }}
                transition={{ 
                    duration: 0.8, 
                    delay: inView ? 0.3 : 0,
                    ease: "easeOut" 
                }}
                whileHover={{
                    scale: 1.02,
                    boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                    transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.98 }}
            >
                <iframe
                    src="https://www.youtube.com/embed/5n-tM9Pv0cw"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            </motion.div>

            <style>{`
        .video-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: transparent;
          padding: 20px;
          margin-top:-50px
          
         
        }
        
        .video-header {
           text-align: center;
           margin-bottom: 3rem;
           
        }

        .page-title {
          font-size: clamp(32px, 4.6vw, 64px);
                    font-weight: 800;
                    
                    line-height: 1.2;
                    color: #017151;
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

        .video-wrapper {
          width: 100%;
          max-width: 1000px;
          aspect-ratio: 16 / 9;
         
        }

        .video-wrapper iframe {
          width: 100%;
          height: 100%;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
      `}</style>
        </motion.div>
    );
};

