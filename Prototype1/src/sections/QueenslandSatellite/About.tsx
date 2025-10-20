import React, { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Editable, useImageOverride } from "../../components/SatelliteAdminPanel";
import aboutImg from "../../QueenslandSatelliteResource/About.png";

const cards = [
    {
        title: "QLD Challenge Overview",
        icon: "🏆",
        content: (
            <>
                The Queensland BIOTech Futures Challenge is hosted by the{" "}
                <a
                    href="https://jointbiomechanics.org/"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#017151", textDecoration: "underline" }}
                >
                    ARC Training Centre for Joint Biomechanics
                </a>{" "}
                at QUT in Brisbane, Australia in conjunction with QUT’s STEM High School
                Engagement program.
            </>
        ),
        extra: `Even though our Centre is focused on medical technologies, the QLD BIOTech Futures Challenge will include a wide range of project topics and mentors from varying STEM fields.`,
        gradientClass: "about-gradient1",
    },
    {
        title: "Our Mission",
        icon: "🎯",
        content: (
            <>
                The ARC Training Centre for Joint Biomechanics brings together leading
                researchers, surgeons and medical device companies to train the next
                generation workforce in biomedical technologies and to actively transform
                the orthopaedic industry through innovative new solutions.
            </>
        ),
        extra: `We tackle clinical- and industry-focused challenges in biomechanics with the goal to drive surgical practice towards personalised treatment and better patient outcomes. Our team is developing tools for surgical planning, robotic simulation, medical device assessment, and personalised post-surgical assessment.`,
        gradientClass: "about-gradient2",
    },
    {
        title: "Our Expertise",
        icon: "🔬",
        content: (
            <>
                The expertise of our team is spread over three leading Australian
                universities, and numerous international university and industry partners.
            </>
        ),
        extra: "We are developing technologies such as software tools for pre-surgical planning and decision making, computer simulation systems, robotic systems for surgical training and simulation, medical device assessment and surgical assistants, and personalised post-surgical assessment tools. Our team have experience in fields ranging from cell and tissue culture to robotic vision to wearable sensors.",
        gradientClass: "about-gradient3",
    },
];

export default function About() {
    const [expanded, setExpanded] = useState({});
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-10% 0px" });
    const getImageOverride = useImageOverride("queensland");
    const aboutBg = getImageOverride("bgAbout", aboutImg);

    const toggleExpand = (index) => {
        setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <section className="about-section" ref={sectionRef}>
            <style>{`
        .about-section {
          padding: 5rem 2rem;
          background: transparent;
        }
        .about-layout {
          display: flex;
          flex-direction: column;
          gap: 3rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media(min-width: 992px) {
          .about-layout {
            flex-direction: row;
            align-items: flex-start;
            gap: 3rem;
          }
          .about-left, .about-cards {
            flex: 1; /* 左右等宽 */
          }
        }

        /* 左边：标题 + 图片 + 按钮 */
        .about-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2rem;
        }
        .about-title {
          font-size: clamp(32px, 4vw, 64px);
          font-weight: 900;
          color: #017151;
          line-height: 1.2;
          margin-top:-20px;
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
        .about-image-container {
          width: 100%;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .about-image {
          width: 100%;
          height: auto;
          border-radius: 1.2rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .about-image-container:hover {
          transform: scale(1.05);
          box-shadow: 0 15px 35px rgba(0,0,0,0.25);
        }

        /* read more */
        .about-readmore {
          margin-top: 1rem;
        }
        .about-readmore-btn {
          display: inline-block;
          background: #ffffff;
          color: #017151;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          text-align: center;
          transition: transform 0.2s;
        }
        .about-readmore-btn:hover {
          transform: scale(1.05);
        }

        /* 右边：卡片区 */
        .about-cards {
          display: grid;
          gap: 2rem;
        }
        .about-card {
          padding: 1.8rem;
          border-radius: 16px;
          color: #174243;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.4s ease;
        }
        .about-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.15);
        }
        .about-gradient1 {
          background: radial-gradient(circle, #FFFFFF, #5EA99E);
        }
        .about-gradient2 {
          background: radial-gradient(circle, #FFFFFF, #A7DEA0);
        }
        .about-gradient3 {
          background: radial-gradient(#FFFFFF, #F1E5A6);
        }
        .about-card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .about-card-icon {
          font-size: 1.6rem;
        }
        .about-card-content,
        .about-card-extra {
          line-height: 1.6;
          margin-bottom: 0.75rem;
        }
        .about-card-extra {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: all 0.5s ease;
        }
        .about-card-extra.expanded {
          max-height: 500px;
          opacity: 1;
        }
        .about-card-btn {
          margin-top: 0.5rem;
          background: #ffffff;
          border: none;
          color: #017151;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .about-card-btn:hover {
          transform: scale(1.05);
        }
       
       
      `}</style>

            <div className="about-layout">
                {/* 左边：标题 + 图片 + 按钮 */}
                <motion.div 
                    className="about-left"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -50 }}
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
                            id="about.pill" 
                            defaultText="QLD CHALLENGE"
                            satelliteType="queensland"
                        />
                    </motion.span>
                    <motion.h2 
                        className="about-title hover-gradient-text"
                        whileHover={{ 
                            scale: 1.02,
                            transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Editable 
                            id="about.title" 
                            defaultText="ABOUT THE QLD CHALLENGE"
                            satelliteType="queensland"
                        />
                    </motion.h2>
                    <motion.div 
                        className="about-image-container"
                        whileHover={{ 
                            scale: 1.05,
                            rotate: 2,
                            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
                            transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <img src={aboutBg} alt="About Queensland Challenge" className="about-image"/>
                    </motion.div>
                    <motion.div 
                        className="about-readmore"
                        whileHover={{ 
                            scale: 1.05,
                            transition: { duration: 0.3 }
                        }}
                    >
                        <motion.a
                            href="https://jointbiomechanics.org/"
                            target="_blank"
                            rel="noreferrer"
                            className="about-readmore-btn"
                            whileHover={{ 
                                scale: 1.1,
                                boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                                transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Read More &gt;
                        </motion.a>
                    </motion.div>
                </motion.div>

                {/* 右边：卡片 */}
                <motion.div 
                    className="about-cards"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : 50 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {cards.map((card, index) => (
                        <motion.div 
                            key={index} 
                            className={`about-card ${card.gradientClass}`}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ 
                                opacity: inView ? 1 : 0, 
                                y: inView ? 0 : 50, 
                                scale: inView ? 1 : 0.9 
                            }}
                            transition={{ 
                                duration: 0.6, 
                                delay: inView ? index * 0.2 : 0, 
                                ease: "easeOut" 
                            }}
                            whileHover={{ 
                                y: -8,
                                scale: 1.02,
                                boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
                                transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <h3 className="about-card-title">
                                <span className="about-card-icon">{card.icon}</span>
                                <Editable 
                                    id={`about.card${index + 1}.title`} 
                                    defaultText={card.title}
                                    satelliteType="queensland"
                                />
                            </h3>
                            <p className="about-card-content">
                                <Editable 
                                    id={`about.card${index + 1}.content`} 
                                    defaultText={typeof card.content === 'string' ? card.content : 
                                        index === 0 ? "The Queensland BIOTech Futures Challenge is hosted by the ARC Training Centre for Joint Biomechanics at QUT in Brisbane, Australia in conjunction with QUT's STEM High School Engagement program." :
                                        index === 1 ? "The ARC Training Centre for Joint Biomechanics brings together leading researchers, surgeons and medical device companies to train the next generation workforce in biomedical technologies and to actively transform the orthopaedic industry through innovative new solutions." :
                                        "The expertise of our team is spread over three leading Australian universities, and numerous international university and industry partners."
                                    }
                                    satelliteType="queensland"
                                />
                            </p>
                            {card.extra && (
                                <>
                                    <p className={`about-card-extra ${expanded[index] ? "expanded" : ""}`}>
                                        <Editable 
                                            id={`about.card${index + 1}.extra`} 
                                            defaultText={card.extra}
                                            satelliteType="queensland"
                                        />
                                    </p>
                                    <button
                                        className="about-card-btn"
                                        onClick={() => toggleExpand(index)}
                                    >
                                        {expanded[index] ? "Show Less ▲" : "Show More ▼"}
                                    </button>
                                </>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
