import React from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Editable } from "../../components/SatelliteAdminPanel";
import finjaImg from "../../QueenslandSatelliteResource/finja.png";
import epariImg from "../../QueenslandSatelliteResource/epari.png";
import lukeImg from "../../QueenslandSatelliteResource/luke.png";
import alirezaImg from "../../QueenslandSatelliteResource/alireza.png";
import adiImg from "../../QueenslandSatelliteResource/adi.png";
import alyssaImg from "../../QueenslandSatelliteResource/alyssa.png";
import mikaelaImg from "../../QueenslandSatelliteResource/mikaela.png";
import rohanImg from "../../QueenslandSatelliteResource/rohan.png";
import stephanieImg from "../../QueenslandSatelliteResource/stephanie.png";
import swathiImg from "../../QueenslandSatelliteResource/swathi.png";
import thayathiniImg from "../../QueenslandSatelliteResource/thayathini.png";
import graceImg from "../../QueenslandSatelliteResource/grace.png";
import lewenImg from "../../QueenslandSatelliteResource/lewen.png";

const mentors = [
    { name: "Finja Joerg", role: "Industry, Galemics", desc: "Biomaterial research and development", img: finjaImg, link: "https://www.linkedin.com/in/finja-joerg-672237248/?utm_source=share&original_referer=&utm_content=profil&utm_campaign=share_via&utm_medium=member_mweb&originalSubdomain=au" },
    { name: "Associate Professor Devakar Epari", role: "Associate Professor", desc: "Biomedical Engineering", img: epariImg, link: "https://www.qut.edu.au/about/our-people/academic-profiles/d.epari" },
    { name: "Luke Hipwood", role: "PhD Student", desc: "Biomaterial-based tissue engineering", img: lukeImg, link: "https://www.linkedin.com/in/luke-hipwood-329a19172/" },
    { name: "Alireza Mahavapoor", role: "Affiliate PhD", desc: "Biomechanical Engineering", img: alirezaImg, link: "https://www.linkedin.com/in/alireza-mahavarpoor-a51052233/" },
    { name: "Dr Adi Idris", role: "Post-doctoral Research Fellow", desc: "Viral immunology and antiviral therapies", img: adiImg, link: "https://www.qut.edu.au/about/our-people/academic-profiles/a2.idris" },
    { name: "Alyssa Detterman", role: "M.Sc. Student", desc: "Medical Biotechnology", img: alyssaImg, link: "https://www.linkedin.com/in/alyssa-detterman/" },
    { name: "Mikaela Westlake", role: "PhD Student", desc: "Medical Engineering", img: mikaelaImg, link: "https://www.qut.edu.au/about/our-people/academic-profiles/a2.idris" },
    { name: "Rohan Mathias", role: "Industry", desc: "Mechatronics Engineer", img: rohanImg, link: "https://www.linkedin.com/in/rohanmathias/" },
    { name: "Stephanie Michelena Tupiza", role: "PhD Student", desc: "Tissue Engineering", img: stephanieImg, link: "https://www.linkedin.com/in/stephanie-michelena-76a6931a2/" },
    { name: "Swathi Jayaraman", role: "MPhil Student", desc: "Biomedical/Medical Engineering", img: swathiImg, link: "https://www.qut.edu.au/about/our-people/academic-profiles/a2.idris" },
    { name: "Thayathini Ayyachi", role: "PhD Student", desc: "Biomaterials Research", img: thayathiniImg, link: "https://www.linkedin.com/in/thayanithi-ayyachi/" },
    { name: "Grace Wengjing Gao", role: "Postdoctoral Fellow", desc: "siRNA Therapeutics for respiratory diseases", img: graceImg, link: "https://www.linkedin.com/in/wenqing-gao-465aa4287/" },
    { name: "Lewen Holloway", role: "PhD Student", desc: "Medical Engineering", img: lewenImg, link: "https://www.linkedin.com/in/lewen-holloway-35a739122/" },
];

export default function Mentors() {
    const sectionRef = React.useRef<HTMLDivElement | null>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-10% 0px" });

    return (
        <section id="mentors" className="mentors-section" ref={sectionRef}>
            <div className="animated-bg"></div>

            <div className="btf-container">
                {/* Header */}
                <motion.header 
                    className="mentor-header"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : -30 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="pill-wrapper">
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
                                id="mentor.pill" 
                                defaultText="MENTORS"
                                satelliteType="queensland"
                            />
                        </motion.span>
                    </div>
                    <motion.h2
                        className="mentor-title hover-gradient-text"
                        whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Editable 
                            id="mentor.title" 
                            defaultText="MEET OUR 2025 MENTORS"
                            satelliteType="queensland"
                        />
                    </motion.h2>
                    <motion.p 
                        className="mentor-sub-title"
                        whileHover={{ 
                            scale: 1.01,
                            transition: { duration: 0.3 }
                        }}
                    >
                        <Editable 
                            id="mentor.subtitle" 
                            defaultText="Click on each mentor to find out more"
                            satelliteType="queensland"
                        />
                    </motion.p>
                </motion.header>

                {/* Mentor Grid */}
                <div className="mentor-grid">
                    {mentors.map((m, index) => (
                        <motion.div
                            key={m.name}
                            className="mentor-card-wrapper"
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ 
                                opacity: inView ? 1 : 0, 
                                y: inView ? 0 : 50, 
                                scale: inView ? 1 : 0.9 
                            }}
                            transition={{ 
                                duration: 0.6, 
                                delay: inView ? index * 0.1 : 0, 
                                ease: "easeOut" 
                            }}
                            whileHover={{ 
                                scale: 1.05,
                                y: -8,
                                transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                to={m.link}
                                className="mentor-card"
                            >
                                <div className="mentor-img-container">
                                    <img src={m.img} alt={m.name} />
                                </div>
                                <h3 className="mentor-gradient-text">{m.name}</h3>
                                <p className="mentor-role">{m.role}</p>
                                <p className="mentor-desc">{m.desc}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style>{`
                .mentors-section {
                    position: relative;
                    overflow: hidden;
                    padding: 6rem 1.5rem;
                }

                .animated-bg {
                    position: absolute;
                    inset: 0;
                    background: transparent;
                    z-index: 0;
                }

                .btf-container {
                    position: relative;
                    z-index: 10; /* 确保 header 和卡片在背景之上 */
                }

                /* Header */
                .mentor-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }
                .pill-wrapper {
                    margin-bottom: 0.5rem;
                }
                .mentor-title {
                    font-size: clamp(32px, 4.6vw, 64px);
                    font-weight: 800;
                    margin-bottom: 1rem;
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
                .mentor-sub-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: 3rem;
                    color: #174243;
                }

                /* Mentor Grid: Flex 布局 + 最后一行居中 */
                .mentor-grid {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 2rem;
                }

                /* Mentor Card Wrapper */
                .mentor-card-wrapper {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                }

                /* 响应式卡片宽度 */
                @media (max-width: 639px) { 
                    .mentor-card-wrapper { width: calc(50% - 1rem); }
                    .mentor-card { width: 100%; }
                }
                @media (min-width: 640px) { 
                    .mentor-card-wrapper { width: calc(33.333% - 1.333rem); }
                    .mentor-card { width: 100%; }
                }
                @media (min-width: 768px) { 
                    .mentor-card-wrapper { width: calc(25% - 5rem); }
                    .mentor-card { width: 100%; }
                }

                /* Mentor Card */
                .mentor-card {
                    text-align: center;
                    padding: 1rem;
                    border-radius: 1.5rem;
                    background: #FFFFFF;
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(0,0,0,0.1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    transition: box-shadow 0.3s ease;
                    text-decoration: none;
                    color: inherit;
                    display: block;
                    height: 100%;
                }
                .mentor-card:hover {
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                }

                /* Image Container - 响应式调整 */
                .mentor-img-container {
                    width: 100%;
                    max-width: 14rem;
                    height: 12rem;
                    margin: 0 auto 0.75rem auto;
                    border-radius: 1.5rem;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                    transition: transform 0.5s ease;
                }
                .mentor-img-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .mentor-card:hover .mentor-img-container {
                    transform: scale(1.05) rotate(1deg);
                }

                /* 响应式图片容器调整 */
                @media (max-width: 639px) { 
                    .mentor-img-container { 
                        max-width: 8rem; 
                        height: 8rem; 
                    }
                }
                @media (min-width: 640px) and (max-width: 767px) { 
                    .mentor-img-container { 
                        max-width: 10rem; 
                        height: 10rem; 
                    }
                }
                @media (min-width: 768px) { 
                    .mentor-img-container { 
                        max-width: 12rem; 
                        height: 10rem; 
                    }
                }

                /* Text */
                .mentor-gradient-text {
                    margin-top: 0.5rem;
                    font-weight: 600;
                    font-size: 15px;
                    transition: color 0.3s ease;
                    color: #000000;
                }
                .mentor-card:hover .mentor-gradient-text {
                    color: #017151;
                }
                .mentor-role {
                    font-size: 0.875rem;
                    color: #4b5563;
                    margin: 0.25rem 0 0.125rem 0;
                }
                .mentor-desc {
                    font-size: 0.75rem;
                    color: #4b5563;
                    margin: 0;
                }
            `}</style>
        </section>
    );
}
